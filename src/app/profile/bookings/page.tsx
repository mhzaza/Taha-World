import { Metadata } from 'next';
import UserBookings from '@/components/profile/UserBookings';
import ProfileLayout from '@/components/layouts/ProfileLayout';

export const metadata: Metadata = {
  title: 'حجوزاتي | منصة المدرب طه صباغ',
  description: 'عرض وإدارة حجوزات الاستشارات الخاصة بك مع المدرب طه صباغ',
};

export default function BookingsPage() {
  return (
    <ProfileLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">حجوزاتي</h1>
        <UserBookings />
      </div>
    </ProfileLayout>
  );
}