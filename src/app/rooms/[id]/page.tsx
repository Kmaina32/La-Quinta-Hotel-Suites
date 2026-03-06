
import { getRoom } from '@/lib/actions';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RoomDetailsClient from './room-details-client';

// In Next.js 15, params is a Promise
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    return { title: 'Room Not Found' };
  }

  const siteDescription = `Book your stay at ${room.name}. ${room.description}`;

  return {
    title: room.name,
    description: siteDescription,
    openGraph: {
      title: `${room.name} | La Quita Hotel & suites`,
      description: siteDescription,
      images: [{ url: room.imageUrl, width: 1200, height: 630, alt: room.name }],
    },
  };
}

export default async function RoomDetailsPage({ params }: Props) {
  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    notFound();
  }

  return <RoomDetailsClient room={room} />;
}
