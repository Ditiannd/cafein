import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin reviews fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
