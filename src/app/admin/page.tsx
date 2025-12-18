
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRooms, getEstablishmentImages, updateHeroImage, updateGalleryImage, updateRoomDetails, addRoom, deleteRoom, addGalleryImage, deleteGalleryImage, uploadImage, getMessages, getAllBookings, cancelBooking, getSiteSettings, updateSiteSettings, getAllUsers, setUserRole, getAnalyticsData } from '@/lib/actions';
import type { Room, EstablishmentImage, Message, Booking, SiteSettings, UserData, UserRole, AnalyticsData } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, Bed, Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, PartyPopper, Download, Upload, User, LogOut, Eye, EyeOff, ShieldCheck, Crown, Shield, Building } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createPoster } from '@/ai/flows/create-poster-flow';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell, Legend } from "recharts";

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
  const [showPassword, setShowPassword] = useState(false);
  const { isAdmin, loginAdmin, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [galleryImages, setGalleryImages] = useState<EstablishmentImage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [heroImage, setHeroImage] = useState('');
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});
  const [posterGenLoading, setPosterGenLoading] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
  const [posterForm, setPosterForm] = useState({
    title: 'Weekend Getaway',
    subtitle: 'Special Offer',
    occasionDate: '',
    primaryImage: '',
    extraDetails: 'Pool, Spa, Free Wi-Fi',
  });
  
  const { toast } = useToast()

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';


  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, activeTab]); // re-fetch if tab changes

  const fetchData = async () => {
    setLoading(true);
    try {
        const promises: Promise<any>[] = [];
        if (activeTab === 'analytics' && (role === 'owner' || role === 'admin')) promises.push(getAnalyticsData());
        if (activeTab === 'rooms' || activeTab === 'transactions') promises.push(getRooms());
        if (activeTab === 'content') promises.push(getEstablishmentImages());
        if (activeTab === 'messages') promises.push(getMessages());
        if (activeTab === 'transactions') promises.push(getAllBookings());
        if (activeTab === 'settings' && role === 'owner') promises.push(getSiteSettings());
        if (activeTab === 'users' && (role === 'owner' || role === 'admin')) promises.push(getAllUsers());
        
        const results = await Promise.all(promises);
        let resultIndex = 0;

        if (activeTab === 'analytics' && (role === 'owner' || role === 'admin')) setAnalyticsData(results[resultIndex++]);
        if (activeTab === 'rooms' || activeTab === 'transactions') setRooms(results[resultIndex++]);
        if (activeTab === 'content') {
            const establishmentData = results[resultIndex++];
            const sortedGallery = establishmentData.galleryImages.sort((a, b) => a.id.localeCompare(b.id));
            setGalleryImages(sortedGallery);
            setHeroImage(establishmentData.heroImage?.src || '');
            const defaultImage = establishmentData.heroImage?.src || establishmentData.galleryImages[0]?.src || '';
            if(defaultImage && !posterForm.primaryImage) setPosterForm(prev => ({...prev, primaryImage: defaultImage}));
        }
        if (activeTab === 'messages') setMessages(results[resultIndex++]);
        if (activeTab === 'transactions') setBookings(results[resultIndex++]);
        if (activeTab === 'settings' && role === 'owner') setSiteSettings(results[resultIndex++]);
        if (activeTab === 'users' && (role === 'owner' || role === 'admin')) setUsers(results[resultIndex++]);
        
    } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({ title: "Error", description: "Failed to fetch admin data for this tab.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '38448674') {
      loginAdmin();
      router.refresh();
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

   const handleGeneratePoster = async () => {
    if (!posterForm.primaryImage) {
        toast({ title: "Image Required", description: "Please select or upload a primary image for the poster.", variant: "destructive" });
        return;
    }
    setPosterGenLoading(true);
    setGeneratedPoster(null);
    try {
      const result = await createPoster(posterForm);
      if(result.posterUrl) {
        setGeneratedPoster(result.posterUrl);
        toast({ title: 'Poster Generated!', description: 'Your new poster is ready.' });
      } else {
        throw new Error('AI did not return a poster. Please try again.');
      }
    } catch (error: any) {
      console.error("Poster generation failed:", error);
      toast({ title: "Generation Failed", description: error.message || "Could not generate the poster.", variant: "destructive" });
    } finally {
      setPosterGenLoading(false);
    }
  };
  
  const handlePosterFormChange = (field: keyof typeof posterForm, value: string) => {
    setPosterForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSetUserRole = async (uid: string, newRole: UserRole | 'none') => {
    setSavingStates(prev => ({...prev, [uid]: true}));
    try {
      await setUserRole(uid, newRole === 'none' ? null : newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole === 'none' ? undefined : newRole } : u));
      toast({ title: "Role Updated", description: "User role has been changed." });
    } catch (error: any) {
      console.error("Failed to set user role:", error);
      toast({ title: "Error", description: error.message || "Could not set user role.", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, [uid]: false}));
    }
  };

  if (loading && !isAdmin) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;

  if (!isAdmin) {
    return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
        <div className="flex items-center justify-center py-12 px-4">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Admin Login</h1>
              <p className="text-balance text-muted-foreground">
                Enter your password to access the control panel
              </p>
            </div>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input 
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <ShieldCheck className="mr-2 h-4 w-4" /> Secure Login
              </Button>
            </form>
          </div>
        </div>
        <div className="hidden bg-muted lg:block p-8">
            <div className="relative flex h-full flex-col rounded-2xl p-10 text-white bg-zinc-900">
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Logo className="h-12 w-48" />
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                    <p className="text-lg">
                        &ldquo;This control panel gives us the power to shape our guest's experience in real-time. It's an indispensable tool for managing our hotel with precision and care.&rdquo;
                    </p>
                    <footer className="text-sm">Hotel Management</footer>
                    </blockquote>
                </div>
            </div>
        </div>
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

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
        case 'owner': return <Crown className="h-5 w-5 text-yellow-500" />;
        case 'admin': return <Shield className="h-5 w-5 text-blue-500" />;
        case 'manager': return <Building className="h-5 w-5 text-gray-500" />;
        default: return <User className="h-5 w-5 text-muted-foreground" />;
    }
  }
  
  const allImages = [
    { id: 'hero', src: heroImage, alt: 'Hero Image' },
    ...galleryImages,
    ...rooms.flatMap(r => ([
        {id: `room-main-${r.id}`, src: r.imageUrl, alt: r.name},
        ...(r.images || []).map(img => ({...img, alt: `${r.name} detail`}))
    ]))
  ].filter(img => img.src);


  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-8">
       {activeTab === 'analytics' && (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Analytics Dashboard</CardTitle></CardHeader>
                <CardContent>
                    {analyticsData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
                                <CardContent><p className="text-3xl font-bold">KES {analyticsData.totalRevenue.toLocaleString()}</p></CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Total Bookings</CardTitle></CardHeader>
                                <CardContent><p className="text-3xl font-bold">{analyticsData.totalBookings}</p></CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Occupancy Rate (30d)</CardTitle></CardHeader>
                                <CardContent><p className="text-3xl font-bold">{analyticsData.occupancyRate.toFixed(1)}%</p></CardContent>
                            </Card>
                        </div>
                    ) : (
                        <p>No analytics data available.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Bookings per Month (Last 12 Months)</CardTitle></CardHeader>
                    <CardContent>
                        {analyticsData && (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.bookingsPerMonth}>
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Revenue by Room</CardTitle></CardHeader>
                    <CardContent>
                        {analyticsData && analyticsData.revenueByRoom.length > 0 && (
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={analyticsData.revenueByRoom} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                       {analyticsData.revenueByRoom.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={`hsl(var(--primary), ${1 - (index / analyticsData.revenueByRoom.length) * 0.5})`} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
      {activeTab === 'content' && (
         <div className="space-y-6">
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
                      <Button onClick={() => handleSave('hero', 'hero-image')} disabled={savingStates['hero-image'] || uploadingStates['hero-upload'] || role === 'manager'}>
                          {savingStates['hero-image'] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Hero
                      </Button>
                      </CardContent>
                  </Card>
              </div>
              <div className="lg:col-span-2">
                  <Card>
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Our Gallery</CardTitle>
                      <Button variant="outline" size="sm" onClick={handleAddGalleryImage} disabled={savingStates['new-gallery-image'] || role === 'manager'}>
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
                                  <Button size="sm" onClick={() => handleSave('gallery', image.id)} disabled={savingStates[image.id] || uploadingStates[`gallery-${image.id}`] || role === 'manager'}>
                                  {savingStates[image.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
                                  </Button>
                                  <Button variant="destructive" size="icon" onClick={() => handleDeleteGalleryImage(image.id)} disabled={savingStates[image.id] || role === 'manager'}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                          </div>
                      ))}
                      </CardContent>
                  </Card>
              </div>
          </div>
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PartyPopper className="h-6 w-6 text-primary"/> AI Poster Generator</CardTitle>
                <CardDescription>Create promotional posters for events and offers using AI.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="poster-title">Title</Label>
                        <Input id="poster-title" value={posterForm.title} onChange={e => handlePosterFormChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="poster-subtitle">Subtitle</Label>
                        <Input id="poster-subtitle" value={posterForm.subtitle} onChange={e => handlePosterFormChange('subtitle', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="poster-date">Occasion Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="poster-date"
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !posterForm.occasionDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {posterForm.occasionDate ? format(new Date(posterForm.occasionDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={posterForm.occasionDate ? new Date(posterForm.occasionDate) : undefined}
                                onSelect={(date) => handlePosterFormChange('occasionDate', date?.toISOString() || '')}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="poster-details">Extra Details / Amenities</Label>
                        <Textarea id="poster-details" placeholder="e.g. Live Music, Buffet, Free Entry" value={posterForm.extraDetails} onChange={e => handlePosterFormChange('extraDetails', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Primary Image</Label>
                        <Select value={posterForm.primaryImage} onValueChange={value => handlePosterFormChange('primaryImage', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an image" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {allImages.map(image => (
                                    <SelectItem key={image.id} value={image.src}>
                                        <div className="flex items-center gap-2">
                                            <Image src={image.src} alt={image.alt} width={40} height={30} className="rounded-sm object-cover" />
                                            <span className="truncate">{image.alt}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">OR</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input id="poster-upload" type="file" className="max-w-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'poster-image-upload', url => handlePosterFormChange('primaryImage', url))} />
                            {uploadingStates['poster-image-upload'] && <Loader2 className="h-5 w-5 animate-spin" />}
                        </div>
                         {posterForm.primaryImage && <Image src={posterForm.primaryImage} alt="Selected preview" width={150} height={100} className="rounded-md object-cover mt-2" />}
                    </div>
                    <Button size="lg" className="w-full" onClick={handleGeneratePoster} disabled={posterGenLoading || uploadingStates['poster-image-upload']}>
                        {posterGenLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PartyPopper className="mr-2 h-4 w-4" />}
                        Generate Poster
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/50 min-h-[400px] p-4">
                    {posterGenLoading && <div className="flex flex-col items-center gap-2 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /><p>Generating your poster...</p></div>}
                    {!posterGenLoading && generatedPoster && (
                      <div className="w-full flex-grow flex flex-col items-center justify-center">
                          <div className="relative w-full flex-grow mb-4">
                            <Image src={generatedPoster} alt="Generated Poster" fill className="object-contain" />
                          </div>
                           <Button asChild className="w-full">
                            <a href={generatedPoster} download={`la_quita_poster_${Date.now()}.png`}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Poster
                            </a>
                        </Button>
                      </div>
                    )}
                     {!posterGenLoading && !generatedPoster && <p className="text-muted-foreground text-center p-4">Your generated poster will appear here.</p>}
                </div>
            </CardContent>
         </Card>
        </div>
      )}

      {activeTab === 'rooms' && (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Rooms & Facilities</CardTitle>
              <Button variant="outline" onClick={handleCreateRoom} disabled={savingStates['new-room'] || role === 'manager'}><PlusCircle className="mr-2 h-4 w-4" />Create New</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {rooms.map(room => (
                <Card key={room.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRoom(room.id)} disabled={savingStates[room.id] || role === 'manager'}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1"><label className="text-sm font-medium">Name</label><Input value={room.name} onChange={e => handleRoomChange(room.id, 'name', e.target.value)} readOnly={role === 'manager'} /></div>
                    <div className="space-y-1"><label className="text-sm font-medium">Price</label><Input type="number" value={room.price} onChange={e => handleRoomChange(room.id, 'price', Number(e.target.value))} readOnly={role === 'manager'} /></div>
                    <div className="space-y-1"><label className="text-sm font-medium">Type</label>
                      <Select value={room.type || 'room'} onValueChange={(value: 'room' | 'conference') => handleRoomChange(room.id, 'type', value)} disabled={role === 'manager'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="room">Room</SelectItem><SelectItem value="conference">Conference</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><label className="text-sm font-medium">Capacity</label><Input type="number" value={room.capacity} onChange={e => handleRoomChange(room.id, 'capacity', Number(e.target.value))} readOnly={role === 'manager'} /></div>
                     <div className="space-y-1"><label className="text-sm font-medium">Inventory</label><Input type="number" value={room.inventory} onChange={e => handleRoomChange(room.id, 'inventory', Number(e.target.value))} readOnly={role === 'manager'} /></div>
                    {room.type !== 'conference' && <>
                      <div className="space-y-1"><label className="text-sm font-medium">Beds</label><Input type="number" value={room.beds} onChange={e => handleRoomChange(room.id, 'beds', Number(e.target.value))} readOnly={role === 'manager'} /></div>
                      <div className="space-y-1"><label className="text-sm font-medium">Baths</label><Input type="number" value={room.baths} onChange={e => handleRoomChange(room.id, 'baths', Number(e.target.value))} readOnly={role === 'manager'} /></div>
                    </>}
                    <div className="md:col-span-3 space-y-1"><label className="text-sm font-medium">Description</label><Input value={room.description} onChange={e => handleRoomChange(room.id, 'description', e.target.value)} readOnly={role === 'manager'} /></div>
                    <div className="md:col-span-3 space-y-3">
                      <label className="text-sm font-medium">Main Image</label>
                      {room.imageUrl && <Image src={room.imageUrl} alt={room.name} width={150} height={90} className="rounded-md object-cover" />}
                       <div className={cn("items-center gap-2", role !== 'manager' ? 'flex' : 'hidden')}>
                        <Input type="file" className="max-w-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], `room-main-${room.id}`, url => handleRoomChange(room.id, 'imageUrl', url))} />
                        {uploadingStates[`room-main-${room.id}`] && <Loader2 className="h-5 w-5 animate-spin" />}
                      </div>
                      <Input value={room.imageUrl} onChange={e => handleRoomChange(room.id, 'imageUrl', e.target.value)} placeholder="Or paste URL" readOnly={role === 'manager'}/>
                    </div>
                    <div className="md:col-span-3 space-y-3">
                      <div className="flex justify-between items-center"><label className="text-sm font-medium">Detail Images</label>
                        {role !== 'manager' && <Button variant="outline" size="sm" onClick={() => addRoomImage(room.id)}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>}
                      </div>
                      {room.images?.map((img) => (
                        <div key={img.id} className="border-t pt-3 space-y-2">
                          {img.src && <Image src={img.src} alt={img.alt} width={150} height={90} className="rounded-md object-cover" />}
                          <div className={cn("items-center gap-2", role !== 'manager' ? 'flex' : 'hidden')}>
                              <Input type="file" className="max-w-xs" onChange={e => e.target.files && handleFileUpload(e.target.files[0], `room-detail-${img.id}`, url => handleRoomImageChange(room.id, img.id, url))} />
                              {uploadingStates[`room-detail-${img.id}`] && <Loader2 className="h-5 w-5 animate-spin" />}
                              <Button variant="ghost" size="icon" onClick={() => removeRoomImage(room.id, img.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                          <Input value={img.src} onChange={e => handleRoomImageChange(room.id, img.id, e.target.value)} placeholder="Or paste image URL" readOnly={role === 'manager'} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => handleSave('room', room.id)} disabled={savingStates[room.id] || role === 'manager'}>{savingStates[room.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Room'} </Button>
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
                                    {booking.status !== 'cancelled' && (role === 'owner' || role === 'admin') && (
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

      {activeTab === 'users' && (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Assign roles to users. Only owners can change roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {users.length === 0 && <p className="text-muted-foreground text-center py-8">No users found.</p>}
                {users.map(user => (
                    <Card key={user.uid} className="p-4">
                       <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                <AvatarFallback>{user.displayName ? user.displayName[0].toUpperCase() : <User className="h-6 w-6" />}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <p className="font-semibold flex items-center gap-2">{getRoleIcon(user.role)} {user.displayName || 'No Name'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            {role === 'owner' ? (
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={user.role || 'none'}
                                        onValueChange={(newRole: UserRole | 'none') => handleSetUserRole(user.uid, newRole)}
                                        disabled={savingStates[user.uid]}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="owner">Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {savingStates[user.uid] && <Loader2 className="h-5 w-5 animate-spin" />}
                                </div>
                            ) : (
                                 user.role && <p className="capitalize font-semibold">{user.role}</p>
                            )}
                            <div className="text-right text-sm text-muted-foreground hidden md:block">
                                <p>Last signed in:</p>
                                <p>{user.metadata.lastSignInTime ? formatDistanceToNow(new Date(user.metadata.lastSignInTime), {addSuffix: true}) : 'Never'}</p>
                            </div>
                       </div>
                    </Card>
                ))}
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
