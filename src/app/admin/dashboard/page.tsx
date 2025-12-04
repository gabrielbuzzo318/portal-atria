'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Client = {
  id: string;
  name: string;
  email: string;
};

export default function DashboardAdmin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/clientes');
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/admin/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        password: newPassword,
      }),
    });

    if (res.ok) {
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      const data = await res.json();
      setClients(prev => [...prev, data.client]);
    }
  }

  return (
    <main className="page">
      <div className="page-shell">
        <header className="page-header">
          <div className="page-title-group">
            <h1>Clientes</h1>
            <p>Gerencie os clientes e envie documentos pelo portal.</p>
          </div>

          <button onClick={handleLogout} className="btn-outline">
            Sair
          </button>
        </header>

        <section className="grid-2">
          {/* Card de cadastro */}
          <div className="card">
            <h2 className="card-title">Cadastrar novo cliente</h2>
            <form onSubmit={handleCreateClient}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  className="form-input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-input"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Senha inicial</label>
                <input
                  className="form-input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Salvar cliente
              </button>
            </form>
          </div>

          {/* Lista de clientes */}
          <div className="card">
            <h2 className="card-title">Lista de clientes</h2>

            {loading && <p>Carregando...</p>}

            {!loading && clients.length === 0 && (
              <p>Nenhum cliente cadastrado ainda.</p>
            )}

            {!loading && clients.length > 0 && (
              <ul className="list">
                {clients.map(c => (
                  <li key={c.id} className="list-item">
                    <div className="list-item-main">
                      <p className="name">{c.name}</p>
                      <p className="email">{c.email}</p>
                    </div>
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      className="link-small"
                    >
                      Ver documentos
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
