import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

type Params = { params: { id: string } };

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: Params) {
  const user = getAuthUser();
  if (!user) {
    return new Response('Não autenticado', { status: 401 });
  }

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
  });

  if (!doc) {
    return new Response('Arquivo não encontrado', { status: 404 });
  }

  // Cliente só pode baixar o que é dele
  if (user.role === 'CLIENT' && doc.clientId !== user.id) {
    return new Response('Proibido', { status: 403 });
  }

  const fileBuffer = await readFile(doc.path);
  const ext = path.extname(doc.originalName) || '.bin';

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(
        doc.originalName,
      )}"`,
    },
  });
}
