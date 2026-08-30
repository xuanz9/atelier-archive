import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/admin';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!(await getAuthenticatedUser())) redirect('/account?returnTo=%2Fdashboard');
  return children;
}
