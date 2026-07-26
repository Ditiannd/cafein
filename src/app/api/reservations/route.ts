import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations, tables } from '@/lib/db/schema';
import { eq, and, inArray, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('date');
    const tableIdFilter = searchParams.get('tableId');

    const conditions = [];

    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      conditions.push(gte(reservations.reservationTime, today));
      conditions.push(lte(reservations.reservationTime, tomorrow));
    } else if (dateFilter) {
      const targetDate = new Date(dateFilter);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      conditions.push(gte(reservations.reservationTime, targetDate));
      conditions.push(lte(reservations.reservationTime, nextDay));
    }

    if (tableIdFilter) {
      conditions.push(eq(reservations.tableId, tableIdFilter));
    }

    const result = await db.select({
      reservation: reservations,
      tableLabel: tables.name,
      tableCapacity: tables.capacity,
    })
    .from(reservations)
    .leftJoin(tables, eq(reservations.tableId, tables.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reservations.reservationTime));

    const formatted = result.map(r => ({
      ...r.reservation,
      tableName: r.tableLabel,
      tableCapacity: r.tableCapacity,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, customerName, customerPhone, customerEmail, reservationTime, durationMinutes, guestCount, notes } = body;

    if (!tableId || !customerName || !reservationTime) {
      return NextResponse.json({ error: 'tableId, customerName, and reservationTime are required' }, { status: 400 });
    }

    const [table] = await db.select().from(tables).where(eq(tables.id, tableId)).limit(1);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const requestedStart = new Date(reservationTime);
    const duration = durationMinutes || 90;
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    // Check for double booking against active reservations (confirmed or seated)
    const existingReservations = await db.select().from(reservations)
      .where(
        and(
          eq(reservations.tableId, tableId),
          inArray(reservations.status, ['confirmed', 'seated'])
        )
      );

    const hasConflict = existingReservations.some(res => {
      const resStart = new Date(res.reservationTime);
      const resEnd = new Date(resStart.getTime() + res.durationMinutes * 60000);
      return resStart < requestedEnd && resEnd > requestedStart;
    });

    if (hasConflict) {
      return NextResponse.json({ 
        error: 'Double booking prevented: This table is already booked during the selected time slot.',
        code: 'DOUBLE_BOOKING_CONFLICT'
      }, { status: 409 });
    }

    const [newReservation] = await db.insert(reservations).values({
      tableId,
      customerName,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      reservationTime: requestedStart,
      durationMinutes: duration,
      guestCount: guestCount || table.capacity,
      status: 'confirmed',
      notes: notes || null,
    }).returning();

    // If reservation is within 30 minutes, update table status immediately
    const now = new Date();
    const diffMins = (requestedStart.getTime() - now.getTime()) / 60000;
    if (diffMins <= 30 && diffMins >= -15 && table.status === 'available') {
      await db.update(tables).set({ status: 'reserved', updatedAt: new Date() }).where(eq(tables.id, tableId));
    }

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
