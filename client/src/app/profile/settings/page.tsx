'use client';

import { Suspense } from 'react';
import ProfileLayout from '@/components/layouts/ProfileLayout';
import UserSettings from '@/components/profile/UserSettings';
import { Skeleton } from '@/components/ui/skeleton';

function SettingsContent() {
  return <UserSettings />;
}

export default function SettingsPage() {
  return (
    <ProfileLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">إعدادات الحساب</h1>
        <Suspense fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        }>
          <SettingsContent />
        </Suspense>
      </div>
    </ProfileLayout>
  );
}