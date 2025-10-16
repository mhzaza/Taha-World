import { Metadata } from 'next';
import ProfileLayout from '@/components/layouts/ProfileLayout';
import UserPayments from '@/components/profile/UserPayments';

export const metadata: Metadata = {
  title: 'المدفوعات | منصة المدرب طه صباغ',
  description: 'عرض سجل المدفوعات والمعاملات المالية الخاصة بك في منصة المدرب طه صباغ',
};

export default function PaymentsPage() {
  return (
    <ProfileLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">سجل المدفوعات</h1>
        <UserPayments />
      </div>
    </ProfileLayout>
  );
}