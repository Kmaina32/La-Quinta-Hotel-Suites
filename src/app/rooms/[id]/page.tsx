
'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { type Room, rooms } from '@/lib/data';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Check } from 'lucide-react';
import BookingForm from '@/components/booking-form';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

// This is the Client Component for handling user interactions
function RoomDetailsContent({ room }: { room: Room }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && closeModal()}>
                <div 
                  onClick={() => openModal(room.image)}
                  className="cursor-pointer"
                >
                  <Image
                    src={room.image}
                    alt={room.name}
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                    data-ai-hint="hotel room"
                    priority
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {room.images.map((img, index) => (
                    <div 
                      key={index}
                      onClick={() => openModal(img)}
                      className="cursor-pointer"
                    >
                      <Image
                        src={img}
                        alt={`${room.name} view ${index + 1}`}
                        width={200}
                        height={150}
                        className="aspect-[4/3] w-full rounded-lg object-cover"
                        data-ai-hint="hotel room interior"
                      />
                    </div>
                  ))}
                </div>
                {selectedImage && (
                    <DialogContent className="max-w-4xl p-0">
                        <DialogTitle className="sr-only">Enlarged room image</DialogTitle>
                        <Image
                            src={selectedImage}
                            alt="Enlarged room view"
                            width={1200}
                            height={900}
                            className="h-auto w-full rounded-lg object-contain"
                        />
                    </DialogContent>
                )}
              </Dialog>
            </div>
            <div className="flex flex-col">
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
                    Ksh {room.price}{' '}
                    <span className="text-lg font-normal text-muted-foreground">/ night</span>
                </p>
              </div>
              <div className="mt-auto pt-8">
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

// This is the main page component (Server Component)
export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const getRoomById = (id: string): Room | undefined => rooms.find((room) => room.id === id);
  const room = getRoomById(params.id);

  if (!room) {
    notFound();
  }

  // We pass the resolved room object to the client component
  return <RoomDetailsContent room={room} />;
}
