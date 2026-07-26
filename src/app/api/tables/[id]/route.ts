import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, orders, reservations } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [table] = await db.select().from(tables).where(eq(tables.id, id)).limit(1);

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Get latest active order for this table
    const [latestOrder] = await db.select().from(orders)
      .where(eq(orders.tableId, id))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    // Get upcoming reservations
    const upcomingReservations = await db.select().from(reservations)
      .where(eq(reservations.tableId, id))
      .orderBy(desc(reservations.reservationTime))
      .limit(5);

    return NextResponse.json({
      ...table,
      latestOrder: latestOrder || null,
      upcomingReservations,
    });
  } catch (error) {
    console.error('Error fetching table details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db.update(tables).set({
      ...body,
      updatedAt: new Date(),
    }).where(eq(tables.id, id)).returning();

    if (!updated) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [deleted] = await db.delete(tables).where(eq(tables.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
