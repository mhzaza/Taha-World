'use client';

import { Suspense } from 'react';
import ConsultationsList from './ConsultationsList';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminConsultationsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    }>
      <ConsultationsList />
    </Suspense>
  );
}
