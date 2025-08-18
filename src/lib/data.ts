import roomsData from './rooms.json';

export type Room = {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  image: string;
  images: string[];
};

export const rooms: Room[] = roomsData;


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

export const restaurantImages = [
    'https://placehold.co/600x400.png',
    'https://placehold.co/600x400.png',
    'https://placehold.co/600x400.png',
];

export const amenities = [
    'Free Wi-Fi',
    'On-site Restaurant',
    'Free Parking',
    'Luxurious Bedding',
    'Air Conditioning',
    '24/7 Front Desk'
]
