import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getUserBookings } from '@/lib/services/bookingService';
import { auth } from '@/lib/firebase-admin';

// GET /api/bookings - Get all bookings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get bookings for the user
    const bookings = await getUserBookings(userId);
    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('Error getting bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['consultationId', 'timeSlotId', 'amount', 'currency'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create booking
    const result = await createBooking({
      userId,
      consultationId: data.consultationId,
      timeSlotId: data.timeSlotId,
      status: 'pending',
      notes: data.notes,
      paymentStatus: 'pending',
      paymentMethod: data.paymentMethod,
      amount: data.amount,
      currency: data.currency,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}