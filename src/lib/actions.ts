
'use server';

import { getAuthAdmin, getStorage, getDb } from '@/lib/firebase-admin';
import type { Room, EstablishmentImage, Booking, Message, UserData, SiteSettings, UserRole, AnalyticsData } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { format, eachDayOfInterval, eachMonthOfInterval, addDays } from 'date-fns';

/**
 * Data Fetching (Uses Admin SDK for maximum reliability on Server)
 */

export async function getRooms(): Promise<Room[]> {
    try {
        const db = getDb();
        const snapshot = await db.collection('rooms').orderBy('price').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Room[];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
}

export async function getRoom(id: string): Promise<Room | null> {
    try {
        const db = getDb();
        const doc = await db.collection('rooms').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Room;
    } catch (error) {
        console.error(`Error fetching room ${id}:`, error);
        return null;
    }
}

export async function getEstablishmentImages(): Promise<{ heroImage: EstablishmentImage | null; galleryImages: EstablishmentImage[] }> {
    try {
        const db = getDb();
        const heroDoc = await db.collection('establishment').doc('hero-image').get();
        const heroImage = heroDoc.exists ? { id: heroDoc.id, ...heroDoc.data() } as EstablishmentImage : null;

        const snapshot = await db.collection('establishment').get();
        const galleryImages = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as EstablishmentImage))
            .filter(img => img.id !== 'hero-image' && img.id !== 'site-settings' && img.src !== '');

        return { heroImage, galleryImages };
    } catch (error) {
        console.error('Error fetching establishment images:', error);
        return { heroImage: null, galleryImages: [] };
    }
}

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const db = getDb();
        const settingsDoc = await db.collection('establishment').doc('site-settings').get();
        return (settingsDoc.exists ? settingsDoc.data() : { activeTheme: 'default' }) as SiteSettings;
    } catch (error) {
        return { activeTheme: 'default' };
    }
}

/**
 * Mutations
 */

export async function uploadImage(formData: FormData): Promise<string> {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const storage = getStorage();
        const bucket = storage.bucket();
        const fileName = `uploads/${Date.now()}-${file.name}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(buffer, {
            metadata: { contentType: file.type },
        });

        // Use the standardized public URL format for Firebase Storage
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
    } catch (error: any) {
        console.error('Upload failed:', error);
        throw new Error('Image upload failed. Ensure your Storage bucket is public.');
    }
}

export async function updateRoomDetails(id: string, room: Partial<Room>) {
    try {
        const db = getDb();
        await db.collection('rooms').doc(id).update(room);
        revalidatePath('/');
        revalidatePath(`/rooms/${id}`);
        revalidatePath('/admin');
    } catch (e) {
        console.error("Mutation failed:", e);
        throw e;
    }
}

export async function addRoom(newRoom: Omit<Room, 'id' | 'booked'>) {
    try {
        const db = getDb();
        const docRef = await db.collection('rooms').add({ ...newRoom, booked: {} });
        await docRef.update({ id: docRef.id });
        revalidatePath('/');
        revalidatePath('/admin');
        return docRef.id;
    } catch (e) {
        console.error("Add room failed:", e);
        throw e;
    }
}

export async function deleteRoom(id: string) {
    try {
        const db = getDb();
        await db.collection('rooms').doc(id).delete();
        revalidatePath('/');
        revalidatePath('/admin');
    } catch (e) {
        console.error("Delete failed:", e);
        throw e;
    }
}

export async function updateHeroImage(src: string) {
    const db = getDb();
    await db.collection('establishment').doc('hero-image').set({ src, alt: 'Hero Image', 'data-ai-hint': 'hotel exterior' }, { merge: true });
    revalidatePath('/');
}

export async function updateSiteSettings(settings: SiteSettings) {
    const db = getDb();
    await db.collection('establishment').doc('site-settings').set(settings, { merge: true });
    revalidatePath('/', 'layout');
}

/**
 * Booking Management
 */
export async function createBooking(bookingData: any, isReservation: boolean) {
    try {
        const db = getDb();
        const status = isReservation ? 'pending' : 'confirmed';
        
        const docRef = await db.collection('bookings').add({
            ...bookingData,
            status,
            bookedOn: new Date().toISOString(),
        });

        const checkIn = new Date(bookingData.checkIn);
        const checkOut = new Date(bookingData.checkOut);
        const dates = eachDayOfInterval({ start: checkIn, end: addDays(checkOut, -1) });

        const roomRef = db.collection('rooms').doc(bookingData.roomId);
        const roomDoc = await roomRef.get();
        const currentBooked = roomDoc.exists ? (roomDoc.data()?.booked || {}) : {};

        dates.forEach(d => {
            const dateStr = format(d, 'yyyy-MM-dd');
            currentBooked[dateStr] = (currentBooked[dateStr] || 0) + 1;
        });

        await roomRef.update({ booked: currentBooked });

        revalidatePath('/admin');
        revalidatePath('/bookings');
        return docRef.id;
    } catch (e) {
        console.error("Booking creation failed:", e);
        throw e;
    }
}

export async function getBookingsForUser(userId: string): Promise<Booking[]> {
    try {
        const db = getDb();
        const snapshot = await db.collection('bookings').where('userId', '==', userId).get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Booking);
    } catch (e) {
        return [];
    }
}

/**
 * Admin SDK Required Features
 */

export async function getAllUsers(): Promise<UserData[]> {
    try {
        const authAdmin = getAuthAdmin();
        const userRecords = await authAdmin.listUsers();
        return userRecords.users.map(user => ({
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            metadata: user.metadata.toJSON(),
            role: (user.customClaims?.role as UserRole) || undefined,
        }));
    } catch (e) {
        console.error("Admin SDK Auth error:", e);
        return [];
    }
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
    try {
        const bookings = await getAllBookings();
        const rooms = await getRooms();
        const confirmed = bookings.filter(b => b.status === 'confirmed');
        const totalRevenue = confirmed.reduce((acc, b) => acc + b.totalCost, 0);
        const totalBookings = confirmed.length;

        const revenueByRoom = rooms.map(room => {
            const rev = confirmed.filter(b => b.roomId === room.id).reduce((acc, b) => acc + b.totalCost, 0);
            return { name: room.name, revenue: rev };
        }).filter(r => r.revenue > 0);

        const today = new Date();
        const last12 = eachMonthOfInterval({ start: new Date(today.getFullYear() - 1, today.getMonth() + 1, 1), end: today });
        const bookingsPerMonth = last12.map(m => {
            const name = format(m, 'MMM yy');
            const total = confirmed.filter(b => {
                const d = new Date(b.bookedOn);
                return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
            }).length;
            return { name, total };
        });

        return { totalRevenue, totalBookings, occupancyRate: 0, revenueByRoom, bookingsPerMonth };
    } catch (e) {
        return { totalRevenue: 0, totalBookings: 0, occupancyRate: 0, revenueByRoom: [], bookingsPerMonth: [] };
    }
}

export async function getAllBookings(): Promise<Booking[]> {
    try {
        const db = getDb();
        const snapshot = await db.collection('bookings').get();
        return snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }) as Booking)
            .sort((a, b) => new Date(b.bookedOn).getTime() - new Date(a.bookedOn).getTime());
    } catch (e) {
        return [];
    }
}

export async function getMessages(): Promise<Message[]> {
    try {
        const db = getDb();
        const snapshot = await db.collection('messages').get();
        return snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }) as Message)
            .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    } catch (e) {
        return [];
    }
}

export async function saveMessage(messageData: Omit<Message, 'id' | 'sentAt' | 'isRead'>): Promise<void> {
    const db = getDb();
    await db.collection('messages').add({ ...messageData, sentAt: new Date().toISOString(), isRead: false });
}

export async function confirmBookingFromWebhook(reference: string) {
    try {
        const db = getDb();
        const snapshot = await db.collection('bookings').where('transactionRef', '==', reference).get();
        if (!snapshot.empty) {
            const bookingDoc = snapshot.docs[0];
            await bookingDoc.ref.update({ status: 'confirmed' });
        }
    } catch (e) {
        console.error("Webhook confirmation failed:", e);
    }
}

export async function initializePaystackTransaction(email: string, amount: number) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error('Paystack secret key is not configured.');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.laquitahotel.com';
    const params = { email, amount: Math.round(amount * 100), currency: 'KES', callback_url: `${siteUrl}/bookings/status` };
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message || 'Paystack initialization failed.');
    return data.data;
}

export async function verifyPaystackTransaction(reference: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error('Paystack secret key missing.');
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message || 'Verification failed.');
    return data.data;
}
