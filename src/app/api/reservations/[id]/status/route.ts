import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations, tables, orders } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, inArray } from 'drizzle-orm';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ['confirmed', 'seated', 'completed', 'cancelled', 'expired'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const [res] = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
    if (!res) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const [updatedRes] = await db.update(reservations).set({
      status,
      updatedAt: new Date(),
    }).where(eq(reservations.id, id)).returning();

    // Automatically synchronize table status
    if (status === 'seated') {
      await db.update(tables).set({ status: 'occupied', updatedAt: new Date() }).where(eq(tables.id, res.tableId));
    } else if (status === 'completed' || status === 'cancelled' || status === 'expired') {
      // Check if table currently has an active order
      const activeOrders = await db.select().from(orders).where(
        and(
          eq(orders.tableId, res.tableId),
          inArray(orders.status, ['pending_payment', 'verifying', 'preparing', 'ready'])
        )
      );

      if (activeOrders.length === 0) {
        await db.update(tables).set({ status: 'available', updatedAt: new Date() }).where(eq(tables.id, res.tableId));
      }
    }

    return NextResponse.json(updatedRes);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PATCH(request, { params });
}
