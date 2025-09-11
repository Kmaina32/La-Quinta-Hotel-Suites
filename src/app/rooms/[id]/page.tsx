
import { getRoom, createBooking } from '@/lib/actions';
import type { Room } from '@/lib/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import RoomDetailsClient from './room-details-client';

// This is a dynamic metadata function (Server-side)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const room = await getRoom(params.id);

  if (!room) {
    return {
      title: 'Room Not Found',
    };
  }

  const siteDescription = `Book your stay at ${room.name}. ${room.description}`;

  return {
    title: room.name,
    description: siteDescription,
    openGraph: {
      title: `${room.name} | La Quita Hotel & Suites`,
      description: siteDescription,
      images: [
        {
          url: room.imageUrl,
          width: 1200,
          height: 630,
          alt: room.name,
        },
      ],
    },
     twitter: {
      card: 'summary_large_image',
      title: `${room.name} | La Quita Hotel & Suites`,
      description: siteDescription,
      images: [room.imageUrl],
    },
  };
}

// This is the main Page component (Server-side)
export default async function RoomDetailsPage({ params }: { params: { id: string } }) {
  const room = await getRoom(params.id);

  if (!room) {
    notFound();
  }

  return <RoomDetailsClient room={room} />;
}
