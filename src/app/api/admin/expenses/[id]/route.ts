import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const [deleted] = await db.delete(expenses)
      .where(eq(expenses.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Expense delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
