import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, orders, reservations } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status, completeActiveOrders } = await request.json();

    const validStatuses = ['available', 'reserved', 'occupied', 'cleaning', 'out_of_service'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const [table] = await db.select().from(tables).where(eq(tables.id, id)).limit(1);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // If transitioning to available or cleaning, optionally complete active orders
    if (completeActiveOrders || status === 'available' || status === 'cleaning') {
      await db.update(orders)
        .set({ status: 'completed' })
        .where(
          and(
            eq(orders.tableId, id),
            inArray(orders.status, ['pending_payment', 'verifying', 'preparing', 'ready'])
          )
        );

      // Also mark seated reservations as completed
      if (status === 'available') {
        await db.update(reservations)
          .set({ status: 'completed', updatedAt: new Date() })
          .where(
            and(
              eq(reservations.tableId, id),
              eq(reservations.status, 'seated')
            )
          );
      }
    }

    // If barista clicks "Mark as Occupied" on an available table without an order yet,
    // we set status to occupied. (When orders are placed, live calculation maintains it).
    const [updated] = await db.update(tables).set({
      status,
      updatedAt: new Date(),
    }).where(eq(tables.id, id)).returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating table status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return POST(request, { params });
}
