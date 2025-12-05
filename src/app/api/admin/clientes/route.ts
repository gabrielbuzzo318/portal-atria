import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// ... (GET fica igual ao que já está)

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser();
    requireRole(user, ['ACCOUNTANT']); // só a Ester cria cliente

    const body = await req.json();

    // aceita vários nomes possíveis que o front possa mandar
    const name = (body.name || body.nome) as string | undefined;
    const email = body.email as string | undefined;

    const senhaBruta =
      (body.initialPassword ||
        body.password ||
        body.senhaInicial ||
        body.senha) as string | undefined;

    if (!name || !email || !senhaBruta) {
      console.log('Body recebido em /api/admin/clientes POST:', body);
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este e-mail' },
        { status: 409 },
      );
    }

    const hash = await bcrypt.hash(senhaBruta, 10);

    const client = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash,
        role: 'CLIENT',
      },
    });

    return NextResponse.json(
      { client },
      { status: 201 },
    );
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 },
    );
  }
}
