
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getBookings } from '@/lib/actions';
import type { Booking } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        setLoading(true);
        const userBookings = await getBookings(user.uid);
        setBookings(userBookings);
        setLoading(false);
      };
      fetchBookings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="container mx-auto py-12 text-center">
         <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
         <p className="text-muted-foreground mb-8">Please log in to view your bookings.</p>
         <Button asChild>
          <Link href="/login">Login</Link>
         </Button>
      </div>
    );
  }

  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.checkIn) >= now);
  const pastBookings = bookings.filter(b => new Date(b.checkIn) < now);

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-muted-foreground mb-8">
        Welcome, {user.email}! Here are your upcoming and past reservations.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Bookings</h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map(booking => (
                <Card key={booking.id} className="overflow-hidden">
                   <CardContent className="p-0">
                    <div className="relative h-56 w-full">
                       <Image src={booking.roomImage} alt={booking.roomName} fill style={{ objectFit: 'cover' }} />
                    </div>
                  </CardContent>
                  <CardHeader>
                    <CardTitle>{booking.roomName}</CardTitle>
                    <CardDescription>
                      {format(new Date(booking.checkIn), 'EEE, MMM dd, yyyy')} - {format(new Date(booking.checkOut), 'EEE, MMM dd, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between text-sm">
                    <p className="font-semibold">Total: KES {booking.totalCost.toFixed(2)}</p>
                    <p className="text-muted-foreground">{booking.nights} night(s)</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Upcoming Bookings</CardTitle>
                <CardDescription>
                  You have no upcoming reservations. Why not book a stay with us?
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Past Bookings</h2>
           {pastBookings.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {pastBookings.map(booking => (
                 <Card key={booking.id} className="overflow-hidden opacity-75">
                   <CardContent className="p-0">
                    <div className="relative h-56 w-full">
                       <Image src={booking.roomImage} alt={booking.roomName} fill style={{ objectFit: 'cover' }} />
                    </div>
                  </CardContent>
                  <CardHeader>
                    <CardTitle>{booking.roomName}</CardTitle>
                    <CardDescription>
                      {format(new Date(booking.checkIn), 'EEE, MMM dd, yyyy')} - {format(new Date(booking.checkOut), 'EEE, MMM dd, yyyy')}
                    </CardDescription>
                  </CardHeader>
                   <CardFooter className="flex justify-between text-sm">
                    <p className="font-semibold">Total: KES {booking.totalCost.toFixed(2)}</p>
                    <p className="text-muted-foreground">{booking.nights} night(s)</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="opacity-70">
              <CardHeader>
                <CardTitle>No Past Bookings</CardTitle>
                <CardDescription>
                  You have no past reservations. We hope to see you soon!
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
