import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
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
    const { name, sortOrder } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);

    const [updated] = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }
    console.error('Category update error:', error);
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
    const [deleted] = await db.delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
