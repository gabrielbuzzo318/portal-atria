import nodemailer from "nodemailer";

type SendDocumentEmailParams = {
  to: string;
  clientName: string;
  fileName: string;
  docType: string;
  competence: string | null;
  url: string;
  buffer: Buffer;
};

export async function sendDocumentEmail({
  to,
  clientName,
  fileName,
  docType,
  competence,
  url,
  buffer,
}: SendDocumentEmailParams) {
  // se não tiver SMTP configurado, só loga e não faz nada
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.SMTP_FROM
  ) {
    console.warn("[MAIL] SMTP não configurado. Pulei envio de e-mail.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || "587"),
    secure: Number(process.env.SMTP_PORT || "587") === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `Novo documento: ${docType}`;
  const compText = competence ? `Competência: ${competence}\n` : "";

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text:
      `Olá ${clientName},\n\n` +
      `Um novo documento foi enviado para você: ${docType}.\n` +
      compText +
      `Você pode acessar pelo portal normalmente.\n\n` +
      `Link direto (se quiser usar): ${url}\n\n` +
      `Este é um e-mail automático, por favor não responda.`,
    attachments: [
      {
        filename: fileName,
        content: buffer,
      },
    ],
  });
}
