export const rooms = [
  {
    id: '1',
    name: 'Deluxe Queen Room',
    description: 'A spacious room with a queen-sized bed, perfect for couples or solo travelers.',
    price: 150,
    capacity: 2,
    beds: 1,
    baths: 1,
    imageUrl: 'https://picsum.photos/600/400?random=11',
    images: [
      { id: 1, src: "https://picsum.photos/800/600?random=12", alt: "Deluxe room bed" },
      { id: 2, src: "https://picsum.photos/800/600?random=13", alt: "Deluxe room bathroom" },
      { id: 3, src: "https://picsum.photos/800/600?random=14", alt: "Deluxe room view" },
    ]
  },
  {
    id: '2',
    name: 'Executive King Suite',
    description: 'Experience luxury in our king suite with a separate living area and stunning city views.',
    price: 250,
    capacity: 2,
    beds: 1,
    baths: 1,
    imageUrl: 'https://picsum.photos/600/400?random=21',
    images: [
      { id: 1, src: "https://picsum.photos/800/600?random=22", alt: "King suite living area" },
      { id: 2, src: "https://picsum.photos/800/600?random=23", alt: "King suite bedroom" },
      { id: 3, src: "https://picsum.photos/800/600?random=24", alt: "King suite bathroom amenities" },
    ]
  },
  {
    id: '3',
    name: 'Family Garden Room',
    description: 'Ideal for families, this room features two double beds and opens to a private garden patio.',
    price: 220,
    capacity: 4,
    beds: 2,
    baths: 2,
    imageUrl: 'https://picsum.photos/600/400?random=31',
    images: [
      { id: 1, src: "https://picsum.photos/800/600?random=32", alt: "Family room beds" },
      { id: 2, src: "https://picsum.photos/800/600?random=33", alt: "Family room patio" },
      { id: 3, src: "https://picsum.photos/800/600?random=34", alt: "Family room space" },
    ]
  },
];
