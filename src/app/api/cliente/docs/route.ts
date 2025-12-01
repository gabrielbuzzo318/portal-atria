import { NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = getAuthUser();
  try {
    requireRole(user, ['CLIENT']);
  } catch (e) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const docs = await prisma.document.findMany({
    where: { clientId: user!.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ documents: docs });
}
