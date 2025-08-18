import { NextRequest, NextResponse } from 'next/server';
import { paypalClient, PayPalError, validatePayPalCapture } from '@/lib/paypal';
import { markUserEnrolled } from '@/lib/checkout';

export async function POST(request: NextRequest) {
  try {
    const { orderId, userId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // TODO: Verify user authentication and get userId from token
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    // Capture the PayPal order
    const response = await paypalClient.ordersController.ordersCapture({
      id: orderId,
      prefer: 'return=representation',
    });

    if (!response.result) {
      throw new PayPalError('Failed to capture PayPal order');
    }

    const captureResult = response.result;

    // Validate the capture
    if (!validatePayPalCapture(captureResult)) {
      return NextResponse.json(
        { error: 'Payment capture failed or incomplete' },
        { status: 400 }
      );
    }

    // Extract course information from the order
    const purchaseUnit = captureResult.purchase_units[0];
    const courseId = purchaseUnit.reference_id;
    const captureDetails = purchaseUnit.payments.captures[0];
    const amountPaid = parseFloat(captureDetails.amount.value);

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID not found in order' },
        { status: 400 }
      );
    }

    // Create order record (mock implementation)
    const orderRecord = {
      id: captureResult.id,
      userId: userId || 'demo_user', // TODO: Get from authenticated user
      courseId,
      amountUSD: amountPaid,
      currency: captureDetails.amount.currency_code,
      status: 'paid',
      paymentMethod: 'paypal',
      paypalOrderId: orderId,
      paypalCaptureId: captureDetails.id,
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to Firestore
    // await saveOrderToFirestore(orderRecord);
    console.log('Order created:', orderRecord);

    // Enroll user in course
    const demoUserId = userId || 'demo_user';
    markUserEnrolled(demoUserId, courseId);

    // TODO: Add courseId to user's enrolled list in Firestore
    // await addCourseToUserEnrollment(demoUserId, courseId);

    return NextResponse.json({
      success: true,
      orderId: captureResult.id,
      status: captureResult.status,
      courseId,
      amountPaid,
      currency: captureDetails.amount.currency_code,
    });
  } catch (error) {
    console.error('PayPal capture order error:', error);

    if (error instanceof PayPalError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    // Handle PayPal API errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return NextResponse.json(
        { error: 'PayPal API error', details: error },
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