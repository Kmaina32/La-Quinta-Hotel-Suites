

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
  inventory: number; // Total number of this room type available
  booked: Record<string, number>; // Maps date string (YYYY-MM-DD) to number of rooms booked
}

export interface EstablishmentImage {
  id: string;
  src: string;
  alt: string;
  'data-ai-hint': string;
}

export interface SiteSettings {
  activeTheme: 'default' | 'christmas';
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string; // Keep user's email for display
  roomId: string;
  roomName: string;
  roomImage: string;
  checkIn: string; // ISO string
  checkOut: string; // ISO string
  nights: number;
  totalCost: number;
  paymentMethod: string;
  transactionRef?: string; // Add this line
  bookedOn: string; // ISO string
  status: 'confirmed' | 'cancelled' | 'pending';
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string; // Optional phone number
  message: string;
  sentAt: string; // ISO string
  isRead: boolean;
}

export interface UserData {
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
}

