'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Room, EstablishmentImage } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getRooms(): Promise<Room[]> {
  if (!adminDb) {
    console.error('Firestore not initialized');
    return [];
  }
  const roomsCollection = adminDb.collection('rooms');
  const roomsSnapshot = await roomsCollection.orderBy('price').get();
  const roomsList = roomsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Room[];
  return roomsList;
}

export async function getRoom(id: string): Promise<Room | null> {
    if (!adminDb) {
    console.error('Firestore not initialized');
    return null;
  }
  const roomDoc = adminDb.collection('rooms').doc(id);
  const roomSnapshot = await roomDoc.get();

  if (!roomSnapshot.exists) {
    return null;
  }

  return { id: roomSnapshot.id, ...roomSnapshot.data() } as Room;
}

export async function getEstablishmentImages(): Promise<EstablishmentImage[]> {
    if (!adminDb) {
    console.error('Firestore not initialized');
    return [];
  }
  const establishmentCollection = adminDb.collection('establishment');
  const establishmentSnapshot = await establishmentCollection.get();
  const imagesList = establishmentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EstablishmentImage[];
  return imagesList;
}

export async function updateHeroImage(src: string) {
    if (!adminDb) throw new Error('Firestore not initialized');
    const heroDocRef = adminDb.collection('establishment').doc('hero-image');
    await heroDocRef.update({ src });
    revalidatePath('/');
}

export async function updateGalleryImage(id: string, src: string) {
    if (!adminDb) throw new Error('Firestore not initialized');
    const imageDocRef = adminDb.collection('establishment').doc(id);
    await imageDocRef.update({ src });
    revalidatePath('/');
}

export async function updateRoomDetails(id: string, room: Omit<Room, 'id'>) {
    if (!adminDb) throw new Error('Firestore not initialized');
    const roomDocRef = adminDb.collection('rooms').doc(id);
    await roomDocRef.update(room);
    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
}
