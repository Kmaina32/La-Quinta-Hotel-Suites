
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmBookingFromWebhook } from '@/lib/actions';

export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return new NextResponse('Paystack secret key is not configured.', { status: 500 });
  }

  const signature = request.headers.get('x-paystack-signature');
  const body = await request.text();

  if (!signature) {
    return new NextResponse('No signature found.', { status: 401 });
  }

  // Verify the webhook signature
  const hash = crypto.createHmac('sha512', secretKey).update(body).digest('hex');
  if (hash !== signature) {
    return new NextResponse('Invalid signature.', { status: 401 });
  }

  // Parse the event
  const event = JSON.parse(body);

  try {
    // Handle only successful charges
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      // Use a server action to update the booking status in Firestore
      await confirmBookingFromWebhook(reference);
    }
    
    return new NextResponse('Webhook processed.', { status: 200 });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
}
