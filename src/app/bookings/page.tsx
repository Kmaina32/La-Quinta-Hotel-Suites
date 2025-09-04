
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ArrowRight } from 'lucide-react';

export default function BookingsPage() {

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your reservations.
            </p>
          </div>

          <Card>
              <CardHeader>
                  <CardTitle>Manage Your Booking</CardTitle>
                  <CardDescription>
                      To manage your booking, please use the contact information provided or visit our support page.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="text-center text-muted-foreground">
                      <p>For any inquiries about your reservation, please don't hesitate to reach out.</p>
                      <Link href="/support">
                          <Button variant="link">
                            Contact Support <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                      </Link>
                  </div>
              </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
