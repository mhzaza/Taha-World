import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'إعدادات الحساب | منصة المدرب طه صباغ',
  description: 'إدارة إعدادات حسابك وتفضيلاتك في منصة المدرب طه صباغ',
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
