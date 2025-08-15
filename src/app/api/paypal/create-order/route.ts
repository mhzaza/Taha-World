import { NextRequest, NextResponse } from 'next/server';
import { paypalClient, PayPalError, formatPayPalAmount } from '@/lib/paypal';
import { useCourses } from '@/hooks/useCourses';
import { courses } from '@/data/courses';

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
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

    // TODO: Verify user authentication
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    // Create PayPal order
    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: courseId,
          amount: {
            currency_code: 'USD',
            value: formatPayPalAmount(course.price),
          },
          description: `Course: ${course.title}`,
          custom_id: courseId,
        },
      ],
      application_context: {
        brand_name: 'Taha Sabag Sports Academy',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXTAUTH_URL}/success?courseId=${courseId}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/cancel?courseId=${courseId}`,
      },
    };

    const response = await paypalClient.ordersController.ordersCreate({
      body: orderRequest,
      prefer: 'return=representation',
    });

    if (!response.result) {
      throw new PayPalError('Failed to create PayPal order');
    }

    const order = response.result;

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      links: order.links,
    });
  } catch (error) {
    console.error('PayPal create order error:', error);

    if (error instanceof PayPalError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}