import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BookingsPage() {
  // Mock data for bookings - in a real app, this would come from a database
  const upcomingBookings = [
    {
      id: '1',
      roomName: 'Deluxe King Suite',
      checkIn: '2024-08-15',
      checkOut: '2024-08-20',
      price: 1250,
    },
  ];

  const pastBookings = [
    {
      id: '2',
      roomName: 'Standard Queen Room',
      checkIn: '2024-01-10',
      checkOut: '2024-01-12',
      price: 400,
    },
     {
      id: '3',
      roomName: 'Conference Room',
      checkIn: '2023-11-20',
      checkOut: '2023-11-20',
      price: 500,
    },
  ];

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {/* This is a placeholder for where login status would be checked */}
      <div className="mb-8">
        <p className="text-muted-foreground">
          Welcome back! Here are your upcoming and past reservations.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Bookings</h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-6">
              {upcomingBookings.map(booking => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle>{booking.roomName}</CardTitle>
                    <CardDescription>
                      Check-in: {booking.checkIn} &bull; Check-out: {booking.checkOut}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center">
                    <p className="text-lg font-semibold">${booking.price}</p>
                    <Button variant="outline">Modify Booking</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p>You have no upcoming bookings.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Past Bookings</h2>
          {pastBookings.length > 0 ? (
            <div className="grid gap-6">
              {pastBookings.map(booking => (
                <Card key={booking.id} className="opacity-70">
                   <CardHeader>
                    <CardTitle>{booking.roomName}</CardTitle>
                    <CardDescription>
                      Stayed from {booking.checkIn} to {booking.checkOut}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center">
                     <p className="text-lg font-semibold">${booking.price}</p>
                    <Button variant="secondary">Leave a Review</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p>You have no past bookings.</p>
          )}
        </section>
      </div>
    </div>
  );
}
