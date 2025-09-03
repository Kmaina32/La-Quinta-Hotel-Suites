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

export type Booking = {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  allocatedRoomNumber: string | null;
};

export const amenities = [
    'Free Wi-Fi',
    'On-site Restaurant',
    'Free Parking',
    'Luxurious Bedding',
    'Air Conditioning',
    '24/7 Front Desk'
];
