
'use server';

/**
 * @fileOverview An AI flow for generating promotional posters.
 *
 * - createPoster: A function to generate a poster from text and image inputs.
 * - CreatePosterInputSchema: The Zod schema for the input.
 * - CreatePosterOutputSchema: The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {readFileSync} from 'fs';
import {join} from 'path';

// Load the logo file and convert to a Base64 data URI
const logoPath = join(process.cwd(), 'public', 'logo.png');
const logoBuffer = readFileSync(logoPath);
const logoDataUri = `data:image/png;base64,${logoBuffer.toString('base64')}`;

const CreatePosterInputSchema = z.object({
  title: z.string().describe('The main title or headline for the poster.'),
  subtitle: z.string().describe('A secondary line of text, smaller than the title.'),
  occasionDate: z.string().optional().describe('An optional date for the event or promotion, like "December 24th" or "July 4th Weekend".'),
  primaryImage: z.string().describe("The URL of the primary background image for the poster."),
  extraDetails: z.string().optional().describe('A bulleted or short list of amenities or extra details to include, like "Pool, Spa, Free Wi-Fi".'),
});

const CreatePosterOutputSchema = z.object({
  posterUrl: z.string().describe("The generated poster image as a data URI ('data:image/png;base64,...')."),
});

export type CreatePosterInput = z.infer<typeof CreatePosterInputSchema>;
export type CreatePosterOutput = z.infer<typeof CreatePosterOutputSchema>;

export async function createPoster(input: CreatePosterInput): Promise<CreatePosterOutput> {
  return createPosterFlow(input);
}

const createPosterFlow = ai.defineFlow(
  {
    name: 'createPosterFlow',
    inputSchema: CreatePosterInputSchema,
    outputSchema: CreatePosterOutputSchema,
  },
  async (input) => {
    const promptText = `
      You are a professional graphic designer creating a promotional poster for a hotel named "La Quita Hotel & Suites".
      Your task is to generate a visually appealing poster based on the user's request.

      **Instructions:**
      1.  **Primary Image:** Use the provided primary image as the main background or a prominent feature of the poster.
      2.  **Logo Integration:** You MUST incorporate the hotel's logo. The logo is provided as the second media part. Place it tastefully, for example, in a corner or at the top/bottom center.
      3.  **Text Content:**
          *   **Title:** The main headline is "${input.title}". This should be the most prominent text.
          *   **Subtitle:** A smaller headline is "${input.subtitle}".
          *   **Occasion Date:** If provided, include this date: "${input.occasionDate}".
          *   **Extra Details:** Include these details, perhaps as a list with icons or in a stylized text block: "${input.extraDetails}".
      4.  **Style and Layout:**
          *   The overall style should be modern, elegant, and professional, suitable for a luxury hotel.
          *   Use a clear, readable font hierarchy.
          *   Ensure good contrast between text and background. You can use overlays or text boxes if needed.
          *   Arrange the elements (logo, text, image) in a balanced and aesthetically pleasing composition.
      
      **Final Output:**
      Generate a single poster image as a PNG and return it as a data URI.
    `;

    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { text: promptText },
            { media: { url: input.primaryImage } },
            { media: { url: logoDataUri } },
        ],
        config: {
            responseModalities: ['IMAGE'],
        },
    });

    if (!media.url) {
        throw new Error('AI did not return a valid image.');
    }
    
    return { posterUrl: media.url };
  }
);
