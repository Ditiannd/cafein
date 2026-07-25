import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { galleryItems } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
