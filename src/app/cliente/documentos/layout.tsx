import { ReactNode } from 'react';
import { getAuthUser, requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function ClienteLayout({ children }: { children: ReactNode }) {
  const user = getAuthUser();

  try {
    requireRole(user, ['CLIENT']);
  } catch (e) {
    redirect('/login');
  }

  return <>{children}</>;
}
