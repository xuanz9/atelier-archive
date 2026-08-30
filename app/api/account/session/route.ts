import { NextResponse } from 'next/server';
import { getAuthenticatedUser, isAdminUser } from '@/lib/admin';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, isAdmin: isAdminUser(user), user: { id: user.id, email: user.email } });
}
