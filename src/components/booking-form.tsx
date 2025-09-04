
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { Calendar as CalendarIcon, Check, Loader2 } from 'lucide-react';
import { addDays, format, differenceInDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Booking, type Room } from '@/lib/data';
import { saveBooking } from '@/app/bookings/actions';

export default function BookingForm({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const room = rooms.find(r => r.id === params.id);

  const [date, setDate] = useState<DateRange | undefined>(() => {
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      if (from && to) {
          return { from: new Date(from), to: new Date(to) };
      }
      return {
        from: new Date(),
        to: addDays(new Date(), 5),
      };
  });

  const [occupancy, setOccupancy] = useState(() => {
      const guests = searchParams.get('guests');
      if (guests === "1") return "single";
      return "double";
  });


  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const isRoomPage = pathname.includes('/rooms/');

  useEffect(() => {
    if (isRoomPage) {
        setIsAvailable(true);
    }
  }, [isRoomPage]);

  const handleAvailabilityCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      const isMockAvailable = Math.random() > 0.2; 
      setIsAvailable(isMockAvailable);
      setIsChecking(false);
    }, 1500);
  };
  
  const handleBookingAttempt = () => {
    if (pathname === '/') {
        const newParams = new URLSearchParams();
        if (date?.from) newParams.set('from', format(date.from, 'yyyy-MM-dd'));
        if (date?.to) newParams.set('to', format(date.to, 'yyyy-MM-dd'));
        newParams.set('guests', occupancy === 'single' ? '1' : '2');
        newParams.set('show_rooms', 'true');
        
        window.location.hash = 'rooms';
        router.replace(`/?${newParams.toString()}#rooms`, { scroll: false });
        // Manually scroll after router update
        setTimeout(() => {
            document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
    }
    
    if (!room) {
      console.error("Room data not found for booking.");
      return;
    }

    if (!isAvailable) {
        alert("Please check availability before booking.");
        return;
    }

    setIsBooking(true);
    setTimeout(() => {
      setIsBooking(false);
      setShowPaymentModal(true);
    }, 1000);
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date?.from || !date?.to || !room) return;

    setIsBooking(true);
    const nights = differenceInDays(date.to, date.from);
    const guests = occupancy === 'single' ? 1 : 2;
    const roomName = occupancy === 'double-infant' ? `${room.name} (+Infant)` : room.name;
    
    // Note: 'id' is omitted, Firestore will generate it.
    const newBooking: Omit<Booking, 'id'> = {
      userId: 'anonymous', // User is anonymous
      roomId: room.id,
      roomName: roomName,
      checkIn: format(date.from, 'yyyy-MM-dd'),
      checkOut: format(date.to, 'yyyy-MM-dd'),
      guests,
      totalPrice: nights * room.price,
      status: 'Confirmed',
      allocatedRoomNumber: null,
    };

    try {
        await saveBooking(newBooking);
        setShowPaymentModal(false);
        router.push('/bookings');
    } catch (error) {
        console.error("Failed to save booking:", error);
    } finally {
        setIsBooking(false);
    }
  };

  return (
    <>
      <Card className="mt-8 w-full max-w-sm md:max-w-4xl bg-white/10 p-4 text-white backdrop-blur-sm md:p-6">
        <CardContent className="p-0">
           <div className="grid w-full items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="grid w-full items-center gap-1.5 text-left lg:col-span-2">
                <Label htmlFor="dates" className="text-white">
                  Check-in - Check-out
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dates"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal text-black',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y')} -{' '}
                            {format(date.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y')
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
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid w-full items-center gap-1.5 text-left">
                 <Label htmlFor="guests" className="text-white">
                  Occupancy
                </Label>
                <Select value={occupancy} onValueChange={setOccupancy}>
                    <SelectTrigger className="w-full text-black" id="guests">
                        <SelectValue placeholder="Select occupancy" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="single">Single Occupancy</SelectItem>
                        <SelectItem value="double">Double Occupancy</SelectItem>
                        <SelectItem value="double-infant">Double Occupancy + Infant</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="w-full lg:col-span-1">
                 <Button
                    type="button"
                    className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={isRoomPage ? handleBookingAttempt : handleAvailabilityCheck}
                    disabled={isBooking || isChecking}
                    >
                    {isChecking ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                        </>
                    ) : isBooking ? (
                         <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                    </>
                    ) : isRoomPage ? (
                        'Book Now'
                    ) : (
                        'Check Availability'
                    )}
                </Button>
              </div>
            </div>
          {isAvailable !== null && !isRoomPage && (
            <div className="mt-4 text-center text-white">
                {isAvailable ? (
                    <p className="flex items-center justify-center gap-2 text-green-400">
                        <Check className="h-5 w-5" /> Room is available for the selected dates.
                    </p>
                ) : (
                    <p className="text-red-400">Sorry, the room is not available for the selected dates.</p>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              Choose your preferred payment method to confirm your reservation.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="card">Card</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
            </TabsList>
            <TabsContent value="card">
                <form onSubmit={handlePayment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="**** **** **** ****" required/>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="expiry">Expiry</Label>
                             <Input id="expiry" placeholder="MM/YY" required/>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="cvc">CVC</Label>
                             <Input id="cvc" placeholder="***" required/>
                        </div>
                         <div className="space-y-2">
                             <Label htmlFor="zip">ZIP</Label>
                             <Input id="zip" placeholder="12345" required/>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isBooking}>
                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pay with Card
                    </Button>
                </form>
            </TabsContent>
            <TabsContent value="paypal">
                 <form onSubmit={handlePayment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="paypalEmail">PayPal Email</Label>
                        <Input id="paypalEmail" type="email" placeholder="you@example.com" required/>
                    </div>
                    <Button type="submit" className="w-full" disabled={isBooking}>
                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pay with PayPal
                    </Button>
                </form>
            </TabsContent>
            <TabsContent value="mpesa">
                 <form onSubmit={handlePayment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="mpesaPhone">Phone Number</Label>
                        <Input id="mpesaPhone" placeholder="254712345678" required/>
                    </div>
                    <Button type="submit" className="w-full" disabled={isBooking}>
                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pay with M-Pesa (STK Push)
                    </Button>
                </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
