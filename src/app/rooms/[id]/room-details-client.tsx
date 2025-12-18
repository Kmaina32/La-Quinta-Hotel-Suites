
'use client';
import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Bath, BedDouble, User, Loader2, Calendar as CalendarIcon, CreditCard, AlertCircle, Clock } from 'lucide-react';
import { createBooking, initializePaystackTransaction } from '@/lib/actions';
import type { Room } from '@/lib/types';
import { format, addDays, eachDayOfInterval, differenceInCalendarDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import PaystackPop from '@paystack/inline-js';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"


export default function RoomDetailsClient({ room }: { room: Room }) {
  const [isBooking, setIsBooking] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));


  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });

    const isRoomAvailable = useMemo(() => {
        if (!date?.from || !date?.to) return false;

        const bookingDates = eachDayOfInterval({
            start: date.from,
            end: date.to
        });

        // Don't check availability for the last day (check-out day)
        for (const day of bookingDates.slice(0, -1)) {
            const dateString = format(day, 'yyyy-MM-dd');
            const bookedCount = room.booked?.[dateString] || 0;
            if (bookedCount >= room.inventory) {
                return false; // Not available on this day
            }
        }
        return true; // Available for all selected dates
    }, [date, room.booked, room.inventory]);


    const handleBooking = async (paymentMethod: string, transactionRef?: string) => {
        if (!user) return; // Should be handled by UI checks already

        setIsBooking(true);
        setActivePaymentMethod(paymentMethod);
        
        try {
            const nights = differenceInCalendarDays(date!.to!, date!.from!);
            const totalCost = nights * room.price;
            const isReservation = paymentMethod === 'Pay at Hotel';

            const bookingData = {
                userId: user.uid,
                userEmail: user.email!,
                roomId: room.id,
                roomName: room.name,
                roomImage: room.imageUrl,
                checkIn: date!.from!.toISOString(),
                checkOut: date!.to!.toISOString(),
                nights,
                totalCost,
                paymentMethod,
                ...(transactionRef && { transactionRef }),
            };

            await createBooking(bookingData, isReservation);

            toast({
                title: isReservation ? "Reservation Successful!" : "Booking Successful!",
                description: `Your stay at ${room.name} has been ${isReservation ? 'reserved' : 'booked'}.`,
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
            setActivePaymentMethod('');
        }
    };


  const preBookingCheck = () => {
    if (!user) {
       toast({
          title: "Please Login",
          description: "You need to be logged in to make a booking.",
          variant: "destructive",
       });
       router.push('/login?redirect=/rooms/' + room.id);
       return false;
    }
    
    if (!room || !date?.from || !date?.to) {
        toast({ title: "Booking Error", description: "Please select a valid date range.", variant: "destructive" });
        return false;
    }

    const nights = differenceInCalendarDays(date.to, date.from);
    if (nights <= 0) {
        toast({ title: "Invalid Date Range", description: "Check-out date must be after check-in date.", variant: "destructive"});
        return false;
    }

    if (!isRoomAvailable) {
        toast({ title: "Not Available", description: "This room is fully booked for the selected dates. Please choose different dates.", variant: "destructive" });
        return false;
    }
    return true;
  }

  const handlePaystackPayment = async () => {
    if (!preBookingCheck()) return;

    setIsBooking(true);
    setActivePaymentMethod('Paystack');

    try {
        const nights = differenceInCalendarDays(date!.to!, date!.from!);
        const totalCost = nights * room.price;

        const transactionData = await initializePaystackTransaction(user!.email!, totalCost);
        
        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!, // Public key from env vars
            email: user!.email!,
            amount: totalCost * 100,
            access_code: transactionData.access_code,
            onSuccess: (transaction) => {
                // Pass the reference to the booking handler
                handleBooking('Paystack', transaction.reference);
            },
            onCancel: () => {
                toast({ title: "Payment Cancelled", description: "Your payment process was cancelled.", variant: "destructive" });
                setIsBooking(false);
                setActivePaymentMethod('');
            },
        });

    } catch (error: any) {
        toast({ title: "Paystack Error", description: error.message, variant: "destructive" });
        setIsBooking(false);
        setActivePaymentMethod('');
    }
};


  const nights = date?.to && date?.from ? Math.max(0, differenceInCalendarDays(date.to, date.from)) : 0;
  const totalCost = nights * room.price;
  const allImages = [room.imageUrl, ...(room.images || []).map(img => img.src)].filter(Boolean);


  return (
    <div className="container mx-auto py-12 px-4">
      {/* --- Desktop Image Gallery Grid --- */}
      <div className="mb-8 hidden md:grid md:grid-cols-4 md:grid-rows-2 md:gap-4 h-[550px]">
        {allImages.length > 0 && (
          <div className="md:col-span-2 md:row-span-2 relative rounded-lg overflow-hidden h-full">
            <Image
              src={allImages[0]}
              alt={room.name}
              fill
              className="object-cover w-full h-full"
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              data-ai-hint="hotel room interior"
            />
          </div>
        )}
        {allImages.length > 1 && (
            <div className="relative hidden md:block rounded-lg overflow-hidden">
                <Image
                    src={allImages[1]}
                    alt={`${room.name} detail 1`}
                    fill
                    className="object-cover w-full h-full"
                    sizes="(min-width: 768px) 25vw, 100vw"
                    data-ai-hint="hotel room detail"
                />
            </div>
        )}
        {allImages.length > 2 && (
            <div className="relative hidden md:block rounded-lg overflow-hidden">
                <Image
                    src={allImages[2]}
                    alt={`${room.name} detail 2`}
                    fill
                    className="object-cover w-full h-full"
                    sizes="(min-width: 768px) 25vw, 100vw"
                    data-ai-hint="hotel room detail"
                />
            </div>
        )}
         {allImages.length > 3 && (
            <div className="relative hidden md:block rounded-lg overflow-hidden">
                <Image
                    src={allImages[3]}
                    alt={`${room.name} detail 3`}
                    fill
                    className="object-cover w-full h-full"
                     sizes="(min-width: 768px) 25vw, 100vw"
                    data-ai-hint="hotel room amenity"
                />
                {allImages.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                        +{allImages.length - 4}
                    </div>
                )}
            </div>
        )}
      </div>

       {/* --- Mobile Image Carousel --- */}
       <div className="md:hidden mb-8">
         <Carousel
            opts={{ loop: true }}
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            className="w-full"
        >
            <CarouselContent>
                {allImages.map((src, index) => (
                <CarouselItem key={index}>
                    <div className="aspect-video relative rounded-lg overflow-hidden">
                        <Image
                            src={src}
                            alt={`${room.name} image ${index + 1}`}
                            fill
                            className="object-cover w-full h-full"
                            sizes="100vw"
                        />
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4" />
            <CarouselNext className="absolute right-4" />
        </Carousel>
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
           <Separator className="my-8" />
           <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Hotel Policies</h3>
            <div className="flex items-center gap-4 text-muted-foreground">
                <Clock className="h-5 w-5"/>
                <p>Check-in: <strong>2:00 PM</strong></p>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
                <Clock className="h-5 w-5"/>
                <p>Check-out: <strong>11:00 AM</strong></p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl">Book Your Stay</CardTitle>
              <CardDescription>
                 <span className="text-3xl font-bold text-foreground">KES {room.price}</span>
                 <span className="text-base font-normal text-muted-foreground"> / {room.type === 'room' ? 'night' : 'day'}</span>
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
            <CardFooter className="flex flex-col gap-4">
                <Button size="lg" className="w-full" onClick={() => preBookingCheck() && handleBooking('Pay at Hotel')} disabled={isBooking || nights <= 0 || !isRoomAvailable}>
                    {isBooking && activePaymentMethod === 'Pay at Hotel' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    { user ? 'Reserve Now, Pay at Hotel' : 'Login to Reserve' }
                </Button>
                <div className="relative w-full">
                    <Separator />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
                </div>
                <Button size="lg" className="w-full" onClick={handlePaystackPayment} disabled={isBooking || nights <= 0 || !isRoomAvailable}>
                    {isBooking && activePaymentMethod === 'Paystack' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    { user ? 'Pay & Book Now' : 'Login to Book' }
                </Button>
            </CardFooter>
            
          </Card>
        </div>
      </div>
    </div>
  );
}
