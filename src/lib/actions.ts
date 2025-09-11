
'use server';

import { getDb, getStorage } from '@/lib/firebase-admin';
import type { Room, EstablishmentImage, Booking } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// == Image Upload ==
export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided.');
    }

    const storage = getStorage();
    const bucket = storage.bucket();

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `images/${Date.now()}-${file.name}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(fileBuffer, {
        metadata: {
            contentType: file.type,
        },
    });

    const [publicUrl] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '01-01-2500', // Far-future expiration date
    });
    
    return publicUrl;
}

export async function getRooms(): Promise<Room[]> {
  const db = getDb();
  const roomsCollection = db.collection('rooms');
  const roomsSnapshot = await roomsCollection.orderBy('price').get();
  const roomsList = roomsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Room[];
  return roomsList.filter(room => room.imageUrl);
}

export async function getRoom(id: string): Promise<Room | null> {
  const db = getDb();
  const roomDoc = db.collection('rooms').doc(id);
  const roomSnapshot = await roomDoc.get();

  if (!roomSnapshot.exists) {
    return null;
  }

  return { id: roomSnapshot.id, ...roomSnapshot.data() } as Room;
}

export async function getEstablishmentImages(): Promise<{ heroImage: EstablishmentImage | null; galleryImages: EstablishmentImage[] }> {
    const db = getDb();
    const establishmentCollection = db.collection('establishment');

    const heroDoc = await establishmentCollection.doc('hero-image').get();
    const heroImage = heroDoc.exists ? { id: heroDoc.id, ...heroDoc.data() } as EstablishmentImage : null;
    
    const gallerySnapshot = await establishmentCollection.where('src', '!=', '').get();
    const galleryImages = gallerySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as EstablishmentImage))
        .filter(img => img.id !== 'hero-image' && img.src);

    return { heroImage, galleryImages };
}

export async function updateHeroImage(src: string) {
    const db = getDb();
    const heroDocRef = db.collection('establishment').doc('hero-image');
    await heroDocRef.set({ src, alt: 'Hero Image', 'data-ai-hint': 'hotel exterior' }, { merge: true });
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function updateGalleryImage(id: string, src: string) {
    const db = getDb();
    const imageDocRef = db.collection('establishment').doc(id);
    await imageDocRef.update({ src });
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function addGalleryImage(newImage: Omit<EstablishmentImage, 'id'>) {
    const db = getDb();
    const newImageRef = await db.collection('establishment').add(newImage);
    await newImageRef.update({ id: newImageRef.id });
    revalidatePath('/');
    revalidatePath('/admin');
    return newImageRef.id;
}

export async function deleteGalleryImage(id: string) {
    const db = getDb();
    if (id === 'hero-image') return; // Cannot delete hero
    const imageDocRef = db.collection('establishment').doc(id);
    await imageDocRef.delete();
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function updateRoomDetails(id: string, room: Omit<Room, 'id'>) {
    const db = getDb();
    const roomDocRef = db.collection('rooms').doc(id);
    await roomDocRef.update(room);
    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
    revalidatePath('/admin');
}

export async function addRoom(newRoom: Omit<Room, 'id'>) {
    const db = getDb();
    const roomRef = await db.collection('rooms').add(newRoom);
    revalidatePath('/');
    revalidatePath('/admin');
    return roomRef.id;
}

export async function deleteRoom(id: string) {
    const db = getDb();
    const roomDocRef = db.collection('rooms').doc(id);
    await roomDocRef.delete();
    revalidatePath('/');
    revalidatePath('/admin');
}


// == Bookings ==
export async function createBooking(bookingData: Omit<Booking, 'id' | 'bookedOn'>) {
    const db = getDb();
    const newBooking = {
        ...bookingData,
        bookedOn: new Date().toISOString(),
    };
    const bookingRef = await db.collection('bookings').add(newBooking);
    
    revalidatePath('/bookings');
    
    return { id: bookingRef.id, ...newBooking };
}

export async function getBookings(userId: string): Promise<Booking[]> {
  const db = getDb();
  const bookingsCollection = db.collection('bookings');
  // Filter bookings by userId
  const bookingsSnapshot = await bookingsCollection
    .where('userId', '==', userId)
    .get();
  
  const bookingsList = bookingsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
  
  // Sort the bookings by check-in date in descending order
  return bookingsList.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
}
