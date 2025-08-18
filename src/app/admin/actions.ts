'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Room, EstablishmentImage, Booking } from '@/lib/data';

const bookingsPath = path.join(process.cwd(), 'src', 'lib', 'bookings.json');

async function readBookings(): Promise<Booking[]> {
  try {
    const data = await fs.readFile(bookingsPath, 'utf-8');
    return JSON.parse(data) as Booking[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function getBookings(): Promise<Booking[]> {
  return await readBookings();
}

const heroImageSchema = z.object({
  heroImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

export async function updateHeroImage(formData: FormData) {
  const validatedFields = heroImageSchema.safeParse({
    heroImageUrl: formData.get('heroImageUrl'),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { error: 'Invalid URL provided.' };
  }
  
  const { heroImageUrl } = validatedFields.data;
  const configPath = path.join(process.cwd(), 'src', 'lib', 'config.json');

  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    config.heroImageUrl = heroImageUrl;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error updating hero image:', error);
    return { error: 'Failed to update hero image.' };
  }
}

const roomSchema = z.object({
  id: z.string().optional(), // Optional for new rooms
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

    const { id, name, description, price, image, image1, image2, image3 } = validatedFields.data;
    const roomsPath = path.join(process.cwd(), 'src', 'lib', 'rooms.json');

    try {
        const data = JSON.parse(await fs.readFile(roomsPath, 'utf-8'));
        const rooms: Room[] = data.rooms;
        const roomIndex = id ? rooms.findIndex(r => r.id === id) : -1;

        if (roomIndex !== -1) {
            // Update existing room
            rooms[roomIndex] = {
                ...rooms[roomIndex],
                name,
                description,
                price,
                image,
                images: [image1, image2, image3],
            };
        } else {
            // Add new room
            const newRoom: Room = {
                id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                name,
                description,
                price,
                capacity: 2, // Default capacity
                amenities: ["King Bed", "Free Wi-Fi", "Air Conditioning", "Mini Fridge", "City View", "Room Service"], // Default amenities
                image,
                images: [image1, image2, image3],
            };
            rooms.push(newRoom);
        }

        data.rooms = rooms;
        await fs.writeFile(roomsPath, JSON.stringify(data, null, 2));
        
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
  if (!id) {
    return { error: 'Room ID is missing.' };
  }

  const roomsPath = path.join(process.cwd(), 'src', 'lib', 'rooms.json');

  try {
    const data = JSON.parse(await fs.readFile(roomsPath, 'utf-8'));
    const rooms: Room[] = data.rooms;
    const updatedRooms = rooms.filter(room => room.id !== id);

    if (rooms.length === updatedRooms.length) {
      return { error: 'Room not found.' };
    }
    
    data.rooms = updatedRooms;
    await fs.writeFile(roomsPath, JSON.stringify(data, null, 2));

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/rooms/${id}`);
    
    return { success: true, message: 'Room deleted successfully.' };
  } catch (error) {
    console.error('Error deleting room:', error);
    return { error: 'Failed to delete room data.' };
  }
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
    console.error(validatedFields.error);
    return { error: 'Invalid data provided for establishment image.' };
  }

  const { id, src, description } = validatedFields.data;
  const dataPath = path.join(process.cwd(), 'src', 'lib', 'rooms.json');

  try {
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
    let establishment: EstablishmentImage[] = data.establishment || [];
    const imageIndex = id ? establishment.findIndex(img => img.id === id) : -1;

    if (imageIndex !== -1) {
      establishment[imageIndex] = { ...establishment[imageIndex], src, description };
    } else {
      const newImage: EstablishmentImage = {
        id: `gallery-${Date.now()}`,
        src,
        description,
      };
      establishment.push(newImage);
    }
    
    data.establishment = establishment;
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

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
  if (!id) {
    return { error: 'Image ID is missing.' };
  }
  const dataPath = path.join(process.cwd(), 'src', 'lib', 'rooms.json');

  try {
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
    let establishment: EstablishmentImage[] = data.establishment || [];
    const updatedImages = establishment.filter(img => img.id !== id);

    if (establishment.length === updatedImages.length) {
      return { error: 'Image not found.' };
    }

    data.establishment = updatedImages;
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'Image deleted' };
  } catch (error) {
    console.error('Error deleting establishment image:', error);
    return { error: 'Failed to delete image.' };
  }
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
    console.error(validatedFields.error);
    return { error: 'Invalid data provided.' };
  }

  const { bookingId, allocatedRoomNumber } = validatedFields.data;
  const bookingsData = await fs.readFile(bookingsPath, 'utf-8');
  const bookings: Booking[] = JSON.parse(bookingsData);
  
  try {
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return { error: 'Booking not found.' };
    }

    bookings[bookingIndex].allocatedRoomNumber = allocatedRoomNumber;

    await fs.writeFile(bookingsPath, JSON.stringify(bookings, null, 2));

    revalidatePath('/admin');
    revalidatePath('/bookings');

    return { success: true, message: 'Room allocated successfully.' };
  } catch (error) {
    console.error('Error allocating room:', error);
    return { error: 'Failed to allocate room.' };
  }
}
