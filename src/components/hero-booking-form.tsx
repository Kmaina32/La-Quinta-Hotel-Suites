
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function HeroBookingForm() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });
  const router = useRouter();

  const handleCheckAvailability = () => {
    // Scroll to the rooms section
    const roomsSection = document.getElementById('rooms');
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Optional: Could pass dates via query params to a /rooms route
    // for actual filtering in a more advanced implementation.
    // For now, it just scrolls.
    // const checkIn = date?.from?.toISOString();
    // const checkOut = date?.to?.toISOString();
    // router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <Card className="mt-8 w-full max-w-2xl bg-black/50 backdrop-blur-sm border-white/20 text-white">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal bg-transparent hover:bg-white/10 text-white hover:text-white border-white/50",
                        !date && "text-muted-foreground"
                        )}
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
            <Button size="lg" className="w-full" onClick={handleCheckAvailability}>
                Check Availability
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Card and CardContent to this file to avoid creating separate files
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

