import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogItems } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, categoryId, image, badge, isBestSeller, isAvailable, modifierOptions } = body;

    const result = await db.update(catalogItems)
      .set({
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
        ...(image !== undefined && { image }),
        ...(badge !== undefined && { badge: badge || null }),
        ...(isBestSeller !== undefined && { isBestSeller }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(modifierOptions !== undefined && { modifierOptions }),
      })
      .where(eq(catalogItems.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Catalog update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const result = await db.delete(catalogItems)
      .where(eq(catalogItems.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Catalog delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
