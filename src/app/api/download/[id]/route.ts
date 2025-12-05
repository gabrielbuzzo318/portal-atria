import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { downloadFromSupabase } from "@/lib/supabase";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const doc = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // se for cliente, só pode baixar o que é dele
    if (user.role === "CLIENT" && doc.clientId !== user.id) {
      return NextResponse.json({ error: "Proibido" }, { status: 403 });
    }

    // path agora é a KEY no supabase
    const fileBuffer = await downloadFromSupabase(doc.path);

    const ext = path.extname(doc.originalName || "") || ".bin";

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          doc.originalName || `arquivo${ext}`
        )}"`,
      },
    });
  } catch (err) {
    console.error("Erro no download:", err);
    return NextResponse.json(
      { error: "Erro ao baixar documento" },
      { status: 500 }
    );
  }
}
