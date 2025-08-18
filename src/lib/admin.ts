import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Check if a user is an admin based on email allowlist
 * @param email - User's email address
 * @returns boolean indicating if user is admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  // استخدام NEXT_PUBLIC_ADMIN_EMAILS للعميل و ADMIN_EMAILS للخادم
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
  const allowedEmails = adminEmails.split(',').map(e => e.trim().toLowerCase());
  
  console.log('Admin emails from env:', adminEmails);
  console.log('Checking email:', email.toLowerCase());
  console.log('Allowed emails:', allowedEmails);
  
  return allowedEmails.includes(email.toLowerCase());
}

/**
 * Check if a user has admin privileges
 * This function checks both email allowlist and potential admin flag in user document
 * @param user - Firebase user object
 * @returns Promise<boolean> indicating if user is admin
 */
export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    console.log('isUserAdmin: Starting check for user:', user.email);
    
    // First check if email is in admin list
    const emailCheck = isAdminEmail(user.email);
    console.log('isUserAdmin: Email check result:', emailCheck);
    
    if (emailCheck) {
      console.log('isUserAdmin: User is admin by email');
      return true;
    }

    // Then check Firestore for admin flag
    console.log('isUserAdmin: Checking Firestore for user:', user.uid);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('isUserAdmin: User document data:', userData);
      const isAdmin = userData?.isAdmin === true;
      console.log('isUserAdmin: Firestore admin check result:', isAdmin);
      return isAdmin;
    } else {
      console.log('isUserAdmin: User document does not exist');
    }

    console.log('isUserAdmin: User is not admin');
    return false;
  } catch (error) {
    console.error('isUserAdmin: Error checking admin status:', error);
    return false;
  }
}

/**
 * Server-side admin check for API routes
 * @param email - User's email from server-side auth
 * @param uid - User's UID for document check
 * @returns Promise<boolean> indicating if user is admin
 */
export async function isServerAdmin(email: string | null, uid?: string): Promise<boolean> {
  if (!email) return false;
  
  // Check email allowlist
  if (isAdminEmail(email)) {
    return true;
  }
  
  // If UID provided, check user document
  if (uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.data();
      return userData?.isAdmin === true;
    } catch (error) {
      console.error('Error checking server admin status:', error);
      return false;
    }
  }
  
  return false;
}

/**
 * Admin role types
 */
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

/**
 * Get user's admin role
 * @param user - Firebase user object
 * @returns Promise<AdminRole | null>
 */
export async function getUserAdminRole(user: User | null): Promise<AdminRole | null> {
  if (!user) return null;
  
  const isAdmin = await isUserAdmin(user);
  if (!isAdmin) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    return userData?.adminRole || AdminRole.ADMIN;
  } catch (error) {
    console.error('Error getting user admin role:', error);
    return AdminRole.ADMIN; // Default to basic admin
  }
}

/**
 * Check if user has specific admin permission
 * @param user - Firebase user object
 * @param permission - Permission to check
 * @returns Promise<boolean>
 */
export async function hasAdminPermission(
  user: User | null, 
  permission: 'courses.create' | 'courses.edit' | 'courses.delete' | 'users.manage' | 'orders.view' | 'analytics.view'
): Promise<boolean> {
  const role = await getUserAdminRole(user);
  if (!role) return false;
  
  // Super admin has all permissions
  if (role === AdminRole.SUPER_ADMIN) return true;
  
  // Define role permissions
  const rolePermissions = {
    [AdminRole.ADMIN]: [
      'courses.create', 'courses.edit', 'courses.delete',
      'users.manage', 'orders.view', 'analytics.view'
    ],
    [AdminRole.MODERATOR]: [
      'courses.edit', 'orders.view'
    ]
  };
  
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  id?: string;
  adminEmail: string;
  action: string;
  target: string;
  targetId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

/**
 * Log admin action for audit trail
 * @param entry - Audit log entry
 */
export async function logAdminAction(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  try {
    const { addDoc, collection } = await import('firebase/firestore');
    
    await addDoc(collection(db, 'audit_logs'), {
      ...entry,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Common admin actions for audit logging
 */
export const AdminActions = {
  COURSE_CREATE: 'course.create',
  COURSE_UPDATE: 'course.update',
  COURSE_DELETE: 'course.delete',
  COURSE_PUBLISH: 'course.publish',
  COURSE_UNPUBLISH: 'course.unpublish',
  USER_ENROLL: 'user.enroll',
  USER_UNENROLL: 'user.unenroll',
  USER_UPDATE: 'user.update',
  ORDER_UPDATE: 'order.update',
  SETTINGS_UPDATE: 'settings.update'
} as const;