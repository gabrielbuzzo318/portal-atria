import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser();
    requireRole(user, ["ACCOUNTANT"]); // só a Ester

    const docs = await prisma.document.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    console.error("Erro ao listar documentos:", err);

    return NextResponse.json(
      {
        error: "Erro ao listar documentos",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
