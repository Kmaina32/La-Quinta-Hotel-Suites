
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRooms, getEstablishmentImages, updateHeroImage, updateGalleryImage, updateRoomDetails, addRoom, deleteRoom, addGalleryImage, deleteGalleryImage } from '@/lib/actions';
import type { Room, EstablishmentImage } from '@/lib/types';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/components/ui/use-toast"

const defaultRoom: Omit<Room, 'id'> = {
  name: 'New Room',
  description: '',
  price: 100,
  capacity: 2,
  beds: 1,
  baths: 1,
  imageUrl: '',
  images: [],
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [galleryImages, setGalleryImages] = useState<EstablishmentImage[]>([]);
  const [heroImage, setHeroImage] = useState('');
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = () => {
      const auth = sessionStorage.getItem('la-quita-admin-auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, galleryData] = await Promise.all([
        getRooms(),
        getEstablishmentImages(),
      ]);
      setRooms(roomsData);
      const sortedGallery = galleryData.sort((a, b) => a.id.localeCompare(b.id));
      setGalleryImages(sortedGallery);
      const hero = sortedGallery.find(img => img.id === 'hero-image');
      setHeroImage(hero?.src || '');
    } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({ title: "Error", description: "Failed to fetch admin data.", variant: "destructive" });
        setHeroImage('');
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '38448674') {
      sessionStorage.setItem('la-quita-admin-auth', 'true');
      setIsAuthenticated(true);
      fetchData();
    } else {
      toast({ title: "Login Failed", description: "Incorrect password", variant: "destructive" });
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
  
  const handleRoomImageChange = (roomId: string, imageId: string, newSrc: string) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          images: room.images.map(img => img.id === imageId ? { ...img, src: newSrc } : img)
        }
      }
      return room;
    }));
  };

  const addRoomImage = (roomId: string) => {
     setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newImage = { id: `img-${Date.now()}`, src: '', alt: room.name };
        return {
          ...room,
          images: [...(room.images || []), newImage]
        }
      }
      return room;
    }));
  };
  
  const removeRoomImage = (roomId: string, imageId: string) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          images: room.images.filter(img => img.id !== imageId)
        }
      }
      return room;
    }));
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
        if (room) {
          const { id: roomId, ...roomData } = room;
          await updateRoomDetails(roomId, roomData);
        }
      }
      toast({ title: "Success", description: "Saved successfully!"});
    } catch (error) {
      console.error('Failed to save:', error);
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
       setSavingStates(prev => ({...prev, [id]: false}));
    }
  };

  const handleCreateRoom = async () => {
    setSavingStates(prev => ({...prev, ['new-room']: true}));
    try {
      const newRoomId = await addRoom(defaultRoom);
      setRooms([...rooms, { id: newRoomId, ...defaultRoom }]);
      toast({ title: "Success", description: "New room created. You can now edit it below." });
    } catch(error) {
      console.error('Failed to create room:', error);
      toast({ title: "Error", description: "Failed to create a new room.", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, ['new-room']: false}));
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    setSavingStates(prev => ({...prev, [id]: true}));
    try {
      await deleteRoom(id);
      setRooms(rooms.filter(room => room.id !== id));
      toast({ title: "Success", description: "Room deleted successfully." });
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast({ title: "Error", description: "Failed to delete room.", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, [id]: false}));
    }
  };

  const handleAddGalleryImage = async () => {
    const newImage: Omit<EstablishmentImage, 'id'> = {
      src: '',
      alt: 'Gallery Image',
      'data-ai-hint': 'hotel interior',
    };
     setSavingStates(prev => ({...prev, ['new-gallery-image']: true}));
    try {
        const newId = await addGalleryImage(newImage);
        setGalleryImages([...galleryImages, { ...newImage, id: newId }]);
        toast({ title: "Success", description: "New gallery image added. You can now add the URL and save." });
    } catch (error) {
        console.error('Failed to add gallery image:', error);
        toast({ title: "Error", description: "Failed to add new gallery image.", variant: "destructive" });
    } finally {
        setSavingStates(prev => ({...prev, ['new-gallery-image']: false}));
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (id === 'hero-image') {
        toast({ title: "Error", description: "Cannot delete the main hero image.", variant: "destructive" });
        return;
    }
    if (!confirm('Are you sure you want to delete this gallery image?')) return;
    setSavingStates(prev => ({...prev, [id]: true}));
    try {
      await deleteGalleryImage(id);
      setGalleryImages(galleryImages.filter(img => img.id !== id));
      toast({ title: "Success", description: "Gallery image deleted." });
    } catch (error) {
      console.error('Failed to delete gallery image:', error);
      toast({ title: "Error", description: "Failed to delete gallery image.", variant: "destructive" });
    } finally {
       setSavingStates(prev => ({...prev, [id]: false}));
    }
  }


  if (loading && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
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
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hero Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
              {heroImage && <Image src={heroImage} alt="Hero" width={100} height={60} className="rounded-md object-cover" />}
              <Input value={heroImage} onChange={handleHeroImageChange} placeholder="Enter image URL" />
          </div>
          <Button onClick={() => handleSave('hero', 'hero-image')} disabled={savingStates['hero-image']}>
            {savingStates['hero-image'] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Hero Image
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Our Gallery</CardTitle>
           <Button variant="outline" size="sm" onClick={handleAddGalleryImage} disabled={savingStates['new-gallery-image']}>
                {savingStates['new-gallery-image'] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Add Image
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {galleryImages.filter(img => img.id !== 'hero-image').map(image => (
            <div key={image.id} className="flex items-center gap-4">
              {image.src && <Image src={image.src} alt={image.alt} width={100} height={60} className="rounded-md object-cover" />}
              <Input value={image.src} onChange={(e) => handleGalleryImageChange(image.id, e.target.value)} placeholder="Enter image URL" />
              <Button onClick={() => handleSave('gallery', image.id)} disabled={savingStates[image.id]}>
                {savingStates[image.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDeleteGalleryImage(image.id)} disabled={savingStates[image.id]}>
                 <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rooms</CardTitle>
          <Button variant="outline" onClick={handleCreateRoom} disabled={savingStates['new-room']}>
             {savingStates['new-room'] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :  <PlusCircle className="mr-2 h-4 w-4" />}
             Create New Room
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {rooms.map(room => (
            <div key={room.id} className="border p-4 rounded-lg space-y-4 relative">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-semibold">{room.name}</h3>
                 <Button variant="destructive" onClick={() => handleDeleteRoom(room.id)} disabled={savingStates[room.id]}>
                    {savingStates[room.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :  <Trash2 className="mr-2 h-4 w-4" />}
                    Delete Room
                </Button>
              </div>

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
                        {room.imageUrl && <Image src={room.imageUrl} alt={room.name} width={100} height={60} className="rounded-md object-cover" />}
                        <Input value={room.imageUrl} onChange={e => handleRoomChange(room.id, 'imageUrl', e.target.value)} />
                    </div>
                </div>
                 <div className="md:col-span-2 space-y-3">
                    <label className="font-medium">Room Gallery Images</label>
                    {room.images && room.images.map((img) => (
                        <div key={img.id} className="flex items-center gap-4">
                           {img.src && <Image src={img.src} alt={img.alt} width={100} height={60} className="rounded-md object-cover" />}
                            <Input value={img.src} onChange={(e) => handleRoomImageChange(room.id, img.id, e.target.value)} placeholder="Enter image URL" />
                             <Button variant="ghost" size="icon" onClick={() => removeRoomImage(room.id, img.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                     <Button variant="outline" size="sm" onClick={() => addRoomImage(room.id)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Image
                    </Button>
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
