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
}

export interface EstablishmentImage {
  id: string;
  src: string;
  alt: string;
  'data-ai-hint': string;
}
