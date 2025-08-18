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

export type EstablishmentImage = {
  id: string;
  src: string;
  description: string;
};

export const rooms: Room[] = roomsData.rooms;
export const establishmentImages: EstablishmentImage[] = roomsData.establishment;


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
    roomId: 'deluxe-king-1',
    checkIn: '2024-08-15',
    checkOut: '2024-08-20',
    guests: 2,
    totalPrice: 750,
    status: 'Confirmed',
  },
  {
    id: 'BK12346',
    roomId: 'deluxe-king-2',
    checkIn: '2024-09-01',
    checkOut: '2024-09-05',
    guests: 2,
    totalPrice: 1000,
    status: 'Confirmed',
  },
];

export const amenities = [
    'Free Wi-Fi',
    'On-site Restaurant',
    'Free Parking',
    'Luxurious Bedding',
    'Air Conditioning',
    '24/7 Front Desk'
]
