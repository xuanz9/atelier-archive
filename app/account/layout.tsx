import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account — Atelier Archive',
  description: 'Create or access your Atelier Archive account.',
};

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
