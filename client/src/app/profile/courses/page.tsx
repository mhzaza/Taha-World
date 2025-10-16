import { Metadata } from 'next';
import ProfileLayout from '@/components/layouts/ProfileLayout';
import UserCourses from '@/components/profile/UserCourses';

export const metadata: Metadata = {
  title: 'دوراتي | منصة المدرب طه صباغ',
  description: 'عرض وإدارة الدورات التدريبية التي اشتركت بها في منصة المدرب طه صباغ',
};

export default function CoursesPage() {
  return (
    <ProfileLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">دوراتي</h1>
        <UserCourses />
      </div>
    </ProfileLayout>
  );
}