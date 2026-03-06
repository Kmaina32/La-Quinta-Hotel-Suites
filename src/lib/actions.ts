
'use server';

import { getDb, getStorage, getAuthAdmin, isAdminReady } from '@/lib/firebase-admin';
import type { Room, EstablishmentImage, Booking, Message, UserData, SiteSettings, UserRole, AnalyticsData } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { FieldValue } from 'firebase-admin/firestore';

// Helper to ensure DB is ready, otherwise throws a controlled error
function ensureDb() {
    const db = getDb();
    if (!db) throw new Error("Firebase admin initialization failed. Check your environment variable configuration.");
    return db;
}

export async function uploadImage(formData: FormData): Promise<string> {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided.');

        const storage = getStorage();
        if (!storage) throw new Error("Cloud Storage not available.");
        
        const bucket = storage.bucket();
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `images/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(fileBuffer, {
            metadata: { contentType: file.type },
        });

        await fileUpload.makePublic();
        return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    } catch (e) {
        console.error("Upload error:", e);
        throw e;
    }
}

export async function getRooms(): Promise<Room[]> {
    if (!isAdminReady()) return [];
    try {
        const db = ensureDb();
        const roomsSnapshot = await db.collection('rooms').orderBy('price').get();
        return roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Room[];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
}

export async function getRoom(id: string): Promise<Room | null> {
    if (!isAdminReady()) return null;
    try {
        const db = ensureDb();
        const roomSnapshot = await db.collection('rooms').doc(id).get();
        if (!roomSnapshot.exists) return null;
        return { id: roomSnapshot.id, ...roomSnapshot.data() } as Room;
    } catch (error) {
        console.error(`Error fetching room ${id}:`, error);
        return null;
    }
}

export async function updateRoomDetails(id: string, room: Partial<Room>) {
    const db = ensureDb();
    await db.collection('rooms').doc(id).update(room);
    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
    revalidatePath('/admin');
}

export async function addRoom(newRoom: Omit<Room, 'id' | 'booked'>) {
    const db = ensureDb();
    const roomRef = await db.collection('rooms').add({ ...newRoom, booked: {} });
    await roomRef.update({ id: roomRef.id });
    revalidatePath('/');
    revalidatePath('/admin');
    return roomRef.id;
}

export async function deleteRoom(id: string) {
    const db = ensureDb();
    await db.collection('rooms').doc(id).delete();
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function getEstablishmentImages(): Promise<{ heroImage: EstablishmentImage | null; galleryImages: EstablishmentImage[] }> {
    if (!isAdminReady()) return { heroImage: null, galleryImages: [] };
    try {
        const db = ensureDb();
        const establishmentCollection = db.collection('establishment');
        const heroDoc = await establishmentCollection.doc('hero-image').get();
        const heroImage = heroDoc.exists ? { id: heroDoc.id, ...heroDoc.data() } as EstablishmentImage : null;

        const gallerySnapshot = await establishmentCollection.where('src', '!=', '').get();
        const galleryImages = gallerySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as EstablishmentImage))
            .filter(img => img.id !== 'hero-image' && img.id !== 'site-settings');

        return { heroImage, galleryImages };
    } catch (error) {
        console.error('Error fetching establishment images:', error);
        return { heroImage: null, galleryImages: [] };
    }
}

export async function updateHeroImage(src: string) {
    const db = ensureDb();
    await db.collection('establishment').doc('hero-image').set({ src, alt: 'Hero Image', 'data-ai-hint': 'hotel exterior' }, { merge: true });
    revalidatePath('/');
}

export async function updateGalleryImage(id: string, src: string) {
    const db = ensureDb();
    await db.collection('establishment').doc(id).update({ src });
    revalidatePath('/');
}

export async function addGalleryImage(newImage: Omit<EstablishmentImage, 'id'>) {
    const db = ensureDb();
    const newImageRef = await db.collection('establishment').add(newImage);
    await newImageRef.update({ id: newImageRef.id });
    revalidatePath('/');
    return newImageRef.id;
}

export async function deleteGalleryImage(id: string) {
    const db = ensureDb();
    if (id === 'hero-image') return;
    await db.collection('establishment').doc(id).delete();
    revalidatePath('/');
}

export async function getSiteSettings(): Promise<SiteSettings> {
    if (!isAdminReady()) return { activeTheme: 'default' };
    try {
        const db = ensureDb();
        const settingsDoc = await db.collection('establishment').doc('site-settings').get();
        return (settingsDoc.exists ? settingsDoc.data() : { activeTheme: 'default' }) as SiteSettings;
    } catch (error) {
        return { activeTheme: 'default' };
    }
}

export async function updateSiteSettings(settings: SiteSettings) {
    const db = ensureDb();
    await db.collection('establishment').doc('site-settings').set(settings, { merge: true });
    revalidatePath('/', 'layout');
}

export async function createBooking(bookingData: Omit<Booking, 'id' | 'bookedOn' | 'status'>, isReservation: boolean = false) {
    const db = ensureDb();
    const roomRef = db.collection('rooms').doc(bookingData.roomId);

    const transactionError = await db.runTransaction(async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists) return "Room does not exist.";

        const room = roomDoc.data() as Room;
        const bookingDates = eachDayOfInterval({
            start: new Date(bookingData.checkIn),
            end: new Date(bookingData.checkOut)
        });

        const updates: Record<string, FieldValue> = {};
        for (const day of bookingDates.slice(0, -1)) {
            const dateString = format(day, 'yyyy-MM-dd');
            const currentBooked = room.booked?.[dateString] || 0;
            if (currentBooked >= (room.inventory || 1)) {
                return `Room is fully booked on ${dateString}.`;
            }
            updates[`booked.${dateString}`] = FieldValue.increment(1);
        }

        transaction.update(roomRef, updates);
        const newBookingRef = bookingData.transactionRef ? db.collection('bookings').doc(bookingData.transactionRef) : db.collection('bookings').doc();
        transaction.set(newBookingRef, { 
            ...bookingData, 
            bookedOn: new Date().toISOString(), 
            status: isReservation ? 'pending' : 'confirmed' 
        });
        return null;
    });

    if (transactionError) throw new Error(transactionError);
    revalidatePath('/bookings');
    revalidatePath('/admin');
}

export async function getBookingsForUser(userId: string): Promise<Booking[]> {
    if (!isAdminReady()) return [];
    try {
        const db = ensureDb();
        const snapshot = await db.collection('bookings').where('userId', '==', userId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Booking).sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
    } catch (e) {
        return [];
    }
}

export async function getAllBookings(): Promise<Booking[]> {
    if (!isAdminReady()) return [];
    try {
        const db = ensureDb();
        const snapshot = await db.collection('bookings').orderBy('bookedOn', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Booking);
    } catch (e) {
        return [];
    }
}

export async function cancelBooking(bookingId: string) {
    const db = ensureDb();
    const bookingRef = db.collection('bookings').doc(bookingId);

    const error = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(bookingRef);
        if (!doc.exists) return "Booking not found.";
        const booking = doc.data() as Booking;
        if (booking.status === 'cancelled') return "Already cancelled.";

        const roomRef = db.collection('rooms').doc(booking.roomId);
        const roomDoc = await transaction.get(roomRef);
        if (roomDoc.exists) {
            const updates: Record<string, FieldValue> = {};
            const dates = eachDayOfInterval({ start: new Date(booking.checkIn), end: new Date(booking.checkOut) });
            for (const day of dates.slice(0, -1)) {
                const ds = format(day, 'yyyy-MM-dd');
                if ((roomDoc.data()?.booked?.[ds] || 0) > 0) updates[`booked.${ds}`] = FieldValue.increment(-1);
            }
            if (Object.keys(updates).length > 0) transaction.update(roomRef, updates);
        }
        transaction.update(bookingRef, { status: 'cancelled' });
        return null;
    });
    if (error) throw new Error(error);
    revalidatePath('/bookings');
    revalidatePath('/admin');
}

export async function saveMessage(messageData: Omit<Message, 'id' | 'sentAt' | 'isRead'>): Promise<void> {
    const db = ensureDb();
    await db.collection('messages').add({ ...messageData, sentAt: new Date().toISOString(), isRead: false });
    revalidatePath('/admin');
}

export async function getMessages(): Promise<Message[]> {
    if (!isAdminReady()) return [];
    try {
        const db = ensureDb();
        const snapshot = await db.collection('messages').orderBy('sentAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message[]);
    } catch (e) {
        return [];
    }
}

export async function getAllUsers(): Promise<UserData[]> {
    const auth = getAuthAdmin();
    if (!auth) return [];
    try {
        const userRecords = await auth.listUsers();
        return userRecords.users.map(user => ({
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            metadata: user.metadata.toJSON(),
            role: (user.customClaims?.role as UserRole) || undefined,
        }));
    } catch (e) {
        console.error("Auth error:", e);
        return [];
    }
}

export async function setUserRole(uid: string, role: UserRole | null) {
    const auth = getAuthAdmin();
    if (!auth) throw new Error("Auth service unavailable.");
    await auth.setCustomUserClaims(uid, { role });
    revalidatePath('/admin');
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

export async function confirmBookingFromWebhook(reference: string) {
    if (!isAdminReady()) return;
    const db = getDb();
    if (!db) return;
    const bookingRef = db.collection('bookings').doc(reference);
    const doc = await bookingRef.get();
    if (doc.exists) {
        await bookingRef.update({ status: 'confirmed' });
        revalidatePath('/bookings');
        revalidatePath('/admin');
    }
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
    if (!isAdminReady()) return { totalRevenue: 0, totalBookings: 0, occupancyRate: 0, revenueByRoom: [], bookingsPerMonth: [] };
    
    try {
        const bookings = await getAllBookings();
        const rooms = await getRooms();
        const confirmed = bookings.filter(b => b.status === 'confirmed');
        const totalRevenue = confirmed.reduce((acc, b) => acc + b.totalCost, 0);
        const totalBookings = confirmed.length;

        const occupancyRate = 0; // Simplified for speed

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

        return { totalRevenue, totalBookings, occupancyRate, revenueByRoom, bookingsPerMonth };
    } catch (e) {
        return { totalRevenue: 0, totalBookings: 0, occupancyRate: 0, revenueByRoom: [], bookingsPerMonth: [] };
    }
}
