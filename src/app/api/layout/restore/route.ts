import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { layoutVersions, tables } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, ne } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { versionId, resetStatuses } = await request.json();

    if (!versionId) {
      return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
    }

    // Switch active layout
    await db.update(layoutVersions).set({ isActive: false }).where(ne(layoutVersions.id, versionId));
    const [restored] = await db.update(layoutVersions).set({ isActive: true, updatedAt: new Date() }).where(eq(layoutVersions.id, versionId)).returning();

    if (!restored) {
      return NextResponse.json({ error: 'Layout version not found' }, { status: 404 });
    }

    // Optionally reset all table statuses in this layout to available
    if (resetStatuses) {
      await db.update(tables).set({ status: 'available', updatedAt: new Date() }).where(eq(tables.layoutVersionId, versionId));
    }

    return NextResponse.json(restored);
  } catch (error) {
    console.error('Error restoring layout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
