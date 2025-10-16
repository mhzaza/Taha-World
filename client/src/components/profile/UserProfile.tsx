'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserIcon, PhoneIcon, MapPinIcon, CalendarIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    birthDate: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        birthDate: user.birthDate || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      if (!user) throw new Error('يجب تسجيل الدخول لتحديث الملف الشخصي');

      await updateProfile({
        displayName: profileForm.displayName,
        phone: profileForm.phone,
        location: profileForm.location,
        birthDate: profileForm.birthDate,
        bio: profileForm.bio
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">معلومات الملف الشخصي</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            الاسم
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profileForm.displayName}
              onChange={handleInputChange}
              className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
              placeholder="أدخل اسمك الكامل"
            />
          </div>
        </div>

        {/* Email (Read Only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileForm.email}
            readOnly
            className="block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-right"
          />
          <p className="mt-1 text-sm text-gray-500">لا يمكن تغيير البريد الإلكتروني</p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهاتف
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileForm.phone}
              onChange={handleInputChange}
              className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
              placeholder="أدخل رقم هاتفك"
              dir="ltr"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            الموقع
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="location"
              name="location"
              value={profileForm.location}
              onChange={handleInputChange}
              className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
              placeholder="المدينة، البلد"
            />
          </div>
        </div>

        {/* Birth Date */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            تاريخ الميلاد
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={profileForm.birthDate}
              onChange={handleInputChange}
              className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            نبذة شخصية
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={profileForm.bio}
            onChange={handleInputChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
            placeholder="أخبرنا المزيد عنك..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="mr-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="mr-3">
                <p className="text-sm text-green-700">تم تحديث الملف الشخصي بنجاح</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
}