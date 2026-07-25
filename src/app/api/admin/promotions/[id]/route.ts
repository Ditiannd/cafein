import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promotions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // id can be the promotion ID or catalogItemId — we'll handle by catalogItemId for frontend convenience
    const result = await db.delete(promotions)
      .where(eq(promotions.catalogItemId, parseInt(id)))
      .returning();

    if (result.length === 0) {
      // Try by promotion ID
      const result2 = await db.delete(promotions)
        .where(eq(promotions.id, parseInt(id)))
        .returning();
      
      if (result2.length === 0) {
        return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Promotion delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
