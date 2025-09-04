
'use server';

import { getDb } from '@/lib/firebase-admin';
import type { Room, EstablishmentImage } from '@/lib/types';
import { revalidatePath } from 'next/cache';

async function getAdminDb() {
  const db = await getDb();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
}

export async function getRooms(): Promise<Room[]> {
  const adminDb = await getAdminDb();
  const roomsCollection = adminDb.collection('rooms');
  const roomsSnapshot = await roomsCollection.orderBy('price').get();
  const roomsList = roomsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Room[];
  return roomsList;
}

export async function getRoom(id: string): Promise<Room | null> {
  const adminDb = await getAdminDb();
  const roomDoc = adminDb.collection('rooms').doc(id);
  const roomSnapshot = await roomDoc.get();

  if (!roomSnapshot.exists) {
    return null;
  }

  return { id: roomSnapshot.id, ...roomSnapshot.data() } as Room;
}

export async function getEstablishmentImages(): Promise<EstablishmentImage[]> {
  const adminDb = await getAdminDb();
  const establishmentCollection = adminDb.collection('establishment');
  const establishmentSnapshot = await establishmentCollection.orderBy('id').get();
  const imagesList = establishmentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EstablishmentImage[];
  return imagesList;
}

export async function updateHeroImage(src: string) {
    const adminDb = await getAdminDb();
    const heroDocRef = adminDb.collection('establishment').doc('hero-image');
    await heroDocRef.update({ src });
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function updateGalleryImage(id: string, src: string) {
    const adminDb = await getAdminDb();
    const imageDocRef = adminDb.collection('establishment').doc(id);
    await imageDocRef.update({ src });
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function addGalleryImage(newImage: Omit<EstablishmentImage, 'id'>) {
    const adminDb = await getAdminDb();
    const newImageRef = await adminDb.collection('establishment').add(newImage);
    await newImageRef.update({ id: newImageRef.id });
    revalidatePath('/');
    revalidatePath('/admin');
    return newImageRef.id;
}

export async function deleteGalleryImage(id: string) {
    const adminDb = await getAdminDb();
    if (id === 'hero-image') return; // Cannot delete hero
    const imageDocRef = adminDb.collection('establishment').doc(id);
    await imageDocRef.delete();
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function updateRoomDetails(id: string, room: Omit<Room, 'id'>) {
    const adminDb = await getAdminDb();
    const roomDocRef = adminDb.collection('rooms').doc(id);
    await roomDocRef.update(room);
    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
    revalidatePath('/admin');
}

export async function addRoom(newRoom: Omit<Room, 'id'>) {
    const adminDb = await getAdminDb();
    const roomRef = await adminDb.collection('rooms').add(newRoom);
    revalidatePath('/');
    revalidatePath('/admin');
    return roomRef.id;
}

export async function deleteRoom(id: string) {
    const adminDb = await getAdminDb();
    const roomDocRef = adminDb.collection('rooms').doc(id);
    await roomDocRef.delete();
    revalidatePath('/');
    revalidatePath('/admin');
}
