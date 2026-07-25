import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { galleryItems } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { url, caption } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const result = await db.insert(galleryItems).values({
      url,
      caption: caption || null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Gallery create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
