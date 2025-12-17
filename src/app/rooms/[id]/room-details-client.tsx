
'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bath, BedDouble, User, Loader2, Calendar as CalendarIcon, CreditCard, AlertCircle } from 'lucide-react';
import { createBooking } from '@/lib/actions';
import type { Room } from '@/lib/types';
import { format, addDays, eachDayOfInterval } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function RoomDetailsClient({ room }: { room: Room }) {
  const [isBooking, setIsBooking] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });

    const isRoomAvailable = useMemo(() => {
        if (!date?.from || !date?.to) return false;

        const bookingDates = eachDayOfInterval({
            start: date.from,
            end: date.to
        });

        for (const day of bookingDates) {
            const dateString = format(day, 'yyyy-MM-dd');
            const bookedCount = room.booked?.[dateString] || 0;
            if (bookedCount >= room.inventory) {
                return false; // Not available on this day
            }
        }
        return true; // Available for all selected dates
    }, [date, room.booked, room.inventory]);


  const handleBooking = async (paymentMethod: string) => {
    if (!user) {
       toast({
          title: "Please Login",
          description: "You need to be logged in to make a booking.",
          variant: "destructive",
       });
       router.push('/login');
       return;
    }
    
    if (!room || !date?.from || !date?.to) {
        toast({ title: "Booking Error", description: "Please select a valid date range.", variant: "destructive" });
        return;
    }

    if (!isRoomAvailable) {
        toast({ title: "Not Available", description: "This room is fully booked for the selected dates. Please choose different dates.", variant: "destructive" });
        return;
    }
    
    setIsBooking(true);
    try {
        const nights = Math.round((date.to.getTime() - date.from.getTime()) / (1000 * 3600 * 24));
        if (nights <= 0) {
            toast({ title: "Invalid Date Range", description: "Check-out date must be after check-in date.", variant: "destructive"});
            setIsBooking(false);
            return;
        }
        const totalCost = nights * room.price;

        const bookingData = {
            userId: user.uid,
            userEmail: user.email!,
            roomId: room.id,
            roomName: room.name,
            roomImage: room.imageUrl,
            checkIn: date.from.toISOString(),
            checkOut: date.to.toISOString(),
            nights,
            totalCost,
            paymentMethod,
        };

        await createBooking(bookingData);

        toast({
            title: "Booking Successful!",
            description: `Your stay at ${room.name} has been reserved.`,
        });

        router.push('/bookings');

    } catch (error: any) {
        console.error("Failed to create booking:", error);
        toast({
            title: "Booking Failed",
            description: error.message || "Something went wrong. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsBooking(false);
    }
  };

  const nights = date?.to && date?.from ? Math.max(0, Math.round((date.to.getTime() - date.from.getTime()) / (1000 * 3600 * 24))) : 0;
  const totalCost = nights * room.price;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
        <div className="relative h-96 w-full rounded-lg overflow-hidden md:col-span-2">
          <Image
            src={room.imageUrl}
            alt={room.name}
            fill
            style={{ objectFit: 'cover' }}
            className="hover:scale-105 transition-transform duration-300"
            data-ai-hint="hotel room interior"
          />
        </div>
        {room.images && room.images.filter(image => image.src).map(image => (
          <div key={image.id} className="relative h-48 w-full rounded-lg overflow-hidden">
             <Image
                src={image.src}
                alt={image.alt}
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
                data-ai-hint="hotel room detail"
              />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{room.name}</h1>
          <p className="text-lg text-muted-foreground mb-6">{room.description}</p>
          <div className="flex flex-wrap gap-6 text-lg mb-6">
            <div className="flex items-center gap-2">
              <User className="text-primary"/>
              <span>{room.capacity} Guests</span>
            </div>
            {room.type !== 'conference' && (
              <>
                <div className="flex items-center gap-2">
                  <BedDouble className="text-primary"/>
                  <span>{room.beds} Bed(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="text-primary"/>
                  <span>{room.baths} Bath(s)</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl">Book Your Stay</CardTitle>
              <CardDescription>
                 <span className="text-3xl font-bold text-foreground">KES {room.price}</span>
                 <span className="text-base font-normal text-muted-foreground"> / night</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dates">Check-in / Check-out</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                        disabled={isBooking}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                        disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {nights > 0 && (
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>{nights} night{nights > 1 ? 's' : ''}</span>
                      <span>KES {totalCost.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>KES {totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                {!isRoomAvailable && nights > 0 && (
                    <div className="flex items-center gap-2 text-sm text-destructive font-semibold bg-destructive/10 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span>Unavailable for selected dates</span>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Tabs defaultValue="card" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card" disabled={isBooking}>Card</TabsTrigger>
                    <TabsTrigger value="paystack" disabled={isBooking}>Paystack</TabsTrigger>
                    <TabsTrigger value="mpesa" disabled={isBooking}>M-Pesa</TabsTrigger>
                  </TabsList>
                  <TabsContent value="card" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Cardholder Name" disabled={isBooking} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="card">Card Information</Label>
                      <div className="flex items-center gap-2 border rounded-md px-3">
                         <CreditCard className="h-5 w-5 text-muted-foreground" />
                         <Input id="card" placeholder="Card Number" className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" disabled={isBooking} />
                      </div>
                    </div>
                    <Button size="lg" className="w-full" onClick={() => handleBooking('Credit Card')} disabled={isBooking || nights <= 0 || !isRoomAvailable}>
                      {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      { user ? 'Reserve Now' : 'Login to Book' }
                    </Button>
                  </TabsContent>
                   <TabsContent value="paystack" className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground mb-4">You will be redirected to Paystack to complete your payment.</p>
                       <Button size="lg" className="w-full" onClick={() => handleBooking('Paystack')} disabled={isBooking || nights <= 0 || !isRoomAvailable}>
                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        { user ? 'Pay with Paystack' : 'Login to Book' }
                      </Button>
                   </TabsContent>
                   <TabsContent value="mpesa" className="mt-4 space-y-4">
                       <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="e.g. 0712345678" disabled={isBooking} />
                      </div>
                       <Button size="lg" className="w-full" onClick={() => handleBooking('M-Pesa')} disabled={isBooking || nights <= 0 || !isRoomAvailable}>
                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        { user ? 'Pay with M-Pesa' : 'Login to Book' }
                      </Button>
                   </TabsContent>
                </Tabs>
            </CardFooter>
            <p className="text-xs text-muted-foreground text-center pb-4">You won't be charged yet</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
