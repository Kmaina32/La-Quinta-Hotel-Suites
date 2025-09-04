'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRooms, getEstablishmentImages, updateHeroImage, updateGalleryImage, updateRoomDetails } from '@/lib/actions';
import type { Room, EstablishmentImage } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [galleryImages, setGalleryImages] = useState<EstablishmentImage[]>([]);
  const [heroImage, setHeroImage] = useState('');
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkAuth = () => {
      const auth = sessionStorage.getItem('la-quita-admin-auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
        fetchData();
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [roomsData, galleryData] = await Promise.all([
      getRooms(),
      getEstablishmentImages(),
    ]);
    setRooms(roomsData);
    setGalleryImages(galleryData);
    const hero = galleryData.find(img => img.id === 'hero-image');
    setHeroImage(hero?.src || '');
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '38448674') {
      sessionStorage.setItem('la-quita-admin-auth', 'true');
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('Incorrect password');
    }
  };
  
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeroImage(e.target.value);
  };

  const handleGalleryImageChange = (id: string, newSrc: string) => {
    setGalleryImages(galleryImages.map(img => img.id === id ? { ...img, src: newSrc } : img));
  };
  
  const handleRoomChange = (id: string, field: keyof Room, value: any) => {
    setRooms(rooms.map(room => room.id === id ? { ...room, [field]: value } : room));
  };

  const handleSave = async (type: 'hero' | 'gallery' | 'room', id: string) => {
    setSavingStates(prev => ({...prev, [id]: true}));
    try {
      if (type === 'hero') {
        await updateHeroImage(heroImage);
      } else if (type === 'gallery') {
        const image = galleryImages.find(img => img.id === id);
        if (image) await updateGalleryImage(id, image.src);
      } else if (type === 'room') {
        const room = rooms.find(r => r.id === id);
        if (room) await updateRoomDetails(id, room);
      }
      alert('Saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save changes.');
    } finally {
       setSavingStates(prev => ({...prev, [id]: false}));
    }
  };


  if (loading && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      {/* Hero Image Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hero Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
              <Image src={heroImage} alt="Hero" width={100} height={60} className="rounded-md object-cover" />
              <Input value={heroImage} onChange={handleHeroImageChange} placeholder="Enter image URL" />
          </div>
          <Button onClick={() => handleSave('hero', 'hero-image')} disabled={savingStates['hero-image']}>
            {savingStates['hero-image'] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Hero Image
          </Button>
        </CardContent>
      </Card>

      {/* Gallery Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Gallery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {galleryImages.filter(img => img.id !== 'hero-image').map(image => (
            <div key={image.id} className="flex items-center gap-4">
              <Image src={image.src} alt={image.alt} width={100} height={60} className="rounded-md object-cover" />
              <Input value={image.src} onChange={(e) => handleGalleryImageChange(image.id, e.target.value)} placeholder="Enter image URL" />
              <Button onClick={() => handleSave('gallery', image.id)} disabled={savingStates[image.id]}>
                {savingStates[image.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rooms Management */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {rooms.map(room => (
            <div key={room.id} className="border p-4 rounded-lg space-y-4">
              <h3 className="text-2xl font-semibold">{room.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="font-medium">Name</label>
                    <Input value={room.name} onChange={e => handleRoomChange(room.id, 'name', e.target.value)} />
                </div>
                 <div>
                    <label className="font-medium">Price</label>
                    <Input type="number" value={room.price} onChange={e => handleRoomChange(room.id, 'price', Number(e.target.value))} />
                </div>
                 <div>
                    <label className="font-medium">Capacity</label>
                    <Input type="number" value={room.capacity} onChange={e => handleRoomChange(room.id, 'capacity', Number(e.target.value))} />
                </div>
                 <div>
                    <label className="font-medium">Beds</label>
                    <Input type="number" value={room.beds} onChange={e => handleRoomChange(room.id, 'beds', Number(e.target.value))} />
                </div>
                 <div>
                    <label className="font-medium">Baths</label>
                    <Input type="number" value={room.baths} onChange={e => handleRoomChange(room.id, 'baths', Number(e.target.value))} />
                </div>
                <div className="md:col-span-2">
                    <label className="font-medium">Description</label>
                    <Input value={room.description} onChange={e => handleRoomChange(room.id, 'description', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <label className="font-medium">Main Image URL</label>
                    <div className="flex items-center gap-4">
                        <Image src={room.imageUrl} alt={room.name} width={100} height={60} className="rounded-md object-cover" />
                        <Input value={room.imageUrl} onChange={e => handleRoomChange(room.id, 'imageUrl', e.target.value)} />
                    </div>
                </div>
              </div>
              <Button onClick={() => handleSave('room', room.id)} disabled={savingStates[room.id]}>
                 {savingStates[room.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Room Details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
