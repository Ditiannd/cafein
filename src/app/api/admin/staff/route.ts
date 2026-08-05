import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Staff list error:', error);
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
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
    }

    if (!['admin', 'barista'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin or barista' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const [created] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }
    console.error('Staff create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
