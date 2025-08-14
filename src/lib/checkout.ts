import { getStripe } from './stripe';
import { useAuth } from '@/contexts/AuthContext';

export interface CheckoutSessionRequest {
  courseId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Create checkout session and redirect to Stripe
export const createCheckoutSession = async (
  courseId: string,
  userToken?: string
): Promise<void> => {
  try {
    if (!userToken) {
      throw new Error('User must be authenticated to purchase a course');
    }

    // Call our API to create checkout session
    const response = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ courseId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { sessionId, url }: CheckoutSessionResponse = await response.json();

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
    } else {
      // Fallback: use Stripe.js to redirect
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

// Hook for handling checkout
export const useCheckout = () => {
  const { user } = useAuth();

  const initiateCheckout = async (courseId: string) => {
    if (!user) {
      throw new Error('User must be logged in to purchase a course');
    }

    // In a real app, you would get the user's ID token
    // For now, we'll use a placeholder
    const userToken = 'user_token_placeholder';
    
    await createCheckoutSession(courseId, userToken);
  };

  return {
    initiateCheckout,
    isAuthenticated: !!user,
  };
};

// Utility function to check if user is enrolled in a course
export const checkEnrollmentStatus = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    // In a real app, this would check Firestore
    // For now, we'll use localStorage as a fallback
    const enrolledCourses = JSON.parse(
      localStorage.getItem(`enrolled_courses_${userId}`) || '[]'
    );
    return enrolledCourses.includes(courseId);
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return false;
  }
};

// Utility function to mark user as enrolled (for demo purposes)
export const markUserEnrolled = (userId: string, courseId: string): void => {
  try {
    const enrolledCourses = JSON.parse(
      localStorage.getItem(`enrolled_courses_${userId}`) || '[]'
    );
    
    if (!enrolledCourses.includes(courseId)) {
      enrolledCourses.push(courseId);
      localStorage.setItem(
        `enrolled_courses_${userId}`,
        JSON.stringify(enrolledCourses)
      );
    }
  } catch (error) {
    console.error('Error marking user as enrolled:', error);
  }
};