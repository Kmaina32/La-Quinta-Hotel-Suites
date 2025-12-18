
'use server';

import { getDb, getStorage } from '@/lib/firebase-admin';
import type { Room, EstablishmentImage, Booking, Message, UserData, SiteSettings } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { format, eachDayOfInterval } from 'date-fns';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

// == Image Upload ==
export async function uploadImage(formData: FormData): Promise<string> {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided.');
    }

    const storage = getStorage();
    const bucket = storage.bucket();

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `images/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(fileBuffer, {
        metadata: {
            contentType: file.type,
        },
    });

    await fileUpload.makePublic();
    
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// == Rooms ==
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

export async function updateRoomDetails(id: string, room: Partial<Room>) {
    const db = getDb();
    const roomDocRef = db.collection('rooms').doc(id);
    await roomDocRef.update(room);
    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
    revalidatePath('/admin');
    revalidatePath('/#rooms');
}

export async function addRoom(newRoom: Omit<Room, 'id'>) {
    const db = getDb();
    const roomRef = await db.collection('rooms').add(newRoom);
    await roomRef.update({ id: roomRef.id, inventory: 1, booked: {} });
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/#rooms');
    return roomRef.id;
}

export async function deleteRoom(id: string) {
    const db = getDb();
    const roomDocRef = db.collection('rooms').doc(id);
    await roomDocRef.delete();
    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
    revalidatePath('/admin');
    revalidatePath('/#rooms');
}


// == Establishment Images & Settings ==
export async function getEstablishmentImages(): Promise<{ heroImage: EstablishmentImage | null; galleryImages: EstablishmentImage[] }> {
    const db = getDb();
    const establishmentCollection = db.collection('establishment');

    const heroDoc = await establishmentCollection.doc('hero-image').get();
    const heroImage = heroDoc.exists ? { id: heroDoc.id, ...heroDoc.data() } as EstablishmentImage : null;
    
    const gallerySnapshot = await establishmentCollection.where('src', '!=', '').get();
    const galleryImages = gallerySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as EstablishmentImage))
        .filter(img => img.id !== 'hero-image' && img.src && img.id !== 'site-settings');

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

export async function getSiteSettings(): Promise<SiteSettings> {
    const db = getDb();
    const settingsDoc = await db.collection('establishment').doc('site-settings').get();
    if (!settingsDoc.exists) {
        // Return default settings if none are found
        return { activeTheme: 'default' };
    }
    return settingsDoc.data() as SiteSettings;
}

export async function updateSiteSettings(settings: SiteSettings) {
    const db = getDb();
    const settingsDocRef = db.collection('establishment').doc('site-settings');
    await settingsDocRef.set(settings, { merge: true });
    // Revalidate all paths to reflect theme changes
    revalidatePath('/', 'layout');
}


// == Bookings ==
export async function createBooking(bookingData: Omit<Booking, 'id' | 'bookedOn' | 'status'>, isReservation: boolean = false) {
    const db = getDb();
    const roomRef = db.collection('rooms').doc(bookingData.roomId);
    
    const transactionError = await db.runTransaction(async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists) {
            return "Room does not exist.";
        }

        const room = roomDoc.data() as Room;
        const bookingDates = eachDayOfInterval({
            start: new Date(bookingData.checkIn),
            end: new Date(bookingData.checkOut)
        });

        const updates: Record<string, FieldValue> = {};
        // Don't check availability for the last day (check-out day)
        for (const day of bookingDates.slice(0, -1)) {
            const dateString = format(day, 'yyyy-MM-dd');
            const currentBookings = room.booked?.[dateString] || 0;
            if (currentBookings >= room.inventory) {
                return `Room is fully booked on ${dateString}.`;
            }
            updates[`booked.${dateString}`] = FieldValue.increment(1);
        }
        
        transaction.update(roomRef, updates);

        // Use the transaction reference as the booking ID if available
        const newBookingRef = bookingData.transactionRef 
            ? db.collection('bookings').doc(bookingData.transactionRef)
            : db.collection('bookings').doc();
        
        transaction.set(newBookingRef, {
            ...bookingData,
            bookedOn: new Date().toISOString(),
            status: isReservation ? 'pending' : 'confirmed',
        });
        
        return null;
    });

    if (transactionError) {
        throw new Error(transactionError);
    }
    
    revalidatePath('/bookings');
    revalidatePath('/admin');
}


export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  const db = getDb();
  const bookingsSnapshot = await db.collection('bookings')
    .where('userId', '==', userId)
    .get();
  
  const bookingsList = bookingsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
  
  return bookingsList.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
}

export async function getAllBookings(): Promise<Booking[]> {
    const db = getDb();
    const bookingsSnapshot = await db.collection('bookings').orderBy('bookedOn', 'desc').get();
    return bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Booking);
}

export async function cancelBooking(bookingId: string) {
    const db = getDb();
    const bookingRef = db.collection('bookings').doc(bookingId);

    const transactionError = await db.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) return "Booking not found.";
        
        const booking = bookingDoc.data() as Booking;
        if (booking.status === 'cancelled') return "Booking already cancelled.";

        const roomRef = db.collection('rooms').doc(booking.roomId);
        const roomDoc = await transaction.get(roomRef);
        // If room doesn't exist, we can still cancel the booking, but can't update inventory.
        if (roomDoc.exists) {
            const bookingDates = eachDayOfInterval({
                start: new Date(booking.checkIn),
                end: new Date(booking.checkOut)
            });

            const updates: Record<string, FieldValue> = {};
             // Don't decrement inventory for the last day (check-out day)
            for (const day of bookingDates.slice(0, -1)) {
                const dateString = format(day, 'yyyy-MM-dd');
                // Decrement only if the current count is > 0
                if ((roomDoc.data()?.booked?.[dateString] || 0) > 0) {
                  updates[`booked.${dateString}`] = FieldValue.increment(-1);
                }
            }
            if (Object.keys(updates).length > 0) {
              transaction.update(roomRef, updates);
            }
        }
        
        transaction.update(bookingRef, { status: 'cancelled' });
        return null;
    });
    
    if (transactionError) throw new Error(transactionError);
    
    revalidatePath('/bookings');
    revalidatePath('/admin');
}


// == Messages ==
export async function saveMessage(messageData: Omit<Message, 'id' | 'sentAt' | 'isRead'>): Promise<void> {
    const db = getDb();
    const newMessage = {
        ...messageData,
        sentAt: new Date().toISOString(),
        isRead: false,
    };
    await db.collection('messages').add(newMessage);
    revalidatePath('/admin');
}

export async function getMessages(): Promise<Message[]> {
    const db = getDb();
    const messagesSnapshot = await db.collection('messages').orderBy('sentAt', 'desc').get();
    return messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Message[];
}

// == Paystack ==
export async function initializePaystackTransaction(email: string, amount: number) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        throw new Error('Paystack secret key is not configured.');
    }
    
    // Ensure the NEXT_PUBLIC_SITE_URL is set for the callback
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';
    const callback_url = `${siteUrl}/bookings/status`;

    const params = {
        email,
        amount: amount * 100, // Amount in kobo
        currency: 'KES',
        callback_url,
    };

    try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await response.json();

        if (!data.status) {
            throw new Error(data.message || 'Failed to initialize Paystack transaction.');
        }

        return data.data; // Should contain access_code and reference
    } catch (error: any) {
        console.error('Paystack initialization failed:', error);
        throw new Error(error.message || 'Could not connect to Paystack.');
    }
}

export async function verifyPaystackTransaction(reference: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        throw new Error('Paystack secret key is not configured.');
    }

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        });

        const data = await response.json();

        if (!data.status) {
            throw new Error(data.message || 'Failed to verify Paystack transaction.');
        }

        return data.data; // Contains transaction status, amount, etc.
    } catch (error: any) {
        console.error('Paystack verification failed:', error);
        throw new Error(error.message || 'Could not connect to Paystack to verify transaction.');
    }
}

export async function confirmBookingFromWebhook(reference: string) {
    const db = getDb();
    const bookingRef = db.collection('bookings').doc(reference);
    
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
        // This might happen if the webhook is faster than the client-side booking creation.
        // Or if it's a fraudulent webhook call. For now, we just log it.
        console.warn(`Webhook received for non-existent booking reference: ${reference}`);
        return;
    }

    await bookingRef.update({ status: 'confirmed' });
    revalidatePath('/bookings');
    revalidatePath('/admin');
    console.log(`Booking ${reference} confirmed via webhook.`);
}
