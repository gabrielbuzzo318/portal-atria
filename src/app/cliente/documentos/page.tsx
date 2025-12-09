'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Document = {
  id: string;
  originalName: string;
  type: 'NF' | 'DAS' | 'OTHER' | 'DCTFWeb' | 'ST' | 'DIFAL';
  createdAt: string;
  competencia?: string | null;
};

function formatPeriodKeyFromDoc(doc: Document) {
  if (doc.competencia && doc.competencia.includes('-')) {
    return doc.competencia;
  }
  const d = new Date(doc.createdAt);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatPeriodLabel(periodKey: string) {
  const [year, month] = periodKey.split('-');
  return `${month}/${year}`;
}

export default function ClienteDocumentos() {
  const [docs, setDocs] = useState<Document[]>([]);
  const router = useRouter();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

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

  const periods = Array.from(
    new Set(docs.map(formatPeriodKeyFromDoc)),
  ).sort((a, b) => (a > b ? -1 : 1));

  const filteredDocs =
    selectedPeriod === ''
      ? docs
      : docs.filter(d => formatPeriodKeyFromDoc(d) === selectedPeriod);

  return (
    <main className="page">
      <div className="page-shell">
<header className="page-header">
  <div className="page-title-group">
    <span className="brand-badge">ATRIA CONTABILIDADE</span>
    <h1>Meus documentos</h1>
    <p>
      Acesse suas notas fiscais e boletos enviados pela contabilidade.
    </p>
  </div>
  <button onClick={handleLogout} className="btn-outline">
    Sair
  </button>
</header>


        <div className="card">
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
            <p>Nenhum documento disponível neste período.</p>
          )}

          {filteredDocs.length > 0 && (
            <ul className="list">
              {filteredDocs.map(doc => {
                const periodKey = formatPeriodKeyFromDoc(doc);
                const compLabel = formatPeriodLabel(periodKey);

                return (
                  <li key={doc.id} className="list-item">
                    <div className="list-item-main">
                      <p className="name">{doc.originalName}</p>
                      <p className="email">
                        {doc.competencia
                          ? `Competência: ${compLabel} · Enviado em ${new Date(
                              doc.createdAt,
                            ).toLocaleString('pt-BR')}`
                          : new Date(
                              doc.createdAt,
                            ).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <span className="tag">
                            {doc.type === 'NF'
                              ? 'Nota Fiscal'
                              : doc.type === 'DIFAL'
                              ? 'DIFAL'
                              : doc.type === 'DAS'
                              ? 'DAS'
                              : doc.type === 'DCTFWeb'
                              ? 'DCTFWeb'
                              : doc.type === 'ST'
                              ? 'ST'
                              : 'Outro'}
                    </span>

                    <a
                      href={`/api/download/${doc.id}`}
                      className="link-small"
                    >
                      Baixar
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
