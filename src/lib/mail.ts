export async function sendDocumentEmail({
  to,
  clientName,
  fileName,
  docType,
  competence,
  url,
  buffer,     // 👈 AGORA RECEBE O ARQUIVO
}: SendDocumentEmailParams & { buffer: Buffer }) {

  if (!canSend || !transporter) {
    console.warn("[mail] SMTP não configurado. Pula envio de e-mail.");
    return;
  }

  const subject = `Novo documento enviado – ${docType}`;

  const competenciaTexto = competence
    ? `<p><strong>Competência:</strong> ${competence}</p>`
    : "";

  const html = `
    <p>Olá, ${clientName}!</p>

    <p>Um novo documento foi enviado para você através da <strong>Atria Contabilidade</strong>.</p>

    <p>
      <strong>Tipo:</strong> ${docType}<br/>
      <strong>Arquivo:</strong> ${fileName}<br/>
      ${competenciaTexto}
    </p>

    <p>O documento está anexado neste e-mail.</p>

    <p>Você também pode acessar pelo portal se preferir:</p>
    <p><a href="${url}" target="_blank">${url}</a></p>

    <p>Abraço da equipe 💙</p>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
    attachments: [
      {
        filename: fileName,
        content: buffer,  // 👈 AQUI VAI O ARQUIVO
      },
    ],
  });
}
