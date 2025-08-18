
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { type Booking } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const bookingsPath = path.join(process.cwd(), 'src', 'lib', 'bookings.json');

async function readBookings(): Promise<Booking[]> {
  try {
    const data = await fs.readFile(bookingsPath, 'utf-8');
    if (!data) {
        return [];
    }
    return JSON.parse(data) as Booking[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error("Failed to read bookings:", error);
    return []; // Return empty array on error
  }
}

export async function saveBooking(booking: Booking): Promise<void> {
  const bookings = await readBookings();
  bookings.push(booking);
  await fs.writeFile(bookingsPath, JSON.stringify(bookings, null, 2));
  revalidatePath('/bookings');
  revalidatePath('/admin');
}

export async function getBookingsForUser(userId: string): Promise<Booking[]> {
    const bookings = await readBookings();
    return bookings.filter(booking => booking.userId === userId);
}
