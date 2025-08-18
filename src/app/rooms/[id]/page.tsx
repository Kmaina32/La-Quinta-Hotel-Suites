import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { rooms } from '@/lib/data';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import BookingForm from '@/components/booking-form';

const getRoomById = (id: string) => rooms.find((room) => room.id === id);

export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const room = getRoomById(params.id);

  if (!room) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <Image
                src={room.image}
                alt={room.name}
                width={800}
                height={600}
                className="aspect-[4/3] w-full rounded-lg object-cover"
                data-ai-hint="hotel room"
              />
              <div className="mt-4 grid grid-cols-3 gap-4">
                {room.images.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`${room.name} view ${index + 1}`}
                    width={200}
                    height={150}
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                     data-ai-hint="hotel room interior"
                  />
                ))}
              </div>
            </div>
            <div>
              <h1 className="font-headline text-4xl font-bold">{room.name}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{room.description}</p>
              <div className="mt-6">
                <h3 className="font-headline text-2xl font-semibold">Amenities</h3>
                <ul className="mt-4 grid grid-cols-2 gap-4">
                  {room.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                 <p className="text-3xl font-bold">
                    ${room.price}{' '}
                    <span className="text-lg font-normal text-muted-foreground">/ night</span>
                </p>
              </div>
              <div className="mt-8">
                <BookingForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
