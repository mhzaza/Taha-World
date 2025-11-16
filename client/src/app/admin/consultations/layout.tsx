import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'إدارة الاستشارات | لوحة التحكم',
  description: 'إدارة حجوزات وجدولة الاستشارات',
};

export default function ConsultationsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة الاستشارات</h1>
          <p className="text-muted-foreground">
            قم بإدارة حجوزات وجدولة الاستشارات
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
