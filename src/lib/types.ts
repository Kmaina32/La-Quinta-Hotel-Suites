
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
    roomId: string;
    roomName: string;
    roomImage: string;
    checkIn: string; // ISO string
    checkOut: string; // ISO string
    nights: number;
    totalCost: number;
    paymentMethod: string;
    bookedOn: string; // ISO string
    // In a real app, you'd have a userId here
}
