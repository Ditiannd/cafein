import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await db.select().from(inventoryItems).orderBy(desc(inventoryItems.updatedAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Inventory list error:', error);
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
    const { name, quantity, unit, minThreshold } = body;

    if (!name || quantity === undefined || !unit) {
      return NextResponse.json({ error: 'Name, quantity, and unit are required' }, { status: 400 });
    }

    const [created] = await db.insert(inventoryItems).values({
      name,
      quantity: parseInt(quantity),
      unit,
      minThreshold: minThreshold ? parseInt(minThreshold) : 10,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Inventory create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
