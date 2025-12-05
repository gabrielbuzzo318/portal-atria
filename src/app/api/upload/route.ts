import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser();
    requireRole(user, ['ACCOUNTANT']); // só a Ester (contador) envia docs

    const formData = await req.formData();

    const clientId = formData.get('clientId') as string | null;
    const type = formData.get('type') as string | null; // ex: "NF" ou "BOLETO"
    const competence = formData.get('competence') as string | null;
    const file = formData.get('file') as File | null;

    if (!clientId || !type || !file) {
      return NextResponse.json(
        { error: 'Dados inválidos para upload' },
        { status: 400 }
      );
    }

    // converte o File em Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // diretório de upload (variável ou ./uploads)
    const uploadDir =
      process.env.FILE_UPLOAD_DIR || path.join(process.cwd(), 'uploads');

    // garante que a pasta existe
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || '';
    const randomName = crypto.randomBytes(16).toString('hex') + ext;
    const filePath = path.join(uploadDir, randomName);

    // grava o arquivo no disco
    await writeFile(filePath, buffer);

    // salva registro no banco
    const doc = await prisma.document.create({
      data: {
        clientId,
        uploadedById: user!.id,
        type,                       // se for enum String, tá ok
        competence: competence || '', // ajusta se no schema for Date
        path: filePath,
        originalName: file.name,
      } as any,
    });

    return NextResponse.json({ ok: true, document: doc });
  } catch (err) {
    console.error('Erro no upload:', err);
    return NextResponse.json(
      { error: 'Erro ao enviar documento' },
      { status: 500 }
    );
  }
}
