
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bath, BedDouble, User } from 'lucide-react';
import { getRooms, getEstablishmentImages } from '@/lib/actions';
import { SeoStructuredData } from '@/components/seo-structured-data';
import { HeroBookingForm } from '@/components/hero-booking-form';
import type { Room, EstablishmentImage } from '@/lib/types';


export default async function Home() {
  let rooms: Room[] = [];
  let heroImage: EstablishmentImage | null = null;
  
  try {
    rooms = await getRooms();
    ({ heroImage } = await getEstablishmentImages());
  } catch (e) {
    console.error('Homepage data load failed. This might be due to a Firebase configuration issue. The page will render with empty data.', e);
  }


  return (
    <>
      <SeoStructuredData />
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-white p-4">
        <div className="absolute inset-4 md:inset-8 rounded-2xl overflow-hidden">
          <Image
            src={heroImage?.src || "https://picsum.photos/seed/hero/1200/800"}
            alt={heroImage?.alt || "La Quita Hotel & suites exterior"}
            fill
            style={{ objectFit: 'cover' }}
            className="brightness-50"
            data-ai-hint="hotel exterior"
            priority
          />
        </div>
        <div className="relative z-10 text-center p-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Welcome to La Quita
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl">
            Experience unparalleled luxury and comfort in the heart of the city.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <HeroBookingForm />

      {/* Rooms Section */}
      <section id="rooms" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Rooms & Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.filter(room => room.imageUrl).map((room) => (
              <Card key={room.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative h-60 w-full">
                    <Image
                      src={room.imageUrl}
                      alt={room.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      data-ai-hint="hotel room interior"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{room.capacity} Guests</span>
                      </div>
                       {room.beds > 0 && <div className="flex items-center gap-2">
                        <BedDouble size={16} />
                        <span>{room.beds} Bed(s)</span>
                      </div>}
                      {room.baths > 0 && <div className="flex items-center gap-2">
                        <Bath size={16} />
                        <span>{room.baths} Bath(s)</span>
                      </div>}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold">
                        KES {room.price} <span className="text-sm font-normal text-muted-foreground">/ {room.type === 'room' ? 'night' : 'day'}</span>
                      </p>
                      <Button asChild>
                        <Link href={`/rooms/${room.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
