import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
  }).from(users).where(eq(users.id, session.userId)).limit(1);

  if (user.length === 0) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: user[0] });
}
