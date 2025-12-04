import { ReactNode } from 'react';
import { getAuthUser, requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const user = getAuthUser();

  try {
    requireRole(user, ['ACCOUNTANT']);
  } catch (e) {
    redirect('/login');
  }

  return <>{children}</>;
}
