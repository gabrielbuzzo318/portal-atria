import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

/**
 * Envia e-mail para o cliente com o documento em anexo.
 */
type SendDocumentEmailParams = {
  to: string;
  clientName: string;
  fileName: string;
  docType: string;
  competence?: string | null;
  url: string;
};

export async function sendDocumentEmail(
  params: SendDocumentEmailParams & { buffer: Buffer }
) {
  const { to, clientName, fileName, docType, competence, url, buffer } = params;

  // Se não tiver SMTP configurado, só loga e sai
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      "[MAIL] SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASS). E-mail NÃO enviado."
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // 465 = SSL; 587 = TLS
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const subject = `Novo documento disponível: ${docType}`;
  const compText = competence ? `Competência: ${competence}\n\n` : "";

  const textBody = [
    `Olá, ${clientName}!`,
    "",
    `Um novo documento foi disponibilizado pela sua contabilidade.`,
    "",
    `Tipo: ${docType}`,
    competence ? `Competência: ${competence}` : "",
    "",
    `Você pode acessá-lo pelo Portal da ATRA Contabilidade ou usar o anexo deste e-mail.`,
    "",
    `Link direto (caso queira abrir pelo navegador):`,
    url,
    "",
    "Qualquer dúvida, é só chamar a Ester 🙂",
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = `
    <p>Olá, <strong>${clientName}</strong>!</p>
    <p>Um novo documento foi disponibilizado pela sua contabilidade.</p>

    <p>
      <strong>Tipo:</strong> ${docType}<br/>
      ${competence ? `<strong>Competência:</strong> ${competence}<br/>` : ""}
    </p>

    <p>Você pode acessá-lo pelo Portal da ATRA Contabilidade ou usando o anexo deste e-mail.</p>

    <p>
      <strong>Link direto:</strong><br/>
      <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
    </p>

    <p>Qualquer dúvida, é só falar com a Ester 🙂</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: fileName,
          content: buffer,
        },
      ],
    });

    console.log("[MAIL] E-mail de documento enviado com sucesso:", {
      messageId: info.messageId,
      to,
    });
  } catch (err) {
    console.error("[MAIL] Erro ao enviar e-mail de documento:", err);
    // não joga erro pra cima pra não quebrar o upload
  }
}
