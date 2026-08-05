import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Categories list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const [created] = await db.insert(categories).values({
      name,
      sortOrder: sortOrder ?? 0,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }
    console.error('Category create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
