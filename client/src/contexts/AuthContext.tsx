'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authAPI, userAPI, apiUtils } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  displayName: string;
  avatar?: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  enrolledCourses: string[];
  completedLessons: string[];
  certificates: any[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  emailVerified: boolean;
  subscription?: {
    type: 'free' | 'premium' | 'pro';
    expiresAt?: string;
  };
  isAdmin?: boolean;
  adminRole?: string;
  totalSpent?: number;
  notes?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, additionalData?: any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
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

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          Cookies.remove('token');
          Cookies.remove('refreshToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authAPI.login(email, password);
      const { token, refreshToken, user } = response.data;

      // Store tokens in cookies
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('refreshToken', refreshToken, { expires: 30 });

      setUser(user);
    } catch (error: any) {
      throw new Error(apiUtils.handleApiError(error));
    }
  };

  const register = async (email: string, password: string, displayName: string, additionalData?: any): Promise<void> => {
    try {
      const response = await authAPI.register({
        email,
        password,
        displayName,
        ...additionalData,
      });
      const { token, refreshToken, user } = response.data;

      // Store tokens in cookies
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('refreshToken', refreshToken, { expires: 30 });

      setUser(user);
    } catch (error: any) {
      throw new Error(apiUtils.handleApiError(error));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user state
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      setUser(null);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await authAPI.forgotPassword(email);
    } catch (error: any) {
      throw new Error(apiUtils.handleApiError(error));
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const response = await userAPI.updateProfile(data);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(apiUtils.handleApiError(error));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};