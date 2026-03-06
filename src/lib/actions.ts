
'use server';

import { getDb, getStorage, getAuthAdmin, isAdminReady } from '@/lib/firebase-admin';
import { db as clientDb } from '@/lib/firebase';
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    query, 
    orderBy, 
    where, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    setDoc,
    increment,
    runTransaction,
    Timestamp
} from 'firebase/firestore';
import type { Room, EstablishmentImage, Booking, Message, UserData, SiteSettings, UserRole, AnalyticsData } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

/**
 * Standard Data Fetching (Uses Client SDK for stability on deployment)
 */

export async function getRooms(): Promise<Room[]> {
    try {
        const roomsRef = collection(clientDb, 'rooms');
        const q = query(roomsRef, orderBy('price'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return [];
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Room[];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
}

export async function getRoom(id: string): Promise<Room | null> {
    try {
        const docRef = doc(clientDb, 'rooms', id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return { id: snapshot.id, ...snapshot.data() } as Room;
    } catch (error) {
        console.error(`Error fetching room ${id}:`, error);
        return null;
    }
}

export async function getEstablishmentImages(): Promise<{ heroImage: EstablishmentImage | null; galleryImages: EstablishmentImage[] }> {
    try {
        const estRef = collection(clientDb, 'establishment');
        const heroRef = doc(clientDb, 'establishment', 'hero-image');
        const heroSnap = await getDoc(heroRef);
        const heroImage = heroSnap.exists() ? { id: heroSnap.id, ...heroSnap.data() } as EstablishmentImage : null;

        const snapshot = await getDocs(estRef);
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
        const settingsRef = doc(clientDb, 'establishment', 'site-settings');
        const snapshot = await getDoc(settingsRef);
        return (snapshot.exists() ? snapshot.data() : { activeTheme: 'default' }) as SiteSettings;
    } catch (error) {
        return { activeTheme: 'default' };
    }
}

/**
 * Mutations (Using Client SDK for consistent permissions)
 */

export async function updateRoomDetails(id: string, room: Partial<Room>) {
    try {
        const docRef = doc(clientDb, 'rooms', id);
        await updateDoc(docRef, room);
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
        const roomsRef = collection(clientDb, 'rooms');
        const docRef = await addDoc(roomsRef, { ...newRoom, booked: {} });
        await updateDoc(docRef, { id: docRef.id });
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
        const docRef = doc(clientDb, 'rooms', id);
        await deleteDoc(docRef);
        revalidatePath('/');
        revalidatePath('/admin');
    } catch (e) {
        console.error("Delete failed:", e);
        throw e;
    }
}

export async function updateHeroImage(src: string) {
    const heroRef = doc(clientDb, 'establishment', 'hero-image');
    await setDoc(heroRef, { src, alt: 'Hero Image', 'data-ai-hint': 'hotel exterior' }, { merge: true });
    revalidatePath('/');
}

export async function updateGalleryImage(id: string, src: string) {
    const imgRef = doc(clientDb, 'establishment', id);
    await updateDoc(imgRef, { src });
    revalidatePath('/');
}

export async function updateSiteSettings(settings: SiteSettings) {
    const settingsRef = doc(clientDb, 'establishment', 'site-settings');
    await setDoc(settingsRef, settings, { merge: true });
    revalidatePath('/', 'layout');
}

/**
 * Privileged Operations (Require Admin SDK)
 */

export async function getAllUsers(): Promise<UserData[]> {
    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
        console.warn("getAllUsers requested but Admin SDK not configured.");
        return [];
    }
    try {
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

/**
 * Generic Fetchers (Resilient)
 */

export async function getAllBookings(): Promise<Booking[]> {
    try {
        const bookingsRef = collection(clientDb, 'bookings');
        const snapshot = await getDocs(bookingsRef);
        return snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }) as Booking)
            .sort((a, b) => new Date(b.bookedOn).getTime() - new Date(a.bookedOn).getTime());
    } catch (e) {
        return [];
    }
}

export async function getMessages(): Promise<Message[]> {
    try {
        const messagesRef = collection(clientDb, 'messages');
        const snapshot = await getDocs(messagesRef);
        return snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }) as Message[])
            .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    } catch (e) {
        return [];
    }
}

export async function saveMessage(messageData: Omit<Message, 'id' | 'sentAt' | 'isRead'>): Promise<void> {
    const messagesRef = collection(clientDb, 'messages');
    await addDoc(messagesRef, { ...messageData, sentAt: new Date().toISOString(), isRead: false });
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
