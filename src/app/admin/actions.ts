'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  heroImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

export async function updateHeroImage(formData: FormData) {
  const validatedFields = schema.safeParse({
    heroImageUrl: formData.get('heroImageUrl'),
  });

  if (!validatedFields.success) {
    // This is a simple implementation. For a real app, you'd want to
    // return the error message to the user.
    console.error(validatedFields.error);
    return;
  }
  
  const { heroImageUrl } = validatedFields.data;
  const configPath = path.join(process.cwd(), 'src', 'lib', 'config.json');

  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    config.heroImageUrl = heroImageUrl;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    revalidatePath('/');
  } catch (error) {
    console.error('Error updating hero image:', error);
    // Handle error appropriately
  }
}
