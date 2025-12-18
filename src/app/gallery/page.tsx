
import Image from 'next/image';
import { getEstablishmentImages } from '@/lib/actions';
import type { EstablishmentImage } from '@/lib/types';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Explore the photo gallery of La Quita Hotel & suits, showcasing our beautiful rooms, facilities, and surroundings.',
};

export default async function GalleryPage() {
  let galleryImages: EstablishmentImage[] = [];

  try {
    // We only need galleryImages, so we can destructure it from the response.
    ({ galleryImages } = await getEstablishmentImages());
  } catch (e) {
    console.error('Gallery data load failed.', e);
  }

  // Sort images to ensure a consistent order
  const sortedGallery = galleryImages.sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Our Gallery</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          A glimpse into the elegance and comfort that awaits you at La Quita.
        </p>
      </div>

      {sortedGallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGallery.map((image) => (
            <div key={image.id} className="group relative aspect-square w-full h-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={image['data-ai-hint']}
              />
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground">No images are available in the gallery at the moment.</p>
        </div>
      )}
    </div>
  );
}
