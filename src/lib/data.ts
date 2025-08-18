export type Room = {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  image: string;
};

export const rooms: Room[] = [
  {
    id: 'deluxe-king',
    name: 'Deluxe King Room',
    description: 'A spacious room with a king-sized bed, perfect for couples or solo travelers seeking comfort.',
    price: 150,
    capacity: 2,
    amenities: ['King Bed', 'Free Wi-Fi', 'Air Conditioning', 'Mini Fridge'],
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 'executive-suite',
    name: 'Executive Suite',
    description: 'Experience luxury in our executive suite, featuring a separate living area and premium amenities.',
    price: 250,
    capacity: 3,
    amenities: ['King Bed', 'Sofa Bed', 'Living Area', 'Free Wi-Fi', 'Air Conditioning', 'Kitchenette'],
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 'family-room',
    name: 'Family Room',
    description: 'Ideal for families, this room offers two queen beds and ample space for everyone to relax.',
    price: 200,
    capacity: 4,
    amenities: ['Two Queen Beds', 'Free Wi-Fi', 'Air Conditioning', 'Bathtub'],
    image: 'https://placehold.co/600x400.png',
  },
];


export type Booking = {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
};

export const bookings: Booking[] = [
  {
    id: 'BK12345',
    roomId: 'deluxe-king',
    checkIn: '2024-08-15',
    checkOut: '2024-08-20',
    guests: 2,
    totalPrice: 750,
    status: 'Confirmed',
  },
  {
    id: 'BK12346',
    roomId: 'executive-suite',
    checkIn: '2024-09-01',
    checkOut: '2024-09-05',
    guests: 2,
    totalPrice: 1000,
    status: 'Confirmed',
  },
  {
    id: 'BK12347',
    roomId: 'family-room',
    checkIn: '2024-10-10',
    checkOut: '2024-10-12',
    guests: 4,
    totalPrice: 400,
    status: 'Cancelled',
  },
];
