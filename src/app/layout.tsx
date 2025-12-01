import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portal Contábil Ester',
  description: 'Portal de documentos contábeis para clientes da Ester',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
