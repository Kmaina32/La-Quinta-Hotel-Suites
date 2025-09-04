import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bath, BedDouble, User } from 'lucide-react';
import { getRooms, getEstablishmentImages } from '@/lib/actions';

export default async function Home() {
  const rooms = await getRooms();
  const establishmentImages = await getEstablishmentImages();

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[70vh] w-full flex items-center justify-center text-white">
        <Image
          src="https://picsum.photos/1600/900?random=10"
          alt="Luxury hotel facade at dusk"
          fill
          style={{ objectFit: 'cover' }}
          className="brightness-50"
          data-ai-hint="hotel facade dusk"
        />
        <div className="relative z-10 text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Welcome to La Quita
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl">
            Experience unparalleled luxury and comfort in the heart of the city.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="#rooms">Explore Rooms</Link>
          </Button>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {establishmentImages.map((image) => (
              <div key={image.id} className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="hover:scale-105 transition-transform duration-300"
                  data-ai-hint={image['data-ai-hint']}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
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
                      <div className="flex items-center gap-2">
                        <BedDouble size={16} />
                        <span>{room.beds} Bed(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath size={16} />
                        <span>{room.baths} Bath(s)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold">
                        ${room.price} <span className="text-sm font-normal text-muted-foreground">/ night</span>
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
