'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError('E-mail ou senha inválidos');
      return;
    }

    const data = await res.json();
    if (data.user.role === 'ACCOUNTANT') {
      router.push('/admin/dashboard');
    } else {
      router.push('/cliente/documentos');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Portal Contábil da Ester
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">E-mail</label>
            <input
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
