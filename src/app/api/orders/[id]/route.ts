import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, catalogItems } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = await db.select({
      id: orderItems.id,
      catalogItemId: orderItems.catalogItemId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      iceLevel: orderItems.iceLevel,
      sugarLevel: orderItems.sugarLevel,
      milkType: orderItems.milkType,
      itemName: catalogItems.name,
      itemImage: catalogItems.image,
    })
    .from(orderItems)
    .leftJoin(catalogItems, eq(orderItems.catalogItemId, catalogItems.id))
    .where(eq(orderItems.orderId, id));

    return NextResponse.json({
      ...order[0],
      items,
    });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
