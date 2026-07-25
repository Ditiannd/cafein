import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select().from(reviews)
      .where(eq(reviews.isVisible, true))
      .orderBy(desc(reviews.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, rating, comment, orderId } = body;

    if (!author || !rating || !comment) {
      return NextResponse.json({ error: 'Author, rating, and comment are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const result = await db.insert(reviews).values({
      author,
      rating: parseInt(rating),
      comment,
      isVisible: true,
      orderId: orderId || null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
