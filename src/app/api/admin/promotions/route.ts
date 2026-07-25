import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promotions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await db.select().from(promotions);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Promotions fetch error:', error);
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
    const { catalogItemId, discountType, discountValue } = body;

    if (!catalogItemId || !discountType || !discountValue) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Upsert: delete existing promotion for this item, then insert
    await db.delete(promotions).where(eq(promotions.catalogItemId, parseInt(catalogItemId)));

    const result = await db.insert(promotions).values({
      catalogItemId: parseInt(catalogItemId),
      discountType,
      discountValue: parseInt(discountValue),
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Promotion create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
