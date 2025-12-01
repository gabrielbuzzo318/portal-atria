'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </header>

      <section className="border rounded-2xl bg-white p-4">
        <h2 className="font-semibold mb-3">Cadastrar novo cliente</h2>
        <form
          onSubmit={handleCreateClient}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-sm mb-1">Nome</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">E-mail</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha inicial</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              type="text"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold"
          >
            Salvar
          </button>
        </form>
      </section>

      <section className="border rounded-2xl bg-white p-4">
        <h2 className="font-semibold mb-3">Lista de clientes</h2>
        {loading && <p>Carregando...</p>}

        {!loading && clients.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum cliente cadastrado ainda.</p>
        )}

        {!loading && clients.length > 0 && (
          <ul className="space-y-2">
            {clients.map(c => (
              <li
                key={c.id}
                className="border rounded-xl px-4 py-2 flex justify-between items-center text-sm bg-slate-50"
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-gray-500">{c.email}</p>
                </div>
                <Link
                  href={`/admin/clientes/${c.id}`}
                  className="text-slate-900 underline font-medium"
                >
                  Ver documentos
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
