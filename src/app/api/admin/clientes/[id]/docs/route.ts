import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const user = getAuthUser();
  try {
    requireRole(user, ['ACCOUNTANT']);
  } catch (e) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const clientId = params.id;

  const docs = await prisma.document.findMany({
    where: { clientId },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ documents: docs });
}
