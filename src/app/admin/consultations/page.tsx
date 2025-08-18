import { Metadata } from 'next';
import AdminConsultations from '@/components/admin/consultations/AdminConsultations';
import AdminLayout from '@/components/layouts/AdminLayout';

export const metadata: Metadata = {
  title: 'إدارة الاستشارات | لوحة تحكم المدرب طه صباغ',
  description: 'إدارة الاستشارات والحجوزات في منصة المدرب طه صباغ',
};

export default function AdminConsultationsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">إدارة الاستشارات</h1>
        <AdminConsultations />
      </div>
    </AdminLayout>
  );
}