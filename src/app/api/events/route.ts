import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select().from(events)
      .where(eq(events.isVisible, true))
      .orderBy(desc(events.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
