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
  gender?: 'male' | 'female';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  enrolledCourses: string[];
  completedLessons: string[];
  certificates: unknown[];
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
  register: (email: string, password: string, displayName: string, additionalData?: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasToken: () => boolean;
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
        // We have a token, verify it with the server
        try {
          const response = await authAPI.getCurrentUser();
          if (response.data.success && response.data.user) {
            setUser(response.data.user);
          } else {
            // Invalid response, clear tokens
            Cookies.remove('token');
            Cookies.remove('refreshToken');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token is invalid, clear cookies and set user to null
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          setUser(null);
        }
      } else {
        // No token found, user is definitely not authenticated
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }
      
      const { token, refreshToken, user } = response.data;

      // Store tokens in cookies
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('refreshToken', refreshToken || '', { expires: 30 });

      setUser(user);
    } catch (error: unknown) {
      throw new Error(apiUtils.handleApiError(error));
    }
  };

  const register = async (email: string, password: string, displayName: string, additionalData?: Record<string, unknown>): Promise<void> => {
    try {
      const response = await authAPI.register({
        email,
        password,
        displayName,
        ...additionalData,
      });
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }
      
      const { token, refreshToken, user } = response.data;

      // Store tokens in cookies
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('refreshToken', refreshToken || '', { expires: 30 });

      setUser(user);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      throw new Error(apiUtils.handleApiError(error));
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const response = await userAPI.updateProfile(data);
      setUser(response.data.data?.user || null);
    } catch (error: unknown) {
      throw new Error(apiUtils.handleApiError(error));
    }
  };

  // Helper function to check if user has tokens (indicating potential authentication)
  const hasToken = (): boolean => {
    return !!Cookies.get('token');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    hasToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};