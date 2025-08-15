'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      // الخطوة 1: إنشاء المستخدم في خدمة المصادقة
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // الخطوة 2: تحديث اسم العرض في ملفه الشخصي
      await updateProfile(user, { displayName });

      // الخطوة 3 (مضافة): إنشاء مستند للمستخدم في قاعدة بيانات Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName,
        email,
        createdAt: new Date(),
        // يمكنك إضافة أي بيانات أخرى هنا
      });

    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني';
      case 'auth/wrong-password':
        return 'كلمة المرور غير صحيحة';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مستخدم بالفعل';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة جداً';
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صحيح';
      case 'auth/too-many-requests':
        return 'تم تجاوز عدد المحاولات المسموح، حاول مرة أخرى لاحقاً';
      case 'auth/network-request-failed':
        return 'خطأ في الاتصال بالإنترنت';
      default:
        return 'حدث خطأ غير متوقع، حاول مرة أخرى';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};