'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Booking } from '@/lib/data';
import { getBookingsForUser } from './actions';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
      } else {
        const fetchBookings = async () => {
          const userBookings = await getBookingsForUser(user.uid);
          setBookings(userBookings);
          setIsLoading(false);
        };
        fetchBookings();
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
            <p className="mt-2 text-muted-foreground">
              Here you can view and manage your reservations.
            </p>
          </div>

          <div className="grid gap-6">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <Card key={booking.id} className="w-full">
                  <CardHeader>
                    <div className="flex flex-col justify-between md:flex-row md:items-start">
                      <div>
                        <CardTitle className="font-headline text-2xl">{booking.roomName}</CardTitle>
                        <CardDescription>Booking ID: {booking.id.slice(-6)}</CardDescription>
                         {booking.allocatedRoomNumber && (
                           <p className="text-sm text-muted-foreground">
                                Room Number: <span className="font-bold text-primary">{booking.allocatedRoomNumber}</span>
                           </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          booking.status === 'Confirmed'
                            ? 'default'
                            : booking.status === 'Cancelled'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className={cn(
                          'mt-2 w-fit md:mt-0',
                          booking.status === 'Confirmed' && 'bg-green-600 text-white'
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="font-semibold">Check-in</p>
                        <p>{booking.checkIn}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Check-out</p>
                        <p>{booking.checkOut}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Guests</p>
                        <p>{booking.guests}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Total Price</p>
                        <p>Ksh {booking.totalPrice}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/support" className="ml-auto">
                      <Button variant="ghost">
                        Need help? <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            <p>You have no bookings yet.</p>
                            <Link href="/#rooms">
                                <Button variant="link">Explore Rooms</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
