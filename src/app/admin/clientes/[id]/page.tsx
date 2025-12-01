'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Document = {
  id: string;
  originalName: string;
  type: 'NF' | 'BOLETO' | 'OTHER';
  createdAt: string;
};

export default function ClienteDocsPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [docs, setDocs] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'NF' | 'BOLETO' | 'OTHER'>('NF');

  async function loadDocs() {
    const res = await fetch(`/api/admin/clientes/${clientId}/docs`);
    if (res.ok) {
      const data = await res.json();
      setDocs(data.documents);
    }
  }

  useEffect(() => {
    if (clientId) loadDocs();
  }, [clientId]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    const form = new FormData();
    form.append('file', file);
    form.append('clientId', clientId);
    form.append('type', type);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });

    if (res.ok) {
      setFile(null);
      await loadDocs();
    }
  }

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Documentos do cliente</h1>
      </header>

      <section className="border rounded-2xl bg-white p-4">
        <h2 className="font-semibold mb-3">Enviar novo documento</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          onSubmit={handleUpload}
        >
          <div>
            <label className="block text-sm mb-1">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="NF">Nota Fiscal</option>
              <option value="BOLETO">Boleto</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Arquivo</label>
            <input
              type="file"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold"
          >
            Enviar
          </button>
        </form>
      </section>

      <section className="border rounded-2xl bg-white p-4">
        <h2 className="font-semibold mb-3">Arquivos enviados</h2>
        {docs.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum documento ainda.</p>
        )}
        <ul className="space-y-2">
          {docs.map(doc => (
            <li
              key={doc.id}
              className="border rounded-xl px-4 py-2 flex justify-between text-sm bg-slate-50"
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
      </section>
    </main>
  );
}
