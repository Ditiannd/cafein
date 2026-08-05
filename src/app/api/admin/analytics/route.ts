import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, catalogItems, expenses, tables } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, sql, gte, lt, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    if (period === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // --- Revenue by Day (Income) ---
    const revenueByDay = await db.select({
      date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      dayName: sql<string>`to_char(${orders.createdAt}, 'Dy')`,
      income: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      orderCount: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startDate),
        eq(orders.status, 'completed')
      )
    )
    .groupBy(
      sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      sql`to_char(${orders.createdAt}, 'Dy')`
    )
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

    // --- Expenses by Day (Outcome) ---
    const expensesByDay = await db.select({
      date: sql<string>`to_char(${expenses.date}, 'YYYY-MM-DD')`,
      outcome: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(gte(expenses.date, startDate))
    .groupBy(sql`to_char(${expenses.date}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${expenses.date}, 'YYYY-MM-DD')`);

    // Merge income and outcome into a single dataset
    const expenseMap = new Map(expensesByDay.map(e => [e.date, Number(e.outcome)]));
    const financeData = revenueByDay.map(r => ({
      name: r.dayName,
      date: r.date,
      income: Number(r.income),
      outcome: expenseMap.get(r.date) || 0,
    }));

    // If no revenue data, build from expense data alone
    if (financeData.length === 0) {
      for (const e of expensesByDay) {
        const d = new Date(e.date);
        financeData.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: e.date,
          income: 0,
          outcome: Number(e.outcome),
        });
      }
    }

    // --- Visitor/Order Count by Hour ---
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const visitorByHour = await db.select({
      hour: sql<string>`to_char(${orders.createdAt}, 'HH24:00')`,
      visitors: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, todayStart),
        lt(orders.createdAt, todayEnd)
      )
    )
    .groupBy(sql`to_char(${orders.createdAt}, 'HH24:00')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'HH24:00')`);

    const visitorData = visitorByHour.map(v => ({
      time: v.hour,
      visitors: Number(v.visitors),
    }));

    // --- Top Selling Menu Items ---
    const topItems = await db.select({
      itemName: catalogItems.name,
      totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(catalogItems, eq(orderItems.catalogItemId, catalogItems.id))
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        gte(orders.createdAt, startDate),
        eq(orders.status, 'completed')
      )
    )
    .groupBy(catalogItems.name)
    .orderBy(desc(sql`COALESCE(SUM(${orderItems.quantity}), 0)`))
    .limit(5);

    // --- Most Used Tables ---
    const topTables = await db.select({
      tableId: orders.tableId,
      tableName: tables.name,
      orderCount: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .innerJoin(tables, eq(orders.tableId, tables.id))
    .where(
      and(
        gte(orders.createdAt, startDate),
        eq(orders.status, 'completed'),
        sql`${orders.tableId} IS NOT NULL`
      )
    )
    .groupBy(orders.tableId, tables.name)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(5);

    // --- Summary KPIs ---
    const totalRevenue = financeData.reduce((sum, d) => sum + d.income, 0);
    const totalExpenses = financeData.reduce((sum, d) => sum + d.outcome, 0);

    const totalPatrons = await db.select({
      count: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startDate),
        eq(orders.status, 'completed')
      )
    );

    return NextResponse.json({
      financeData,
      visitorData,
      topSellingItems: topItems.map(i => ({ name: i.itemName, totalSold: Number(i.totalSold) })),
      topTables: topTables.map(t => ({ name: t.tableName, orderCount: Number(t.orderCount) })),
      kpi: {
        totalRevenue,
        totalExpenses,
        patronCount: Number(totalPatrons[0]?.count || 0),
        topItem: topItems[0]?.itemName || 'N/A',
        topItemSold: Number(topItems[0]?.totalSold || 0),
        topTable: topTables[0]?.tableName || 'N/A',
        topTableOrders: Number(topTables[0]?.orderCount || 0),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
