import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect('/account?returnTo=%2Fadmin&error=admin_required');

  return children;
}
