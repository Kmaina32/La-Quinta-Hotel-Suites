
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPaystackTransaction } from '@/lib/actions';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment, please wait...');

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found. Your booking may not have been completed.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const transaction = await verifyPaystackTransaction(reference);
        if (transaction.status === 'success') {
          setStatus('success');
          setMessage('Payment successful! Your booking is confirmed.');
        } else {
          setStatus('failed');
          setMessage(`Payment ${transaction.status}. Your booking was not completed.`);
        }
      } catch (error: any) {
        setStatus('failed');
        setMessage(error.message || 'An error occurred while verifying your payment.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success') {
      setTimeout(() => {
        router.push('/bookings');
      }, 5000); // Redirect after 5 seconds
    }
  }, [status, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center p-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-semibold">Verifying Payment...</h1>
          <p className="text-muted-foreground mt-2">{message}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-semibold">Payment Successful!</h1>
          <p className="text-muted-foreground mt-2">{message}</p>
          <p className="text-sm text-muted-foreground mt-2">You will be redirected to your bookings page shortly.</p>
          <Button asChild className="mt-6">
            <Link href="/bookings">Go to My Bookings</Link>
          </Button>
        </>
      )}
      {status === 'failed' && (
        <>
          <XCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-semibold">Payment Failed</h1>
          <p className="text-muted-foreground mt-2">{message}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/#rooms">Try Again</Link>
          </Button>
        </>
      )}
    </div>
  );
}


export default function BookingStatusPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>}>
            <StatusContent />
        </Suspense>
    )
}
