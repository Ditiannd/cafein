import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storeSettings } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select().from(storeSettings).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ isOpen: true, announcementBanner: null });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Store status fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { isOpen, announcementBanner } = body;

    const existing = await db.select().from(storeSettings).limit(1);

    if (existing.length === 0) {
      const result = await db.insert(storeSettings).values({
        isOpen: isOpen ?? true,
        announcementBanner: announcementBanner ?? null,
      }).returning();
      return NextResponse.json(result[0]);
    }

    const result = await db.update(storeSettings)
      .set({
        ...(isOpen !== undefined && { isOpen }),
        ...(announcementBanner !== undefined && { announcementBanner }),
        updatedAt: new Date(),
      })
      .where(eq(storeSettings.id, existing[0].id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Store status update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
