
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getBookingsForUser } from '@/lib/actions';
import type { Booking } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Hotel, History, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function BookingItem({ booking }: { booking: Booking }) {
    return (
        <div className="flex items-start gap-4 py-4">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={booking.roomImage} alt={booking.roomName} fill style={{ objectFit: 'cover' }} />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <p className="font-semibold">{booking.roomName}</p>
                    <div className={cn("flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                        {booking.status === 'confirmed' ? <CheckCircle className="h-3 w-3 mr-1"/> : <XCircle className="h-3 w-3 mr-1"/>}
                        {booking.status}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.checkIn), 'MMM dd, yyyy')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">{booking.nights} night(s) &bull; KES {booking.totalCost.toFixed(2)}</p>
            </div>
        </div>
    )
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        setLoading(true);
        const userBookings = await getBookingsForUser(user.uid);
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
  const upcomingBookings = bookings.filter(b => new Date(b.checkIn) >= now && b.status === 'confirmed');
  const pastBookings = bookings.filter(b => new Date(b.checkIn) < now || b.status === 'cancelled');

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-muted-foreground mb-8">
        Welcome, {user.email}! Here are your reservations.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Hotel className="h-6 w-6 text-primary" /> Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
                <div className="divide-y">
                    {upcomingBookings.map((booking, index) => (
                        <BookingItem key={booking.id} booking={booking}/>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You have no upcoming reservations.</p>
                    <Button asChild>
                        <Link href="/#rooms">Book a Stay</Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Past Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-6 w-6 text-muted-foreground" /> Past & Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
             {pastBookings.length > 0 ? (
                 <div className="divide-y">
                    {pastBookings.map(booking => (
                        <BookingItem key={booking.id} booking={booking}/>
                    ))}
                </div>
             ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">You have no past reservations.</p>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
