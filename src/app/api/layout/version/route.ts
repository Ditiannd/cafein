import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { layoutVersions, tables, layoutObjects } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc, ne } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const versions = await db.select().from(layoutVersions).orderBy(desc(layoutVersions.createdAt));
    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching layout versions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, versionId, name, sourceVersionId } = body;

    if (action === 'switch') {
      if (!versionId) return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
      
      await db.update(layoutVersions).set({ isActive: false }).where(ne(layoutVersions.id, versionId));
      const [updated] = await db.update(layoutVersions).set({ isActive: true, updatedAt: new Date() }).where(eq(layoutVersions.id, versionId)).returning();
      
      return NextResponse.json(updated);
    }

    if (action === 'rename') {
      if (!versionId || !name) return NextResponse.json({ error: 'versionId and name required' }, { status: 400 });
      const [updated] = await db.update(layoutVersions).set({ name, updatedAt: new Date() }).where(eq(layoutVersions.id, versionId)).returning();
      return NextResponse.json(updated);
    }

    if (action === 'create' || action === 'duplicate') {
      if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
      
      let sourceLayout = null;
      if (action === 'duplicate' && sourceVersionId) {
        [sourceLayout] = await db.select().from(layoutVersions).where(eq(layoutVersions.id, sourceVersionId)).limit(1);
      } else if (action === 'duplicate') {
        [sourceLayout] = await db.select().from(layoutVersions).where(eq(layoutVersions.isActive, true)).limit(1);
      }

      const [newLayout] = await db.insert(layoutVersions).values({
        name,
        isActive: false,
        canvasSettings: sourceLayout?.canvasSettings || JSON.stringify({ gridSpacing: 20, snapToGrid: true, width: 1200, height: 800 }),
      }).returning();

      if (sourceLayout) {
        // Copy tables
        const sourceTables = await db.select().from(tables).where(eq(tables.layoutVersionId, sourceLayout.id));
        for (const t of sourceTables) {
          const { id, layoutVersionId, qrCode, ...rest } = t;
          await db.insert(tables).values({
            layoutVersionId: newLayout.id,
            ...rest,
            qrCode: `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            status: 'available',
          });
        }

        // Copy layout objects
        const sourceObjects = await db.select().from(layoutObjects).where(eq(layoutObjects.layoutVersionId, sourceLayout.id));
        for (const obj of sourceObjects) {
          const { id, layoutVersionId, ...rest } = obj;
          await db.insert(layoutObjects).values({
            layoutVersionId: newLayout.id,
            ...rest,
          });
        }
      }

      return NextResponse.json(newLayout, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error modifying layout version:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
