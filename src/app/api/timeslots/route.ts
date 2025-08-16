import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlots, createTimeSlot } from '@/lib/services/bookingService';
import { isAdmin } from '@/lib/admin';
import { auth } from '@/lib/firebase-admin';

// GET /api/timeslots?consultationId=xxx - Get available time slots for a consultation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consultationId = searchParams.get('consultationId');

    if (!consultationId) {
      return NextResponse.json(
        { success: false, error: 'Consultation ID is required' },
        { status: 400 }
      );
    }

    const timeSlots = await getAvailableTimeSlots(consultationId);
    return NextResponse.json({ success: true, data: timeSlots });
  } catch (error: any) {
    console.error('Error getting time slots:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get time slots' },
      { status: 500 }
    );
  }
}

// POST /api/timeslots - Create a new time slot (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin status
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const adminStatus = await isAdmin(decodedToken.email || '');

    if (!adminStatus) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['consultationId', 'startTime', 'endTime'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate time format
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid time format' },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    if (startTime < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Cannot create time slots in the past' },
        { status: 400 }
      );
    }

    // Create time slot
    const result = await createTimeSlot({
      consultationId: data.consultationId,
      startTime,
      endTime,
      isAvailable: true,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating time slot:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create time slot' },
      { status: 500 }
    );
  }
}