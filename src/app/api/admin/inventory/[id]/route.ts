import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, quantity, unit, minThreshold } = body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (minThreshold !== undefined) updateData.minThreshold = parseInt(minThreshold);

    const [updated] = await db.update(inventoryItems)
      .set(updateData)
      .where(eq(inventoryItems.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Inventory update error:', error);
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
    const [deleted] = await db.delete(inventoryItems)
      .where(eq(inventoryItems.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inventory delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
