import Image from 'next/image';
import Link from 'next/link';
import {
  BedDouble,
  ParkingCircle,
  UtensilsCrossed,
  Wifi,
  Wind,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { rooms, establishmentImages } from '@/lib/data';
import Header from '@/components/header';
import Footer from '@/components/footer';
import BookingForm from '@/components/booking-form';
import { config } from '@/lib/config';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <section
          id="hero"
          className="relative h-[90vh] min-h-[600px] w-full p-4 md:p-6"
        >
          <Image
            src={config.heroImageUrl}
            alt="Laquinta Hotel & Suites"
            data-ai-hint="hotel exterior"
            fill
            className="object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 rounded-lg" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            <h1 className="font-headline text-5xl font-bold md:text-7xl">
              Laquinta Hotel & Suites
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl">
              Your serene getaway in the heart of Nakuru. Experience unparalleled comfort and hospitality.
            </p>
            <BookingForm />
          </div>
        </section>

        <section id="rooms" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Our Rooms & Suites
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Choose from our selection of beautifully appointed rooms, each designed for your comfort.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                  <CardHeader className="p-0">
                    <Image
                      src={room.image}
                      alt={room.name}
                      data-ai-hint="hotel room"
                      width={600}
                      height={400}
                      className="aspect-video w-full object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="font-headline text-2xl">{room.name}</CardTitle>
                    <CardDescription className="mt-2">{room.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center p-6 pt-0">
                    <p className="text-lg font-semibold">${room.price} / night</p>
                    <Link href={`/rooms/${room.id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="w-full bg-secondary py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Our Establishment
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                A glimpse into the comfort and luxury that awaits you.
              </p>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {establishmentImages.map((src, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                           <Image src={src} alt={`Establishment image ${index + 1}`} width={600} height={600} className="rounded-lg object-cover w-full h-full" data-ai-hint="hotel restaurant" />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>

        <section id="amenities" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl">
                World-Class Amenities
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                We offer a range of amenities to make your stay comfortable and memorable.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 py-12 sm:grid-cols-3 md:gap-12">
              <div className="flex flex-col items-center justify-center gap-2">
                <Wifi className="h-10 w-10 text-accent" />
                <p className="font-semibold">Free High-Speed Wi-Fi</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <UtensilsCrossed className="h-10 w-10 text-accent" />
                <p className="font-semibold">On-site Restaurant</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <ParkingCircle className="h-10 w-10 text-accent" />
                <p className="font-semibold">Free Parking</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <BedDouble className="h-10 w-10 text-accent" />
                <p className="font-semibold">Luxurious Bedding</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <Wind className="h-10 w-10 text-accent" />
                <p className="font-semibold">Air Conditioning</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <Users className="h-10 w-10 text-accent" />
                <p className="font-semibold">24/7 Front Desk</p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="whatsapp-booking" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="rounded-lg bg-accent p-8 text-accent-foreground md:p-12">
              <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-headline text-2xl font-bold">Prefer to book directly?</h3>
                  <p className="text-lg">Send us a message on WhatsApp for instant booking assistance.</p>
                </div>
                <Link
                  href="https://wa.me/254700000000?text=I'd%20like%20to%20book%20a%20room%20at%20Laquinta."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="lg" className="bg-white text-accent hover:bg-white/90">
                    Book on WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}