import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [table] = await db.select().from(tables).where(eq(tables.id, id)).limit(1);

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const newQrSecret = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const [updated] = await db.update(tables).set({
      qrCode: newQrSecret,
      updatedAt: new Date(),
    }).where(eq(tables.id, id)).returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
