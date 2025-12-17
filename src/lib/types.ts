
export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  beds: number;
  baths: number;
  imageUrl: string;
  images: { id: string; src: string; alt: string }[];
  type: 'room' | 'conference';
}

export interface EstablishmentImage {
  id: string;
  src: string;
  alt: string;
  'data-ai-hint': string;
}

export interface Booking {
    id: string;
    userId: string; // Added to associate booking with a user
    roomId: string;
    roomName: string;
    roomImage: string;
    checkIn: string; // ISO string
    checkOut: string; // ISO string
    nights: number;
    totalCost: number;
    paymentMethod: string;
    bookedOn: string; // ISO string
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: string; // ISO string
  isRead: boolean;
}
