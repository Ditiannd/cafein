import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { layoutVersions, tables, layoutObjects, orders, reservations, orderItems } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, inArray, gte, lte, desc } from 'drizzle-orm';

// Helper to get or create default layout version
async function getOrCreateActiveLayoutVersion() {
  let [activeLayout] = await db.select().from(layoutVersions).where(eq(layoutVersions.isActive, true)).limit(1);

  if (!activeLayout) {
    // Check if any layout exists
    const [existing] = await db.select().from(layoutVersions).limit(1);
    if (existing) {
      await db.update(layoutVersions).set({ isActive: true }).where(eq(layoutVersions.id, existing.id));
      activeLayout = { ...existing, isActive: true };
    } else {
      // Create default layout
      const [newLayout] = await db.insert(layoutVersions).values({
        name: 'Main Dining Room',
        isActive: true,
        canvasSettings: JSON.stringify({ gridSpacing: 20, snapToGrid: true, gridOpacity: 0.15, width: 1200, height: 800 }),
      }).returning();
      activeLayout = newLayout;

      // Seed default tables for the new layout
      const defaultTables = [
        { name: 'T1', shape: 'round' as const, capacity: 2, x: 250, y: 250, width: 90, height: 90, qrCode: `qr_${Date.now()}_t1` },
        { name: 'T2', shape: 'round' as const, capacity: 2, x: 750, y: 250, width: 90, height: 90, qrCode: `qr_${Date.now()}_t2` },
        { name: 'T3', shape: 'rectangle' as const, capacity: 4, x: 500, y: 500, width: 140, height: 90, qrCode: `qr_${Date.now()}_t3` },
        { name: 'T4', shape: 'rectangle' as const, capacity: 4, x: 250, y: 750, width: 140, height: 90, qrCode: `qr_${Date.now()}_t4` },
        { name: 'C1', shape: 'sofa' as const, capacity: 6, x: 750, y: 750, width: 160, height: 100, qrCode: `qr_${Date.now()}_c1` },
        { name: 'Bar 1', shape: 'bar_seat' as const, capacity: 1, x: 500, y: 150, width: 80, height: 80, qrCode: `qr_${Date.now()}_b1` },
      ];

      for (const t of defaultTables) {
        await db.insert(tables).values({
          layoutVersionId: activeLayout.id,
          ...t,
          status: 'available',
        });
      }
    }
  }
  return activeLayout;
}

export async function GET(request: NextRequest) {
  try {
    const activeLayout = await getOrCreateActiveLayoutVersion();

    // Fetch all tables and layout objects for this layout
    const allTables = await db.select().from(tables).where(eq(tables.layoutVersionId, activeLayout.id));
    const allObjects = await db.select().from(layoutObjects).where(eq(layoutObjects.layoutVersionId, activeLayout.id));

    // Fetch active orders for these tables
    const tableIds = allTables.map(t => t.id);
    const activeOrders = tableIds.length > 0 ? await db.select().from(orders).where(
      and(
        inArray(orders.tableId, tableIds),
        inArray(orders.status, ['pending_payment', 'verifying', 'preparing', 'ready'])
      )
    ) : [];

    // Fetch order items for active orders to attach item summaries
    const orderIds = activeOrders.map(o => o.id);
    const activeOrderItems = orderIds.length > 0 ? await db.select().from(orderItems).where(
      inArray(orderItems.orderId, orderIds)
    ) : [];

    // Fetch active/upcoming reservations (within -15 mins to +3 hours)
    const now = new Date();
    const windowStart = new Date(now.getTime() - 15 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 180 * 60 * 1000);

    const activeReservations = tableIds.length > 0 ? await db.select().from(reservations).where(
      and(
        inArray(reservations.tableId, tableIds),
        inArray(reservations.status, ['confirmed', 'seated']),
        gte(reservations.reservationTime, windowStart),
        lte(reservations.reservationTime, windowEnd)
      )
    ) : [];

    // Map live status for each table
    const enrichedTables = allTables.map(table => {
      let liveStatus = table.status;
      let currentOrder = null;
      let currentReservation = null;

      // Check active order
      const tableOrder = activeOrders.find(o => o.tableId === table.id);
      if (tableOrder) {
        const itemsForOrder = activeOrderItems.filter(i => i.orderId === tableOrder.id);
        currentOrder = {
          id: tableOrder.id,
          orderNumber: tableOrder.orderNumber,
          status: tableOrder.status,
          totalAmount: tableOrder.totalAmount,
          createdAt: tableOrder.createdAt,
          itemsCount: itemsForOrder.reduce((acc, i) => acc + i.quantity, 0),
        };
        if (liveStatus !== 'out_of_service' && liveStatus !== 'cleaning') {
          liveStatus = 'occupied';
        }
      }

      // Check active reservation
      const tableRes = activeReservations.find(r => r.tableId === table.id);
      if (tableRes) {
        currentReservation = {
          id: tableRes.id,
          customerName: tableRes.customerName,
          customerPhone: tableRes.customerPhone,
          reservationTime: tableRes.reservationTime,
          guestCount: tableRes.guestCount,
          status: tableRes.status,
        };
        if (!currentOrder && liveStatus !== 'out_of_service' && liveStatus !== 'cleaning') {
          if (tableRes.status === 'seated') {
            liveStatus = 'occupied';
          } else {
            // Check if reservation is within 30 minutes
            const diffMins = (new Date(tableRes.reservationTime).getTime() - now.getTime()) / 60000;
            if (diffMins <= 30) {
              liveStatus = 'reserved';
            }
          }
        }
      }

      return {
        ...table,
        status: liveStatus,
        currentOrder,
        currentReservation,
      };
    });

    return NextResponse.json({
      layoutVersion: activeLayout,
      tables: enrichedTables,
      layoutObjects: allObjects,
    });
  } catch (error) {
    console.error('Error fetching floor layout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Batch update layout positions and dimensions
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tables: updatedTables, layoutObjects: updatedObjects, canvasSettings } = body;

    const activeLayout = await getOrCreateActiveLayoutVersion();

    if (canvasSettings) {
      await db.update(layoutVersions)
        .set({ canvasSettings: typeof canvasSettings === 'string' ? canvasSettings : JSON.stringify(canvasSettings), updatedAt: new Date() })
        .where(eq(layoutVersions.id, activeLayout.id));
    }

    // Update tables
    if (Array.isArray(updatedTables)) {
      for (const t of updatedTables) {
        if (!t.id) continue;
        await db.update(tables).set({
          x: t.x,
          y: t.y,
          width: t.width,
          height: t.height,
          rotation: t.rotation,
          scale: t.scale || 1,
          zIndex: t.zIndex || 1,
          isLocked: t.isLocked || false,
          isHidden: t.isHidden || false,
          updatedAt: new Date(),
        }).where(eq(tables.id, t.id));
      }
    }

    // Update layout objects
    if (Array.isArray(updatedObjects)) {
      for (const obj of updatedObjects) {
        if (!obj.id) continue;
        await db.update(layoutObjects).set({
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          rotation: obj.rotation,
          scale: obj.scale || 1,
          zIndex: obj.zIndex || 1,
          isLocked: obj.isLocked || false,
          isHidden: obj.isHidden || false,
          updatedAt: new Date(),
        }).where(eq(layoutObjects.id, obj.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating floor layout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
