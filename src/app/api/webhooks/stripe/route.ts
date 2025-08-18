import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment successful:', session.id);

        // Extract metadata
        const { courseId, userId } = session.metadata || {};
        
        if (!courseId || !userId) {
          console.error('Missing courseId or userId in session metadata');
          return NextResponse.json(
            { error: 'Missing required metadata' },
            { status: 400 }
          );
        }

        try {
          // Create order record in Firestore
          const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const orderData = {
            id: orderId,
            userId: userId,
            courseId: courseId,
            amountUSD: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'usd',
            status: 'paid',
            stripeSessionId: session.id,
            paymentIntentId: session.payment_intent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Save order to Firestore
          await setDoc(doc(db, 'orders', orderId), orderData);
          console.log('Order created:', orderId);

          // Add course to user's enrolled courses
          const userRef = doc(db, 'users', userId);
          
          // Check if user document exists
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            // Update existing user document
            await updateDoc(userRef, {
              enrolledCourses: arrayUnion(courseId),
              updatedAt: new Date().toISOString(),
            });
          } else {
            // Create new user document
            await setDoc(userRef, {
              enrolledCourses: [courseId],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          console.log(`User ${userId} enrolled in course ${courseId}`);

          // In a real application, you might also:
          // - Send confirmation email
          // - Update user's progress tracking
          // - Trigger analytics events
          // - Update course enrollment count

        } catch (firestoreError) {
          console.error('Error updating Firestore:', firestoreError);
          // Don't return error to Stripe - we received the payment
          // Log this for manual resolution
        }

        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // Handle failed payment (optional)
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};