import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    // Check if private key is still a placeholder
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----')) {
      throw new Error('Firebase Admin private key is still a placeholder. Please update FIREBASE_PRIVATE_KEY in your .env.local file');
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    console.log('✅ Firebase Admin SDK initialized successfully for single course API');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  }
}

const db = getFirestore();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 Fetching course with ID: ${id}`);

    // Validate course ID
    if (!id || id.trim() === '') {
      console.log('❌ Invalid course ID provided');
      return NextResponse.json(
        { error: 'معرف الدورة مطلوب', message: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get course from Firestore
    const courseDoc = await db.collection('courses').doc(id).get();
    
    if (!courseDoc.exists) {
      console.log(`❌ Course not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'الدورة غير موجودة', message: 'Course not found' },
        { status: 404 }
      );
    }

    const courseData = courseDoc.data();
    
    // Convert Firestore Timestamps to ISO strings
    const convertTimestamps = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      
      if (obj.toDate && typeof obj.toDate === 'function') {
        return obj.toDate().toISOString();
      }
      
      if (Array.isArray(obj)) {
        return obj.map(convertTimestamps);
      }
      
      if (typeof obj === 'object') {
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
          converted[key] = convertTimestamps(value);
        }
        return converted;
      }
      
      return obj;
    };

    const course = {
      id: courseDoc.id,
      ...convertTimestamps(courseData)
    };

    console.log(`✅ Successfully fetched course: ${course.title || 'Untitled'}`);
    console.log(`📚 Course has ${course.lessons?.length || 0} lessons`);

    return NextResponse.json(course);

  } catch (error) {
    console.error('❌ Error fetching course:', error);
    
    // Handle specific Firebase errors
    if (error instanceof Error) {
      if (error.message.includes('Failed to parse private key')) {
        return NextResponse.json(
          { 
            error: 'خطأ في إعدادات Firebase', 
            message: 'Firebase configuration error. Please check your private key format.',
            details: 'The Firebase Admin private key appears to be incorrectly formatted. Please ensure it\'s properly set in your environment variables.'
          },
          { status: 500 }
        );
      }
      
      if (error.message.includes('permission-denied')) {
        return NextResponse.json(
          { 
            error: 'خطأ في الصلاحيات', 
            message: 'Permission denied. Please check Firestore security rules.',
            details: 'The service account may not have sufficient permissions to read from the courses collection.'
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'خطأ في الخادم', 
        message: 'Internal server error while fetching course',
        details: process.env.NODE_ENV === 'development' ? error : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 Updating course with ID: ${id}`);

    // Validate course ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'معرف الدورة مطلوب', message: 'Course ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Remove id from body if present to prevent overwriting
    const { id: bodyId, ...updateData } = body;

    // Add timestamp for last update
    const updatedCourse = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Update course document
    await db.collection('courses').doc(id).update(updatedCourse);

    console.log(`✅ Successfully updated course: ${id}`);

    return NextResponse.json({ 
      message: 'تم تحديث الدورة بنجاح', 
      courseId: id 
    });

  } catch (error) {
    console.error('❌ Error updating course:', error);
    
    return NextResponse.json(
      { 
        error: 'خطأ في تحديث الدورة', 
        message: 'Failed to update course',
        details: process.env.NODE_ENV === 'development' ? error : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🗑️ Deleting course with ID: ${id}`);

    // Validate course ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'معرف الدورة مطلوب', message: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if course exists before deleting
    const courseDoc = await db.collection('courses').doc(id).get();
    
    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: 'الدورة غير موجودة', message: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course document
    await db.collection('courses').doc(id).delete();

    console.log(`✅ Successfully deleted course: ${id}`);

    return NextResponse.json({ 
      message: 'تم حذف الدورة بنجاح', 
      courseId: id 
    });

  } catch (error) {
    console.error('❌ Error deleting course:', error);
    
    return NextResponse.json(
      { 
        error: 'خطأ في حذف الدورة', 
        message: 'Failed to delete course',
        details: process.env.NODE_ENV === 'development' ? error : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
