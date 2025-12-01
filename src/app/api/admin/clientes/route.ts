import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  try {
    requireRole(user, ['ACCOUNTANT']);
  } catch (e) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { name, email, password } = await req.json();

  const client = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: password, // salva em texto puro (igual login usa)
      role: 'CLIENT',
    },
  });

  return NextResponse.json({ client });
}
