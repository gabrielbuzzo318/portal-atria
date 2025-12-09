import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { uploadToSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // 👇 só a Ester (contadora) pode enviar documentos
    const user = await getAuthUser();

    if (!user || user.role !== "ACCOUNTANT") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const clientId = formData.get("clientId") as string | null;
    const rawType = formData.get("type") as string | null;
    const competenceRaw = formData.get("competence") as string | null;
    const file = formData.get("file") as File | null;

    if (!clientId || !file) {
      return NextResponse.json(
        { error: "Dados inválidos para upload" },
        { status: 400 }
      );
    }

    // normaliza tipo pro enum (NF, BOLETO, OTHER)
    let type: string = "Outro";

if (rawType && rawType.trim() !== "") {
  type = rawType;
}

    // competência opcional
    let competence: string | null = null;
    if (
      competenceRaw &&
      !competenceRaw.includes("----") &&
      competenceRaw.trim() !== ""
    ) {
      competence = competenceRaw;
    }

    // converte File em Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || "";
    const randomName = crypto.randomBytes(16).toString("hex") + ext;
    const key = `docs/${clientId}/${randomName}`;

    // sobe pro Supabase
    const { url } = await uploadToSupabase({
      buffer,
      key,
      contentType: file.type || "application/octet-stream",
    });

    // salva no banco
    const doc = await prisma.document.create({
      data: {
        clientId,
        uploadedById: user.id,   // 👈 agora o user existe
        type,
        competencia: competence, // 👈 nome igual ao schema
        path: key,
        originalName: file.name,
        storedName: randomName,
      },
    });

    return NextResponse.json({ ok: true, document: doc });
  } catch (err: any) {
    console.error("Erro no upload:", err);
    return NextResponse.json(
      {
        error: "Erro ao enviar documento",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
