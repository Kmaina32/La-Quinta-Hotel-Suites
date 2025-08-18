'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Room } from '@/lib/data';

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
        id: formData.get('id'),
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
        const rooms: Room[] = JSON.parse(await fs.readFile(roomsPath, 'utf-8'));
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

        await fs.writeFile(roomsPath, JSON.stringify(rooms, null, 2));
        
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
    const rooms: Room[] = JSON.parse(await fs.readFile(roomsPath, 'utf-8'));
    const updatedRooms = rooms.filter(room => room.id !== id);

    if (rooms.length === updatedRooms.length) {
      return { error: 'Room not found.' };
    }

    await fs.writeFile(roomsPath, JSON.stringify(updatedRooms, null, 2));

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/rooms/${id}`);
    
    return { success: true, message: 'Room deleted successfully.' };
  } catch (error) {
    console.error('Error deleting room:', error);
    return { error: 'Failed to delete room data.' };
  }
}