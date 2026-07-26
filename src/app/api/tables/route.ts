import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { layoutVersions, tables, orders, reservations, orderItems } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, inArray, gte, lte } from 'drizzle-orm';

async function getActiveLayoutVersionId() {
  const [activeLayout] = await db.select().from(layoutVersions).where(eq(layoutVersions.isActive, true)).limit(1);
  if (activeLayout) return activeLayout.id;
  
  // If no active layout, fetch any layout
  const [anyLayout] = await db.select().from(layoutVersions).limit(1);
  if (anyLayout) return anyLayout.id;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const layoutVersionId = await getActiveLayoutVersionId();
    if (!layoutVersionId) {
      return NextResponse.json([]);
    }

    const allTables = await db.select().from(tables).where(eq(tables.layoutVersionId, layoutVersionId));
    const tableIds = allTables.map(t => t.id);

    // Active orders
    const activeOrders = tableIds.length > 0 ? await db.select().from(orders).where(
      and(
        inArray(orders.tableId, tableIds),
        inArray(orders.status, ['pending_payment', 'verifying', 'preparing', 'ready'])
      )
    ) : [];

    // Active/upcoming reservations
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

    const enrichedTables = allTables.map(table => {
      let liveStatus = table.status;
      let currentOrder = null;
      let currentReservation = null;

      const tableOrder = activeOrders.find(o => o.tableId === table.id);
      if (tableOrder) {
        currentOrder = {
          id: tableOrder.id,
          orderNumber: tableOrder.orderNumber,
          status: tableOrder.status,
          totalAmount: tableOrder.totalAmount,
        };
        if (liveStatus !== 'out_of_service' && liveStatus !== 'cleaning') {
          liveStatus = 'occupied';
        }
      }

      const tableRes = activeReservations.find(r => r.tableId === table.id);
      if (tableRes) {
        currentReservation = {
          id: tableRes.id,
          customerName: tableRes.customerName,
          reservationTime: tableRes.reservationTime,
          guestCount: tableRes.guestCount,
          status: tableRes.status,
        };
        if (!currentOrder && liveStatus !== 'out_of_service' && liveStatus !== 'cleaning') {
          if (tableRes.status === 'seated') {
            liveStatus = 'occupied';
          } else {
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

    return NextResponse.json(enrichedTables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, capacity, shape, x, y, width, height, rotation, notes, layoutVersionId: paramLayoutId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
    }

    let layoutId = paramLayoutId || await getActiveLayoutVersionId();
    if (!layoutId) {
      // Create a default layout if none exists
      const [newLayout] = await db.insert(layoutVersions).values({
        name: 'Main Dining Room',
        isActive: true,
        canvasSettings: JSON.stringify({ gridSpacing: 20, snapToGrid: true, width: 1200, height: 800 }),
      }).returning();
      layoutId = newLayout.id;
    }

    const qrCodeSecret = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const [newTable] = await db.insert(tables).values({
      layoutVersionId: layoutId,
      name,
      capacity: capacity || 2,
      shape: shape || 'round',
      x: x !== undefined ? x : 500,
      y: y !== undefined ? y : 500,
      width: width || 100,
      height: height || 100,
      rotation: rotation || 0,
      notes: notes || null,
      qrCode: qrCodeSecret,
      status: 'available',
    }).returning();

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
