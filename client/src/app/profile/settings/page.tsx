import { Metadata } from 'next';
import ProfileLayout from '@/components/layouts/ProfileLayout';
import UserSettings from '@/components/profile/UserSettings';

export const metadata: Metadata = {
  title: 'إعدادات الحساب | منصة المدرب طه صباغ',
  description: 'إدارة إعدادات حسابك وتفضيلاتك في منصة المدرب طه صباغ',
};

export default function SettingsPage() {
  return (
    <ProfileLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">إعدادات الحساب</h1>
        <UserSettings />
      </div>
    </ProfileLayout>
  );
}