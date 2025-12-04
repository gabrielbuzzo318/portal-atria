import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const email = 'ester@contabilidade.com';
    const password = '123456';

    // vê se já existe
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: 'Usuária Ester já existe.',
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: 'Ester Contabilidade',
        email,
        passwordHash: hash, // se no schema tiver "password" em vez de "passwordHash", troca aqui
        role: 'ACCOUNTANT',
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Usuária Ester criada com sucesso!',
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error('Erro ao criar Ester:', e);
    return NextResponse.json(
      { ok: false, message: 'Erro ao criar Ester' },
      { status: 500 },
    );
  }
}
