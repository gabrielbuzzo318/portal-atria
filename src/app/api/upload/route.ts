// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { uploadToSupabase } from "@/lib/supabase";
import { sendDocumentEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    // só a Ester (contadora) pode enviar documentos
    const user = await requireRole(req, "ACCOUNTANT");

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
    let type: string = "OTHER";

    if (
      rawType === "NF" ||
      rawType === "BOLETO" ||
      rawType === "DAS" ||
      rawType === "DCTFWEB" ||
      rawType === "ST" ||
      rawType === "DIFAL" ||
      rawType === "OTHER"
    ) {
      type = rawType;
    } else if (rawType?.toLowerCase().includes("nota")) {
      type = "NF";
    } else if (rawType?.toLowerCase().includes("boleto")) {
      type = "BOLETO";
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
        uploadedById: user.id,
        type,
        competencia: competence,
        path: key,
        originalName: file.name,
        storedName: randomName,
      },
    });

    // pega dados do cliente pra mandar o e-mail
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { name: true, email: true },
    });

    if (client?.email) {
      // não deixa o e-mail quebrar o upload; só loga erro se der ruim
      try {
  await sendDocumentEmail({
    to: client.email,
    clientName: client.name ?? "Cliente",
    fileName: file.name,
    docType: mapTypeToLabel(type),
    competence,
    url,
    buffer, // 👈 ANEXO DO ARQUIVO
  });
} catch (e) {
  console.error("Erro ao enviar e-mail de documento:", e);
}


    return NextResponse.json({ ok: true, document: doc });
  } catch (err: unknown) {
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

// só pra deixar o nome mais amigável no e-mail
function mapTypeToLabel(type: string): string {
  switch (type) {
    case "NF":
      return "Nota Fiscal";
    case "BOLETO":
      return "Boleto";
    case "DAS":
      return "DAS";
    case "DCTFWEB":
      return "DCTFWeb";
    case "ST":
      return "Substituição Tributária";
    case "DIFAL":
      return "DIFAL";
    case "OTHER":
    default:
      return "Outro Documento";
  }
}
