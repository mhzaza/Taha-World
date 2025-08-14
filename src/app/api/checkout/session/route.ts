import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatPriceForStripe } from '@/lib/stripe';
import { auth } from '@/lib/firebase';
import { useCourses } from '@/hooks/useCourses';
import { courses } from '@/data/courses';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For now, we'll skip Firebase auth verification and use a simple check
    // In production, you would verify the Firebase ID token here
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Find the course
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description,
              images: course.thumbnail ? [course.thumbnail] : [],
            },
            unit_amount: formatPriceForStripe(course.price),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel?course_id=${courseId}`,
      metadata: {
        courseId: courseId,
        userId: 'user_placeholder', // In production, extract from verified token
      },
      customer_email: 'test@example.com', // In production, get from user profile
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}