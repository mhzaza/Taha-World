import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    // You can implement your admin check logic here
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Get analytics data
    const analytics = await getAnalyticsData(period);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getAnalyticsData(period: string) {
  try {
    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Check if db is initialized
    if (!db) {
      throw new Error('Firebase db is not initialized');
    }

    // Get users count
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const totalUsers = usersSnapshot.size;

    // Get courses count
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    const totalCourses = coursesSnapshot.size;

    // Get orders count and revenue
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    let totalRevenue = 0;
    let totalOrders = 0;
    
    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      if (order.status === 'completed' && order.createdAt?.toDate() >= startDate) {
        totalRevenue += order.amount || 0;
        totalOrders++;
      }
    });



    return {
      users: {
        total: totalUsers,
        growth: 0 // You can calculate growth percentage here
      },
      courses: {
        total: totalCourses,
        growth: 0
      },
      revenue: {
        total: totalRevenue,
        growth: 0
      },
      orders: {
        total: totalOrders,
        growth: 0
      },
      period
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    throw error;
  }
}