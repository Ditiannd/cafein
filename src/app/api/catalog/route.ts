import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogItems, categories, promotions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const items = await db.select({
      id: catalogItems.id,
      name: catalogItems.name,
      price: catalogItems.price,
      category: categories.name,
      categoryId: catalogItems.categoryId,
      image: catalogItems.image,
      badge: catalogItems.badge,
      isBestSeller: catalogItems.isBestSeller,
      isAvailable: catalogItems.isAvailable,
      modifierOptions: catalogItems.modifierOptions,
      promotionId: promotions.id,
      discountType: promotions.discountType,
      discountValue: promotions.discountValue,
    })
    .from(catalogItems)
    .leftJoin(categories, eq(catalogItems.categoryId, categories.id))
    .leftJoin(promotions, eq(catalogItems.id, promotions.catalogItemId))
    .where(eq(catalogItems.isAvailable, true));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Catalog fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
