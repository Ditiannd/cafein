import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, catalogItems, promotions, tables } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc, and, gte, lt, sql } from 'drizzle-orm';

function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      source,
      items,
      paymentMethod,
      paymentProofUrl,
      customerName,
      orderType,
      tableNumber,
      tableId,
      amountPaid,
    } = body;

    if (!source || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Source and items are required' }, { status: 400 });
    }

    // Get session for POS orders (optional for online)
    const session = await getSession();
    
    // Fetch catalog items to calculate prices server-side
    const itemIds = items.map((i: { catalogItemId: number }) => i.catalogItemId);
    const catalogData = await db.select({
      id: catalogItems.id,
      price: catalogItems.price,
      promotionDiscountType: promotions.discountType,
      promotionDiscountValue: promotions.discountValue,
    })
    .from(catalogItems)
    .leftJoin(promotions, eq(catalogItems.id, promotions.catalogItemId))
    .where(sql`${catalogItems.id} IN (${sql.join(itemIds.map((id: number) => sql`${id}`), sql`, `)})`);

    const priceMap = new Map(catalogData.map(c => [c.id, c]));

    // Calculate totals server-side
    let subtotal = 0;
    let discountTotal = 0;
    const processedItems: Array<{
      catalogItemId: number;
      quantity: number;
      unitPrice: number;
      iceLevel?: string;
      sugarLevel?: string;
      milkType?: string;
    }> = [];

    for (const item of items) {
      const catalogItem = priceMap.get(item.catalogItemId);
      if (!catalogItem) continue;

      const unitPrice = catalogItem.price;
      subtotal += unitPrice * item.quantity;

      // Calculate discount
      if (catalogItem.promotionDiscountType && catalogItem.promotionDiscountValue) {
        if (catalogItem.promotionDiscountType === 'fixed') {
          discountTotal += catalogItem.promotionDiscountValue * item.quantity;
        } else {
          discountTotal += Math.round((unitPrice * catalogItem.promotionDiscountValue / 100)) * item.quantity;
        }
      }

      processedItems.push({
        catalogItemId: item.catalogItemId,
        quantity: item.quantity,
        unitPrice,
        iceLevel: item.iceLevel,
        sugarLevel: item.sugarLevel,
        milkType: item.milkType,
      });
    }

    const afterDiscount = subtotal - discountTotal;
    const tax = Math.round(afterDiscount * 0.11);
    const totalAmount = afterDiscount + tax;
    const changeGiven = paymentMethod === 'cash' && amountPaid ? Math.max(0, amountPaid - totalAmount) : null;

    // Resolve tableId from tableNumber if tableId is not explicitly provided
    let resolvedTableId = tableId || null;
    if (!resolvedTableId && tableNumber) {
      const [matchedTable] = await db.select().from(tables).where(eq(tables.name, tableNumber)).limit(1);
      if (matchedTable) {
        resolvedTableId = matchedTable.id;
      }
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const [order] = await db.insert(orders).values({
      orderNumber,
      source,
      status: source === 'pos' ? 'completed' : 'pending_payment',
      customerName: customerName || null,
      orderType: orderType || 'dine_in',
      tableNumber: tableNumber || null,
      tableId: resolvedTableId,
      subtotal,
      discountTotal,
      tax,
      totalAmount,
      paymentMethod: paymentMethod || null,
      amountPaid: amountPaid || null,
      changeGiven,
      paymentProofUrl: paymentProofUrl || null,
      createdById: session?.userId || null,
    }).returning();

    // Automatically synchronize table status to occupied for dine-in orders assigned to a table
    if (resolvedTableId && (orderType === 'dine_in' || !orderType || orderType === 'Dine In')) {
      await db.update(tables).set({ status: 'occupied', updatedAt: new Date() }).where(eq(tables.id, resolvedTableId));
    }

    // Create order items
    if (processedItems.length > 0) {
      await db.insert(orderItems).values(
        processedItems.map(item => ({
          orderId: order.id,
          ...item,
        }))
      );
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      tax: order.tax,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      amountPaid: order.amountPaid,
      changeGiven: order.changeGiven,
    }, { status: 201 });
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('date');
    const sourceFilter = searchParams.get('source');

    const conditions = [];

    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      conditions.push(gte(orders.createdAt, today));
      conditions.push(lt(orders.createdAt, tomorrow));
    }

    if (sourceFilter) {
      conditions.push(eq(orders.source, sourceFilter as 'online' | 'pos'));
    }

    const result = await db.select().from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
