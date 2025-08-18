'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar as CalendarIcon, Check, Loader2 } from 'lucide-react';
import { addDays, format, differenceInDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Booking, rooms } from '@/lib/data';


export default function BookingForm() {
  const router = useRouter();
  const params = useParams();
  const room = rooms.find(r => r.id === params.id);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  });
  const [guests, setGuests] = useState(2);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'mpesa' | null>(null);

  const handleAvailabilityCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsAvailable(true); // Mock availability
      setIsChecking(false);
    }, 1500);
  };
  
  const handleBooking = () => {
    if (!room) {
        // If on the homepage where there is no specific room, redirect to rooms section.
        router.push('/#rooms');
        return;
    }
    setIsBooking(true);
    setTimeout(() => {
        setIsBooking(false);
        setShowPaymentModal(true);
    }, 1500);
  };

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date?.from || !date?.to || !room) return;

    const nights = differenceInDays(date.to, date.from);
    const newBooking: Booking = {
      id: `BK${Date.now()}`,
      roomId: room.id,
      roomName: room.name,
      checkIn: format(date.from, 'yyyy-MM-dd'),
      checkOut: format(date.to, 'yyyy-MM-dd'),
      guests,
      totalPrice: nights * room.price,
      status: 'Confirmed',
    };

    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    localStorage.setItem('bookings', JSON.stringify([...existingBookings, newBooking]));

    setShowPaymentModal(false);
    router.push('/bookings');
  }

  return (
    <>
      <Card className="mt-8 w-full max-w-sm md:max-w-4xl bg-white/10 p-4 text-white backdrop-blur-sm md:p-6">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <div className="grid w-full items-center gap-1.5 text-left md:col-span-2 lg:col-span-1">
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
                Guests
              </Label>
              <Input
                type="number"
                id="guests"
                placeholder="2"
                className="text-black"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                min={1}
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row md:col-span-2 lg:col-span-2">
              <Button
                type="button"
                className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAvailabilityCheck}
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Availability'
                )}
              </Button>
              <Button
                type="button"
                className="h-10 w-full bg-green-600 text-white hover:bg-green-700"
                onClick={handleBooking}
                disabled={!isAvailable || isBooking}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : 'Book Now'}
              </Button>
            </div>
          </div>
          {isAvailable !== null && (
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
              <TabsTrigger value="card" onClick={() => setPaymentMethod('card')}>Card</TabsTrigger>
              <TabsTrigger value="paypal" onClick={() => setPaymentMethod('paypal')}>PayPal</TabsTrigger>
              <TabsTrigger value="mpesa" onClick={() => setPaymentMethod('mpesa')}>M-Pesa</TabsTrigger>
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
                    <Button type="submit" className="w-full">Pay with Card</Button>
                </form>
            </TabsContent>
            <TabsContent value="paypal">
                 <form onSubmit={handlePayment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="paypalEmail">PayPal Email</Label>
                        <Input id="paypalEmail" type="email" placeholder="you@example.com" required/>
                    </div>
                    <Button type="submit" className="w-full">Pay with PayPal</Button>
                </form>
            </TabsContent>
            <TabsContent value="mpesa">
                 <form onSubmit={handlePayment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="mpesaPhone">Phone Number</Label>
                        <Input id="mpesaPhone" placeholder="254712345678" required/>
                    </div>
                    <Button type="submit" className="w-full">Pay with M-Pesa (STK Push)</Button>
                </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
