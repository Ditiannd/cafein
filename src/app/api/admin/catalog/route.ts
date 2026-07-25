import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogItems } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, price, categoryId, image, badge, isBestSeller } = body;

    if (!name || !price || !image) {
      return NextResponse.json({ error: 'Name, price, and image are required' }, { status: 400 });
    }

    const result = await db.insert(catalogItems).values({
      name,
      price: parseInt(price),
      categoryId: categoryId ? parseInt(categoryId) : null,
      image,
      badge: badge || null,
      isBestSeller: isBestSeller ?? false,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Catalog create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
