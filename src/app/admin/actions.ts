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
  id: z.string(),
  description: z.string().min(1, { message: 'Description cannot be empty.' }),
  image: z.string().url({ message: 'Please enter a valid main image URL.' }),
  image1: z.string().url({ message: 'Please enter a valid URL for image 1.' }),
  image2: z.string().url({ message: 'Please enter a valid URL for image 2.' }),
  image3: z.string().url({ message: 'Please enter a valid URL for image 3.' }),
});

export async function updateRoom(formData: FormData) {
    const validatedFields = roomSchema.safeParse({
        id: formData.get('id'),
        description: formData.get('description'),
        image: formData.get('image'),
        image1: formData.get('image1'),
        image2: formData.get('image2'),
        image3: formData.get('image3'),
    });

    if (!validatedFields.success) {
        console.error(validatedFields.error);
        return { error: 'Invalid data provided for room update.' };
    }

    const { id, description, image, image1, image2, image3 } = validatedFields.data;
    const roomsPath = path.join(process.cwd(), 'src', 'lib', 'rooms.json');

    try {
        const rooms: Room[] = JSON.parse(await fs.readFile(roomsPath, 'utf-8'));
        const roomIndex = rooms.findIndex(r => r.id === id);

        if (roomIndex === -1) {
            return { error: 'Room not found.' };
        }

        rooms[roomIndex].description = description;
        rooms[roomIndex].image = image;
        rooms[roomIndex].images = [image1, image2, image3];

        await fs.writeFile(roomsPath, JSON.stringify(rooms, null, 2));
        
        revalidatePath('/');
        revalidatePath(`/rooms/${id}`);
        revalidatePath('/admin');

    } catch (error) {
        console.error('Error updating room:', error);
        return { error: 'Failed to update room data.' };
    }
}
