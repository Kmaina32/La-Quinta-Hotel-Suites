'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Room, EstablishmentImage } from '@/lib/types';

export async function getRooms(): Promise<Room[]> {
  const roomsCollection = adminDb.collection('rooms');
  const roomsSnapshot = await roomsCollection.get();
  const roomsList = roomsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Room[];
  return roomsList;
}

export async function getRoom(id: string): Promise<Room | null> {
  const roomDoc = adminDb.collection('rooms').doc(id);
  const roomSnapshot = await roomDoc.get();

  if (!roomSnapshot.exists) {
    return null;
  }

  return { id: roomSnapshot.id, ...roomSnapshot.data() } as Room;
}

export async function getEstablishmentImages(): Promise<EstablishmentImage[]> {
  const establishmentCollection = adminDb.collection('establishment');
  const establishmentSnapshot = await establishmentCollection.get();
  const imagesList = establishmentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EstablishmentImage[];
  return imagesList;
}
