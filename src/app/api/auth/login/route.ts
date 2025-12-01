import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await login(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
