'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { UserIcon, PhoneIcon, MapPinIcon, CalendarIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    birthDate: '',
    bio: '',
    gender: '',
    fitnessLevel: '',
    goals: [] as string[]
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        setInitialLoading(true);
        const response = await userAPI.getProfile();
        
        if (response.data.success) {
          const userData = response.data.data?.user;
          setProfileForm({
            displayName: userData?.displayName || user.displayName || '',
            email: userData?.email || user.email || '',
            phone: userData?.phone || '',
            location: userData?.location || '',
            birthDate: userData?.birthDate || '',
            bio: userData?.bio || '',
            gender: userData?.gender || '',
            fitnessLevel: userData?.fitnessLevel || '',
            goals: userData?.goals || []
          });
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        // Fallback to auth user data
        setProfileForm({
          displayName: user.displayName || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.location || '',
          birthDate: user.birthDate || '',
          bio: user.bio || '',
          gender: user.gender || '',
          fitnessLevel: user.fitnessLevel || '',
          goals: user.goals || []
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

      // Update profile via API
      const response = await userAPI.updateProfile({
        displayName: profileForm.displayName,
        phone: profileForm.phone,
        location: profileForm.location,
        birthDate: profileForm.birthDate,
        bio: profileForm.bio,
        gender: profileForm.gender as 'male' | 'female' | 'other' | undefined,
        fitnessLevel: profileForm.fitnessLevel as 'beginner' | 'intermediate' | 'advanced' | undefined,
        goals: profileForm.goals
      });

      if (response.data.success) {
        // Also update the auth context
        await updateProfile({
          displayName: profileForm.displayName,
          phone: profileForm.phone,
          location: profileForm.location,
          birthDate: profileForm.birthDate,
          bio: profileForm.bio,
          gender: profileForm.gender,
          fitnessLevel: profileForm.fitnessLevel,
          goals: profileForm.goals
        });

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(response.data.error || 'فشل في تحديث الملف الشخصي');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">معلومات الملف الشخصي</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            الجنس
          </label>
          <select
            id="gender"
            name="gender"
            value={profileForm.gender}
            onChange={handleSelectChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
          >
            <option value="">اختر الجنس</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
            <option value="other">آخر</option>
          </select>
        </div>

        {/* Fitness Level */}
        <div>
          <label htmlFor="fitnessLevel" className="block text-sm font-medium text-gray-700 mb-1">
            مستوى اللياقة البدنية
          </label>
          <select
            id="fitnessLevel"
            name="fitnessLevel"
            value={profileForm.fitnessLevel}
            onChange={handleSelectChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
          >
            <option value="">اختر مستوى اللياقة</option>
            <option value="beginner">مبتدئ</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">متقدم</option>
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الأهداف التدريبية
          </label>
          <div className="space-y-2">
            {['بناء العضلات', 'فقدان الوزن', 'تحسين اللياقة العامة', 'زيادة القوة', 'تحسين المرونة', 'التحضير للمسابقات'].map((goal) => (
              <label key={goal} className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileForm.goals.includes(goal)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setProfileForm(prev => ({
                        ...prev,
                        goals: [...prev.goals, goal]
                      }));
                    } else {
                      setProfileForm(prev => ({
                        ...prev,
                        goals: prev.goals.filter(g => g !== goal)
                      }));
                    }
                  }}
                  className="ml-2 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
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