
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRooms, getEstablishmentImages, updateHeroImage, updateGalleryImage, updateRoomDetails, addRoom, deleteRoom, addGalleryImage, deleteGalleryImage, uploadImage, getMessages, getAllBookings, cancelBooking, getSiteSettings, updateSiteSettings } from '@/lib/actions';
import type { Room, EstablishmentImage, Message, Booking, SiteSettings } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, Bed, Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const defaultRoom: Omit<Room, 'id' | 'booked'> = {
  name: 'New Room',
  description: '',
  price: 100,
  capacity: 2,
  beds: 1,
  baths: 1,
  imageUrl: '',
  images: [],
  type: 'room',
  inventory: 1,
};


export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [galleryImages, setGalleryImages] = useState<EstablishmentImage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [heroImage, setHeroImage] = useState('');
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast()

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'content';


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
      const [roomsData, establishmentData, messagesData, bookingsData, settingsData] = await Promise.all([
        getRooms(),
        getEstablishmentImages(),
        getMessages(),
        getAllBookings(),
        getSiteSettings(),
      ]);
      setRooms(roomsData);
      setMessages(messagesData);
      setBookings(bookingsData);
      setSiteSettings(settingsData);
      const sortedGallery = establishmentData.galleryImages.sort((a, b) => a.id.localeCompare(b.id));
      setGalleryImages(sortedGallery);
      setHeroImage(establishmentData.heroImage?.src || '');
    } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({ title: "Error", description: "Failed to fetch admin data.", variant: "destructive" });
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
      // Force re-render of header
      router.replace(pathname + '?' + searchParams.toString());
    } else {
      toast({ title: "Login Failed", description: "Incorrect password", variant: "destructive" });
    }
  };

  const handleFileUpload = async (file: File, uploadId: string, onUploadComplete: (url: string) => void) => {
      if (!file) {
          toast({ title: "Upload Error", description: "Please select a file to upload.", variant: "destructive" });
          return;
      }
      setUploadingStates(prev => ({...prev, [uploadId]: true}));
      try {
          const formData = new FormData();
          formData.append('file', file);
          const imageUrl = await uploadImage(formData);
          onUploadComplete(imageUrl);
          toast({ title: "Upload Successful", description: "Image is ready to be saved." });
      } catch (error) {
          console.error('File upload failed:', error);
          toast({ title: "Upload Failed", description: "Could not upload the image.", variant: "destructive" });
      } finally {
          setUploadingStates(prev => ({...prev, [uploadId]: false}));
      }
  };
  
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => setHeroImage(e.target.value);
  const handleGalleryImageChange = (id: string, newSrc: string) => setGalleryImages(galleryImages.map(img => img.id === id ? { ...img, src: newSrc } : img));
  const handleRoomChange = (id: string, field: keyof Room, value: any) => setRooms(rooms.map(room => room.id === id ? { ...room, [field]: value } : room));
  const handleRoomImageChange = (roomId: string, imageId: string, newSrc: string) => setRooms(rooms.map(room => room.id === roomId ? { ...room, images: room.images.map(img => img.id === imageId ? { ...img, src: newSrc } : img) } : room));
  const addRoomImage = (roomId: string) => setRooms(rooms.map(room => room.id === roomId ? { ...room, images: [...(room.images || []), { id: `img-${Date.now()}`, src: '', alt: room.name }] } : room));
  const removeRoomImage = (roomId: string, imageId: string) => setRooms(rooms.map(room => room.id === roomId ? { ...room, images: room.images.filter(img => img.id !== imageId) } : room));

  const handleSave = async (type: 'hero' | 'gallery' | 'room' | 'settings', id: string) => {
    setSavingStates(prev => ({...prev, [id]: true}));
    try {
      if (type === 'hero') await updateHeroImage(heroImage);
      else if (type === 'gallery') {
        const image = galleryImages.find(img => img.id === id);
        if (image) await updateGalleryImage(id, image.src);
      } else if (type === 'room') {
        const room = rooms.find(r => r.id === id);
        if (room) {
            const { id: roomId, ...roomData } = room;
            await updateRoomDetails(roomId, roomData);
        }
      } else if (type === 'settings') {
        if (siteSettings) {
            await updateSiteSettings(siteSettings);
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
      setRooms([...rooms, { id: newRoomId, ...defaultRoom, booked: {} }]);
      toast({ title: "Success", description: "New room created. You can now edit it below." });
    } catch(error) {
      console.error('Failed to create room:', error);
      toast({ title: "Error", description: "Failed to create a new room.", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, ['new-room']: false}));
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    setSavingStates(prev => ({...prev, [id]: true}));
    try {
      await deleteRoom(id);
      setRooms(rooms.filter(room => room.id !== id));
      toast({ title: "Success", description: "Room deleted." });
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast({ title: "Error", description: "Failed to delete room.", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, [id]: false}));
    }
  };

  const handleAddGalleryImage = async () => {
    const newImage: Omit<EstablishmentImage, 'id'> = { src: '', alt: 'Gallery Image', 'data-ai-hint': 'hotel interior' };
    setSavingStates(prev => ({...prev, ['new-gallery-image']: true}));
    try {
        const newId = await addGalleryImage(newImage);
        setGalleryImages([...galleryImages, { ...newImage, id: newId }]);
        toast({ title: "Success", description: "New gallery image added." });
    } catch (error) {
        console.error('Failed to add gallery image:', error);
        toast({ title: "Error", description: "Failed to add new gallery image.", variant: "destructive" });
    } finally {
        setSavingStates(prev => ({...prev, ['new-gallery-image']: false}));
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (id === 'hero-image') return;
    if (!confirm('Are you sure?')) return;
    setSavingStates(prev => ({...prev, [id]: true}));
    try {
      await deleteGalleryImage(id);
      setGalleryImages(galleryImages.filter(img => img.id !== id));
      toast({ title: "Success", description: "Gallery image deleted." });
    } catch (error) {
      console.error('Failed to delete gallery image:', error);
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    } finally {
       setSavingStates(prev => ({...prev, [id]: false}));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    setSavingStates(prev => ({...prev, [bookingId]: true}));
    try {
      await cancelBooking(bookingId);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      toast({ title: 'Booking Cancelled', description: 'The booking has been successfully cancelled.' });
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);
      toast({ title: "Error", description: error.message || "Failed to cancel booking.", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, [bookingId]: false}));
    }
  };

  if (loading && !isAuthenticated) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle className="text-center">Admin Login</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAvailabilityForBooking = (booking: Booking): number => {
    const room = rooms.find(r => r.id === booking.roomId);
    if (!room) return 0;
    const checkInDate = format(new Date(booking.checkIn), 'yyyy-MM-dd');
    const bookedCount = room.booked?.[checkInDate] || 0;
    return room.inventory - bookedCount;
  }

  const getStatusChip = (status: Booking['status']) => {
    switch(status) {
        case 'confirmed':
            return <div className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1"/>Confirmed</div>;
        case 'pending':
            return <div className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1"/>Pending</div>;
        case 'cancelled':
            return <div className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1"/>Cancelled</div>;
    }
  }

  return (
    <div className="container mx-auto py-8">
      {activeTab === 'content' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader><CardTitle>Hero Image</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                    {heroImage && <Image src={heroImage} alt="Hero Preview" width={200} height={120} className="rounded-md object-cover" />}
                    <div className="flex items-center gap-2">
                        <Input type="file" className="max-w-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'hero-upload', url => setHeroImage(url))} />
                        {uploadingStates['hero-upload'] && <Loader2 className="h-5 w-5 animate-spin" />}
                    </div>
                    <Input value={heroImage} onChange={handleHeroImageChange} placeholder="Or paste image URL" />
                    <Button onClick={() => handleSave('hero', 'hero-image')} disabled={savingStates['hero-image'] || uploadingStates['hero-upload']}>
                        {savingStates['hero-image'] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Hero
                    </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Our Gallery</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleAddGalleryImage} disabled={savingStates['new-gallery-image']}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Image
                    </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {galleryImages.map(image => (
                        <div key={image.id} className="space-y-2 border-t pt-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                {image.src && <Image src={image.src} alt={image.alt} width={150} height={90} className="rounded-md object-cover" />}
                                <div className="space-y-2">
                                     <Input value={image.src} onChange={e => handleGalleryImageChange(image.id, e.target.value)} placeholder="Paste image URL" />
                                     <div className="flex items-center gap-2">
                                        <Input type="file" className="max-w-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], `gallery-${image.id}`, url => handleGalleryImageChange(image.id, url))} />
                                        {uploadingStates[`gallery-${image.id}`] && <Loader2 className="h-5 w-5 animate-spin" />}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Button size="sm" onClick={() => handleSave('gallery', image.id)} disabled={savingStates[image.id] || uploadingStates[`gallery-${image.id}`]}>
                                {savingStates[image.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDeleteGalleryImage(image.id)} disabled={savingStates[image.id]}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Rooms & Facilities</CardTitle>
              <Button variant="outline" onClick={handleCreateRoom} disabled={savingStates['new-room']}><PlusCircle className="mr-2 h-4 w-4" />Create New</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {rooms.map(room => (
                <Card key={room.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRoom(room.id)} disabled={savingStates[room.id]}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1"><label className="text-sm font-medium">Name</label><Input value={room.name} onChange={e => handleRoomChange(room.id, 'name', e.target.value)} /></div>
                    <div className="space-y-1"><label className="text-sm font-medium">Price</label><Input type="number" value={room.price} onChange={e => handleRoomChange(room.id, 'price', Number(e.target.value))} /></div>
                    <div className="space-y-1"><label className="text-sm font-medium">Type</label>
                      <Select value={room.type || 'room'} onValueChange={(value: 'room' | 'conference') => handleRoomChange(room.id, 'type', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="room">Room</SelectItem><SelectItem value="conference">Conference</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><label className="text-sm font-medium">Capacity</label><Input type="number" value={room.capacity} onChange={e => handleRoomChange(room.id, 'capacity', Number(e.target.value))} /></div>
                     <div className="space-y-1"><label className="text-sm font-medium">Inventory</label><Input type="number" value={room.inventory} onChange={e => handleRoomChange(room.id, 'inventory', Number(e.target.value))} /></div>
                    {room.type !== 'conference' && <>
                      <div className="space-y-1"><label className="text-sm font-medium">Beds</label><Input type="number" value={room.beds} onChange={e => handleRoomChange(room.id, 'beds', Number(e.target.value))} /></div>
                      <div className="space-y-1"><label className="text-sm font-medium">Baths</label><Input type="number" value={room.baths} onChange={e => handleRoomChange(room.id, 'baths', Number(e.target.value))} /></div>
                    </>}
                    <div className="md:col-span-3 space-y-1"><label className="text-sm font-medium">Description</label><Input value={room.description} onChange={e => handleRoomChange(room.id, 'description', e.target.value)} /></div>
                    <div className="md:col-span-3 space-y-3">
                      <label className="text-sm font-medium">Main Image</label>
                      {room.imageUrl && <Image src={room.imageUrl} alt={room.name} width={150} height={90} className="rounded-md object-cover" />}
                      <div className="flex items-center gap-2">
                        <Input type="file" className="max-w-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], `room-main-${room.id}`, url => handleRoomChange(room.id, 'imageUrl', url))} />
                        {uploadingStates[`room-main-${room.id}`] && <Loader2 className="h-5 w-5 animate-spin" />}
                      </div>
                      <Input value={room.imageUrl} onChange={e => handleRoomChange(room.id, 'imageUrl', e.target.value)} placeholder="Or paste URL" />
                    </div>
                    <div className="md:col-span-3 space-y-3">
                      <div className="flex justify-between items-center"><label className="text-sm font-medium">Detail Images</label><Button variant="outline" size="sm" onClick={() => addRoomImage(room.id)}><PlusCircle className="mr-2 h-4 w-4" />Add</Button></div>
                      {room.images?.map((img) => (
                        <div key={img.id} className="border-t pt-3 space-y-2">
                          {img.src && <Image src={img.src} alt={img.alt} width={150} height={90} className="rounded-md object-cover" />}
                          <div className="flex items-center gap-2">
                              <Input type="file" className="max-w-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], `room-detail-${img.id}`, url => handleRoomImageChange(room.id, img.id, url))} />
                              {uploadingStates[`room-detail-${img.id}`] && <Loader2 className="h-5 w-5 animate-spin" />}
                              <Button variant="ghost" size="icon" onClick={() => removeRoomImage(room.id, img.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                          <Input value={img.src} onChange={e => handleRoomImageChange(room.id, img.id, e.target.value)} placeholder="Or paste image URL" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => handleSave('room', room.id)} disabled={savingStates[room.id]}>{savingStates[room.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Room'} </Button>
                </Card>
              ))}
            </CardContent>
          </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
                <CardDescription>View and manage all reservations and payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {bookings.length === 0 && <p className="text-muted-foreground text-center py-8">No bookings yet.</p>}
                {bookings.map(booking => {
                    const availability = getAvailabilityForBooking(booking);
                    return (
                        <Card key={booking.id} className={cn("p-4 transition-colors", booking.status === 'cancelled' && 'bg-muted/50')}>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl">{booking.roomName}</CardTitle>
                                        {getStatusChip(booking.status)}
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground">Guest: {booking.userEmail}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/><span>{format(new Date(booking.checkIn), 'PP')} to {format(new Date(booking.checkOut), 'PP')}</span></div>
                                        <div className="flex items-center gap-2"><Users className="h-4 w-4"/><span>{booking.nights} night(s)</span></div>
                                    </div>
                                    <p className="text-sm">Booked {formatDistanceToNow(new Date(booking.bookedOn), { addSuffix: true })}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="font-semibold">Total Cost: KES {booking.totalCost.toFixed(2)}</div>
                                    <div className="text-muted-foreground">Payment: {booking.paymentMethod}</div>
                                    <div className="flex items-center gap-2">
                                        <Bed className="h-4 w-4"/>
                                        <span>Rooms available: {availability}</span>
                                    </div>
                                    {booking.status !== 'cancelled' && (
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            className="w-full mt-2" 
                                            onClick={() => handleCancelBooking(booking.id)}
                                            disabled={savingStates[booking.id]}
                                        >
                                          {savingStates[booking.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                                          Cancel Booking
                                        </Button>
                                    )}
                                </div>
                           </div>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
      )}
      
      {activeTab === 'messages' && (
          <Card>
            <CardHeader><CardTitle>Guest Messages</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
              {messages.map(message => (
                  <Card key={message.id} className="p-4">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="font-semibold">{message.name} <span className="text-sm font-normal text-muted-foreground">&lt;{message.email}&gt;</span></p>
                              {message.phone && <p className="text-sm text-muted-foreground">{message.phone}</p>}
                              <p className="text-xs text-muted-foreground">{format(new Date(message.sentAt), 'PPp')}</p>
                          </div>
                      </div>
                      <p className="mt-2 text-muted-foreground">{message.message}</p>
                  </Card>
              ))}
            </CardContent>
          </Card>
      )}

      {activeTab === 'settings' && siteSettings && (
        <Card>
            <CardHeader><CardTitle>Site Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Active Theme</label>
                    <Select 
                        value={siteSettings.activeTheme} 
                        onValueChange={(theme) => setSiteSettings(prev => prev ? { ...prev, activeTheme: theme as 'default' | 'christmas' } : null)}
                    >
                        <SelectTrigger className="max-w-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="christmas">Christmas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => handleSave('settings', 'site-settings')} disabled={savingStates['site-settings']}>
                    {savingStates['site-settings'] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Settings
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

