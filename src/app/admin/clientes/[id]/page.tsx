'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Client = {
  id: string;
  name: string;
  email: string;
};

type Document = {
  id: string;
  originalName: string;
  type: 'NF' | 'BOLETO' | 'OTHER';
  createdAt: string;
};

type ApiResponse = {
  client?: Client;
  documents: Document[];
};

function formatPeriodKey(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 0-11
  return `${year}-${String(month).padStart(2, '0')}`; // ex: 2025-01
}

function formatPeriodLabel(periodKey: string) {
  const [year, month] = periodKey.split('-');
  return `${month}/${year}`; // 01/2025
}

export default function ClienteDocsPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const clientId = params.id;

  const [client, setClient] = useState<Client | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<'NF' | 'BOLETO' | 'OTHER'>('NF');
  const [uploading, setUploading] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(''); // '' = todos

  useEffect(() => {
    async function load() {
      if (!clientId) return;

      const res = await fetch(`/api/admin/clientes/${clientId}/docs`);
      if (res.ok) {
        const data: ApiResponse = await res.json();
        if ((data as any).client) {
          setClient((data as any).client);
        }
        setDocs(data.documents);
      }
      setLoading(false);
    }

    load();
  }, [clientId]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', clientId);
    formData.append('type', docType);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setDocs(prev => [data.document, ...prev]);
      setFile(null);
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
    }

    setUploading(false);
  }

  // monta lista de períodos disponíveis com base nos documentos
  const periods = Array.from(
    new Set(docs.map(d => formatPeriodKey(d.createdAt))),
  ).sort((a, b) => (a > b ? -1 : 1)); // mais recente primeiro

  const filteredDocs =
    selectedPeriod === ''
      ? docs
      : docs.filter(d => formatPeriodKey(d.createdAt) === selectedPeriod);

  return (
    <main className="page">
      <div className="page-shell">
        <header className="page-header">
          <div className="page-title-group">
            <h1>Documentos {client ? `– ${client.name}` : ''}</h1>
            <p>Envie notas fiscais e boletos para este cliente.</p>
          </div>

          <button
            onClick={() => router.push('/admin/dashboard')}
            className="btn-outline"
          >
            Voltar
          </button>
        </header>

        <div className="grid-2">
          {/* Upload */}
          <div className="card">
            <h2 className="card-title">Enviar documento</h2>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  className="form-input"
                  value={docType}
                  onChange={e =>
                    setDocType(e.target.value as 'NF' | 'BOLETO' | 'OTHER')
                  }
                >
                  <option value="NF">Nota Fiscal</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Arquivo</label>
                <input
                  id="file-input"
                  type="file"
                  className="form-input"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Enviando...' : 'Enviar documento'}
              </button>
            </form>
          </div>

          {/* Lista de docs */}
          <div className="card">
            <h2 className="card-title">Documentos enviados</h2>

            {loading && <p>Carregando...</p>}

            {!loading && (
              <>
                <div className="filters">
                  <span className="filters-label">Período:</span>
                  <select
                    className="filters-select"
                    value={selectedPeriod}
                    onChange={e => setSelectedPeriod(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {periods.map(p => (
                      <option key={p} value={p}>
                        {formatPeriodLabel(p)}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredDocs.length === 0 && (
                  <p>Nenhum documento neste período.</p>
                )}

                {filteredDocs.length > 0 && (
                  <ul className="list">
                    {filteredDocs.map(doc => (
                      <li key={doc.id} className="list-item">
                        <div className="list-item-main">
                          <p className="name">{doc.originalName}</p>
                          <p className="email">
                            {new Date(doc.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>

                        <span className="tag">
                          {doc.type === 'NF'
                            ? 'Nota Fiscal'
                            : doc.type === 'BOLETO'
                            ? 'Boleto'
                            : 'Outro'}
                        </span>

                        <a
                          href={`/api/download/${doc.id}`}
                          className="link-small"
                        >
                          Baixar
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
