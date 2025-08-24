import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Header>
      {children}
    </Header>
  );
}
