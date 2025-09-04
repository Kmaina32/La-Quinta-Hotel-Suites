'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Room, EstablishmentImage } from '@/lib/types';

export async function getRooms(): Promise<Room[]> {
  const roomsCollection = collection(db, 'rooms');
  const roomsSnapshot = await getDocs(roomsCollection);
  const roomsList = roomsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Room[];
  return roomsList;
}

export async function getRoom(id: string): Promise<Room | null> {
  const roomDoc = doc(db, 'rooms', id);
  const roomSnapshot = await getDoc(roomDoc);

  if (!roomSnapshot.exists()) {
    return null;
  }

  return { id: roomSnapshot.id, ...roomSnapshot.data() } as Room;
}

export async function getEstablishmentImages(): Promise<EstablishmentImage[]> {
  const establishmentCollection = collection(db, 'establishment');
  const establishmentSnapshot = await getDocs(establishmentCollection);
  const imagesList = establishmentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EstablishmentImage[];
  return imagesList;
}
