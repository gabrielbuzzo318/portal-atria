'use client';

import { useEffect, useState } from 'react';

type Document = {
  id: string;
  originalName: string;
  type: 'NF' | 'BOLETO' | 'OTHER';
  createdAt: string;
};

export default function ClienteDocumentos() {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/cliente/docs');
      if (res.ok) {
        const data = await res.json();
        setDocs(data.documents);
      }
    }
    load();
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meus documentos</h1>

      {docs.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum documento disponível.</p>
      )}

      <ul className="space-y-2">
        {docs.map(doc => (
          <li
            key={doc.id}
            className="border rounded-xl px-4 py-2 flex justify-between text-sm bg-white"
          >
            <span>{doc.originalName}</span>
            <span>{doc.type}</span>
            <span>{new Date(doc.createdAt).toLocaleString('pt-BR')}</span>
            <a
              href={`/api/download/${doc.id}`}
              className="underline text-slate-900"
            >
              Baixar
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
