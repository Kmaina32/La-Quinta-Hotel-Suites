import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function BookingsPage() {
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
          <Card>
            <CardHeader>
              <CardTitle>No Upcoming Bookings</CardTitle>
              <CardDescription>
                You have no upcoming reservations. Why not book a stay with us?
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Past Bookings</h2>
          <Card className="opacity-70">
            <CardHeader>
               <CardTitle>No Past Bookings</CardTitle>
              <CardDescription>
                You have no past reservations. We hope to see you soon!
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
    </div>
  );
}
