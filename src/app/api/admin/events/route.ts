import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, date, description, image, isVisible } = body;

    if (!title || !date || !description || !image) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const result = await db.insert(events).values({
      title,
      date,
      description,
      image,
      isVisible: isVisible ?? true,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Event create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
