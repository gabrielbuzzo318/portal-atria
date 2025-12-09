// src/lib/mail.ts
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM ?? "no-reply@example.com";

const canSend =
  smtpHost && smtpPort && smtpUser && smtpPass ? true : false;

const transporter = canSend
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // 465 = SSL, resto normalmente STARTTLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

type SendDocumentEmailParams = {
  to: string;
  clientName: string;
  fileName: string;
  docType: string;
  competence?: string | null;
  url: string;
};

export async function sendDocumentEmail({
  to,
  clientName,
  fileName,
  docType,
  competence,
  url,
  buffer,
}: SendDocumentEmailParams & { buffer: Buffer }) {
  if (!canSend || !transporter) {
    console.warn(
      "[mail] SMTP não configurado. Pula envio de e-mail de documento."
    );
    return;
  }

  const subject = `Novo documento disponível – ${docType}`;

  const competenciaTexto = competence
    ? `<p><strong>Competência:</strong> ${competence}</p>`
    : "";

  const html = `
    <p>Olá, ${clientName}!</p>

    <p>Um novo documento foi enviado para você através do <strong>Portal de Documentos da Atria Contabilidade</strong>.</p>

    <p>
      <strong>Tipo:</strong> ${docType}<br/>
      <strong>Arquivo:</strong> ${fileName}<br/>
    </p>
    ${competenciaTexto}

    <p>Você pode acessar o documento pelo portal normalmente.</p>

    <p>Ou, se preferir, acesse diretamente pelo link abaixo:</p>
    <p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>

    <p>Qualquer dúvida, é só falar com a gente. 💙</p>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
    attachments: [
      {
        filename: fileName,
        content: buffer,
      },
    ],
  });
}