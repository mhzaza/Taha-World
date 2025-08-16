import { NextRequest, NextResponse } from 'next/server';
import { getConsultations, createConsultation } from '@/lib/services/bookingService';
import { isAdmin } from '@/lib/admin';
import { auth } from '@/lib/firebase-admin';

// GET /api/consultations - Get all active consultations
export async function GET(request: NextRequest) {
  try {
    const consultations = await getConsultations();
    return NextResponse.json({ success: true, data: consultations });
  } catch (error: any) {
    console.error('Error getting consultations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get consultations' },
      { status: 500 }
    );
  }
}

// POST /api/consultations - Create a new consultation (admin only)
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
    const requiredFields = ['title', 'description', 'duration', 'price', 'currency', 'type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create consultation
    const result = await createConsultation({
      title: data.title,
      description: data.description,
      duration: data.duration,
      price: data.price,
      currency: data.currency,
      type: data.type,
      isActive: data.isActive !== undefined ? data.isActive : true,
      tags: data.tags || [],
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create consultation' },
      { status: 500 }
    );
  }
}