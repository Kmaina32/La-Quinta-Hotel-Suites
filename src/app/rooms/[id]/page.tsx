
'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import type { Room } from '@/lib/data';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Check, Loader2 } from 'lucide-react';
import BookingForm from '@/components/booking-form';
import { getRooms } from '@/app/admin/actions';

function RoomDetailsContent({ room, allRooms }: { room: Room, allRooms: Room[] }) {
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
                <BookingForm rooms={allRooms} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const roomsData = await getRooms();
        const currentRoom = roomsData.find((r) => r.id === params.id);
        
        if (currentRoom) {
          setRoom(currentRoom);
          setAllRooms(roomsData);
        } else {
          setError('Room not found.');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load room details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <p className="text-destructive">{error}</p>
        </div>
     )
  }

  if (!room) {
    // This can be a more formal not found page
    return <p>Room not found.</p>;
  }

  return <RoomDetailsContent room={room} allRooms={allRooms} />;
}
