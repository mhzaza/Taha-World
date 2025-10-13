import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// تهيئة Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 بدء جلب الدورات من Firestore...');
    console.log('📊 Project ID:', process.env.FIREBASE_PROJECT_ID);

    // جلب جميع الدورات من مجموعة courses
    const coursesRef = db.collection('courses');
    const snapshot = await coursesRef.get();

    console.log('📈 عدد المستندات المسترجعة:', snapshot.size);

    if (snapshot.empty) {
      console.log('⚠️ لا توجد دورات في قاعدة البيانات');
      return NextResponse.json([], { status: 200 });
    }

    // تحويل البيانات إلى مصفوفة
    const courses = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 بيانات الدورة:', doc.id, data);
      
      return {
        id: doc.id,
        ...data,
        // تحويل Timestamps إلى strings إذا كانت موجودة
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    console.log('✅ تم جلب الدورات بنجاح:', courses.length, 'دورة');
    return NextResponse.json(courses, { status: 200 });

  } catch (error) {
    console.error('❌ خطأ في جلب الدورات:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الدورات', details: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 إنشاء دورة جديدة:', body);

    // إضافة timestamp للإنشاء
    const courseData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // إضافة الدورة إلى Firestore
    const docRef = await db.collection('courses').add(courseData);
    
    console.log('✅ تم إنشاء الدورة بنجاح:', docRef.id);
    
    return NextResponse.json(
      { id: docRef.id, ...courseData },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ خطأ في إنشاء الدورة:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الدورة', details: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    );
  }
}