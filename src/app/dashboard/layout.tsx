import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Client Auth System',
  description: 'User dashboard for authenticated users',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}