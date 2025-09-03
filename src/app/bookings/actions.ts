'use server';

import { revalidatePath } from 'next/cache';
import { type Booking } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export async function saveBooking(booking: Omit<Booking, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'bookings'), booking);
    revalidatePath('/bookings');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error saving booking:', error);
    throw new Error('Failed to save booking.');
  }
}

export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  try {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('userId', '==', userId));
    const bookingSnapshot = await getDocs(q);
    const bookingList = bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    return bookingList;
  } catch (error) {
    console.error("Failed to read bookings for user:", error);
    return []; // Return empty array on error
  }
}
