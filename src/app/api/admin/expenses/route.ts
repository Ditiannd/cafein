import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { desc, gte, lte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const conditions = [];

    if (startDate) {
      conditions.push(gte(expenses.date, new Date(startDate)));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      conditions.push(lte(expenses.date, end));
    }

    const result = await db.select().from(expenses)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expenses.date));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Expenses list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { description, amount, category, date } = body;

    if (!description || !amount) {
      return NextResponse.json({ error: 'Description and amount are required' }, { status: 400 });
    }

    const [created] = await db.insert(expenses).values({
      description,
      amount: parseInt(amount),
      category: category || null,
      date: date ? new Date(date) : new Date(),
      recordedById: session.userId,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Expense create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
