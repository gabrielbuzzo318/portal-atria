import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET!;

export type UserRole = 'ACCOUNTANT' | 'CLIENT';

export type AuthUser = {
  id: string;
  role: UserRole;
  name: string;
  email: string;
};

export async function login(email: string, password: string) {
  // 1) tenta achar usuário pelo e-mail
  let user = await prisma.user.findUnique({ where: { email } });

  // 2) se não existir e for o e-mail da Ester, cria na hora
  if (!user && email === 'ester@contabilidade.com') {
    user = await prisma.user.create({
      data: {
        name: 'Ester',
        email,
        passwordHash: password, // salva o que ela digitou ali mesmo
        role: 'ACCOUNTANT',
      },
    });
  }

  // 3) se ainda assim não tiver usuário, falha
  if (!user) {
    return null;
  }

  // (por enquanto não vamos validar senha, MVP)
  const payload: AuthUser = {
    id: user.id,
    role: user.role as UserRole,
    name: user.name,
    email: user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  cookies().set('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return payload;
}

export async function logout() {
  cookies().set('auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function getAuthUser(): AuthUser | null {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export function requireRole(user: AuthUser | null, roles: UserRole[]) {
  if (!user) throw new Error('UNAUTHENTICATED');
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN');
}
