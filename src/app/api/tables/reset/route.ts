import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, orders, reservations, layoutVersions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the active layout version
    const [activeLayout] = await db.select()
      .from(layoutVersions)
      .where(eq(layoutVersions.isActive, true))
      .limit(1);

    if (!activeLayout) {
      return NextResponse.json({ error: 'No active layout found' }, { status: 404 });
    }

    // Get all table IDs in the active layout
    const allTables = await db.select({ id: tables.id })
      .from(tables)
      .where(eq(tables.layoutVersionId, activeLayout.id));

    const tableIds = allTables.map(t => t.id);

    if (tableIds.length > 0) {
      // Complete all active orders on these tables
      await db.update(orders)
        .set({ status: 'completed' })
        .where(
          and(
            inArray(orders.tableId, tableIds),
            inArray(orders.status, ['pending_payment', 'verifying', 'preparing', 'ready'])
          )
        );

      // Complete all active reservations on these tables
      await db.update(reservations)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(
          and(
            inArray(reservations.tableId, tableIds),
            inArray(reservations.status, ['confirmed', 'seated'])
          )
        );

      // Reset all table statuses to available
      await db.update(tables)
        .set({ status: 'available', updatedAt: new Date() })
        .where(eq(tables.layoutVersionId, activeLayout.id));
    }

    return NextResponse.json({
      success: true,
      tablesReset: tableIds.length,
    });
  } catch (error) {
    console.error('Reset all tables error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
