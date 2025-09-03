
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Room, EstablishmentImage, Booking } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { promises as fs } from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'src', 'lib', 'config.json');

// ROOMS
export async function getRooms(): Promise<Room[]> {
  const roomsCol = collection(db, 'rooms');
  const roomSnapshot = await getDocs(roomsCol);
  const roomList = roomSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
  return roomList;
}

const roomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Name cannot be empty.' }),
  description: z.string().min(1, { message: 'Description cannot be empty.' }),
  price: z.coerce.number().min(1, { message: 'Price must be greater than 0.' }),
  image: z.string().url({ message: 'Please enter a valid main image URL.' }),
  image1: z.string().url({ message: 'Please enter a valid URL for image 1.' }),
  image2: z.string().url({ message: 'Please enter a valid URL for image 2.' }),
  image3: z.string().url({ message: 'Please enter a valid URL for image 3.' }),
});

export async function addOrUpdateRoom(formData: FormData) {
  const validatedFields = roomSchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    image: formData.get('image'),
    image1: formData.get('image1'),
    image2: formData.get('image2'),
    image3: formData.get('image3'),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { error: 'Invalid data provided for room.' };
  }

  const { id, ...roomData } = validatedFields.data;
  const roomPayload = {
      ...roomData,
      images: [roomData.image1, roomData.image2, roomData.image3],
      capacity: 2, // Default
      amenities: ["King Bed", "Free Wi-Fi", "Air Conditioning", "Mini Fridge", "City View", "Room Service"], // Default
  };
  // We don't want to store these in the document
  delete (roomPayload as any).image1;
  delete (roomPayload as any).image2;
  delete (roomPayload as any).image3;


  try {
    if (id) {
      const roomRef = doc(db, 'rooms', id);
      await setDoc(roomRef, roomPayload, { merge: true });
    } else {
      await addDoc(collection(db, 'rooms'), roomPayload);
    }
    revalidatePath('/');
    if (id) revalidatePath(`/rooms/${id}`);
    revalidatePath('/admin');
    return { success: true, message: id ? 'Room updated successfully' : 'Room added successfully.' };
  } catch (error) {
    console.error('Error saving room:', error);
    return { error: 'Failed to save room data.' };
  }
}

export async function deleteRoom(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Room ID is missing.' };

  try {
    await deleteDoc(doc(db, 'rooms', id));
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/rooms/${id}`);
    return { success: true, message: 'Room deleted successfully.' };
  } catch (error) {
    console.error('Error deleting room:', error);
    return { error: 'Failed to delete room data.' };
  }
}

// ESTABLISHMENT IMAGES
export async function getEstablishmentImages(): Promise<EstablishmentImage[]> {
  const establishmentCol = collection(db, 'establishment');
  const imageSnapshot = await getDocs(establishmentCol);
  const imageList = imageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EstablishmentImage));
  return imageList;
}

const establishmentImageSchema = z.object({
  id: z.string().optional(),
  src: z.string().url({ message: 'Please enter a valid image URL.' }),
  description: z.string().min(1, { message: 'Description cannot be empty.' }),
});

export async function addOrUpdateEstablishmentImage(formData: FormData) {
  const validatedFields = establishmentImageSchema.safeParse({
    id: formData.get('id') || undefined,
    src: formData.get('src'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid data provided for establishment image.' };
  }

  const { id, ...imageData } = validatedFields.data;

  try {
    if (id) {
      await setDoc(doc(db, 'establishment', id), imageData, { merge: true });
    } else {
      await addDoc(collection(db, 'establishment'), imageData);
    }
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: id ? 'Image updated' : 'Image added' };
  } catch (error) {
    console.error('Error saving establishment image:', error);
    return { error: 'Failed to save establishment image data.' };
  }
}

export async function deleteEstablishmentImage(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Image ID is missing.' };

  try {
    await deleteDoc(doc(db, 'establishment', id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'Image deleted' };
  } catch (error) {
    console.error('Error deleting establishment image:', error);
    return { error: 'Failed to delete image.' };
  }
}

// BOOKINGS
export async function getBookings(): Promise<Booking[]> {
    const bookingsCol = collection(db, 'bookings');
    const bookingSnapshot = await getDocs(bookingsCol);
    const bookingList = bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    return bookingList;
}

const bookingSchema = z.object({
  bookingId: z.string(),
  allocatedRoomNumber: z.string().min(1, { message: 'Room number cannot be empty.' }),
});

export async function allocateRoom(formData: FormData) {
  const validatedFields = bookingSchema.safeParse({
    bookingId: formData.get('bookingId'),
    allocatedRoomNumber: formData.get('allocatedRoomNumber'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid data provided.' };
  }

  const { bookingId, allocatedRoomNumber } = validatedFields.data;

  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { allocatedRoomNumber });
    revalidatePath('/admin');
    revalidatePath('/bookings');
    return { success: true, message: 'Room allocated successfully.' };
  } catch (error) {
    console.error('Error allocating room:', error);
    return { error: 'Failed to allocate room.' };
  }
}

// SITE CONFIG (Hero Images, etc.)
const heroImageSchema = z.object({
  heroImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  authImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

export async function updateSiteImages(formData: FormData) {
  const validatedFields = heroImageSchema.safeParse({
    heroImageUrl: formData.get('heroImageUrl'),
    authImageUrl: formData.get('authImageUrl'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid URL provided.' };
  }
  
  const { heroImageUrl, authImageUrl } = validatedFields.data;

  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    config.heroImageUrl = heroImageUrl;
    config.authImageUrl = authImageUrl;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: "Site images updated" }
  } catch (error) {
    console.error('Error updating hero image:', error);
    return { error: 'Failed to update site images.' };
  }
}
