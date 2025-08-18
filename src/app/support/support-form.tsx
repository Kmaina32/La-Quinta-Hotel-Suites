
'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { generateResponse, type State } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Generating...' : 'Get Help'}
    </Button>
  );
}

export default function SupportForm() {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(generateResponse, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && state.message.startsWith('Failed')) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
    if (state.response) {
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline">Customer Inquiry</CardTitle>
          <CardDescription>
            Enter your booking details and question below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookingDetails">Booking Details</Label>
            <Textarea
              id="bookingDetails"
              name="bookingDetails"
              placeholder="e.g., Booking ID: BK12345, Name: John Doe, Check-in: 2024-08-15"
              rows={4}
              aria-describedby="booking-details-error"
            />
            <div id="booking-details-error" aria-live="polite" aria-atomic="true">
              {state.errors?.bookingDetails &&
                state.errors.bookingDetails.map((error: string) => (
                  <p className="mt-2 text-sm text-destructive" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerInquiry">Your Inquiry</Label>
            <Textarea
              id="customerInquiry"
              name="customerInquiry"
              placeholder="e.g., I would like to request a late check-out."
              rows={4}
              aria-describedby="customer-inquiry-error"
            />
            <div id="customer-inquiry-error" aria-live="polite" aria-atomic="true">
              {state.errors?.customerInquiry &&
                state.errors.customerInquiry.map((error: string) => (
                  <p className="mt-2 text-sm text-destructive" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>

      {state.response && (
        <Card className="m-6 mt-0 bg-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-lg">
              <Wand2 className="h-5 w-5 text-primary" />
              AI Generated Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{state.response}</p>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
