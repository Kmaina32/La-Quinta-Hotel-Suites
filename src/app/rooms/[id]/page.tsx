'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bath, BedDouble, User, Loader2 } from 'lucide-react';
import { getRoom } from '@/lib/actions';
import type { Room } from '@/lib/types';


export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      const roomData = await getRoom(params.id);
      if (!roomData) {
        notFound();
      }
      setRoom(roomData);
      setLoading(false);
    };
    fetchRoom();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return null; // notFound() is called in useEffect
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Image Gallery */}
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
        {room.images && room.images.map(image => (
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

      {/* Room Details & Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{room.name}</h1>
          <p className="text-lg text-muted-foreground mb-6">{room.description}</p>
          <div className="flex flex-wrap gap-6 text-lg mb-6">
            <div className="flex items-center gap-2">
              <User className="text-primary"/>
              <span>{room.capacity} Guests</span>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble className="text-primary"/>
              <span>{room.beds} Bed(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="text-primary"/>
              <span>{room.baths} Bath(s)</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 border rounded-lg shadow-lg bg-card">
            <h2 className="text-2xl font-bold mb-4">Book Your Stay</h2>
            <div className="text-3xl font-bold mb-6">
              ${room.price}
              <span className="text-base font-normal text-muted-foreground"> / night</span>
            </div>
            {/* Date picker and form will go here */}
            <Button size="lg" className="w-full">
              Reserve Now
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
