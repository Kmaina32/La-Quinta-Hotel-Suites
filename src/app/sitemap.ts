
import { MetadataRoute } from 'next';
import { getRooms } from '@/lib/actions';
import type { Room } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.laquitahotel.com';

  // Get all rooms to generate dynamic routes
  const rooms: Room[] = await getRooms();

  const roomUrls = rooms.map((room) => {
    return {
      url: `${baseUrl}/rooms/${room.id}`,
      lastModified: new Date(),
    };
  });

  // Define static routes
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
        url: `${baseUrl}/#rooms`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
      url: `${baseUrl}/bookings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
     {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ];

  return [...staticUrls, ...roomUrls];
}
