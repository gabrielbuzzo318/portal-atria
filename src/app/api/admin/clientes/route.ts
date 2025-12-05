import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser();
    requireRole(user, ['ACCOUNTANT']); // só contador vê docs de cliente

    const clientId = params.id;

    const url = new URL(req.url);
    const competence = url.searchParams.get('competence') || undefined;

    const where: any = { clientId };
    if (competence) {
      where.competence = competence;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (err) {
    console.error('Erro ao listar documentos:', err);
    return NextResponse.json(
      { error: 'Erro ao listar documentos' },
      { status: 500 }
    );
  }
}
