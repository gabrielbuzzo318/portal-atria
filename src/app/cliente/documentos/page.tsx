'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Document = {
  id: string;
  originalName: string;
  type: 'NF' | 'BOLETO' | 'OTHER';
  createdAt: string;
};

function formatPeriodKey(dateStr: string) {
  const d = new Date(dateStr);
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
    new Set(docs.map(d => formatPeriodKey(d.createdAt))),
  ).sort((a, b) => (a > b ? -1 : 1));

  const filteredDocs =
    selectedPeriod === ''
      ? docs
      : docs.filter(d => formatPeriodKey(d.createdAt) === selectedPeriod);

  return (
    <main className="page">
      <div className="page-shell">
        <header className="page-header">
          <div className="page-title-group">
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
        </div>
      </div>
    </main>
  );
}
