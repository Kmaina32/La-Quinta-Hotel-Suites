'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRooms, getEstablishmentImages, updateHeroImage, updateGalleryImage, updateRoomDetails, addRoom, deleteRoom, addGalleryImage, deleteGalleryImage, uploadImage, getMessages, getAllBookings, cancelBooking, getSiteSettings, updateSiteSettings, getAllUsers, setUserRole, getAnalyticsData } from '@/lib/actions';
import type { Room, EstablishmentImage, Message, Booking, SiteSettings, UserData, UserRole, AnalyticsData } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, Bed, Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, PartyPopper, Download, User, Crown, Shield, Building, AlertTriangle, Mail, Phone, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPoster } from '@/ai/flows/create-poster-flow';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Pie, PieChart, Cell, Legend } from "recharts";

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

function ErrorDisplay({ title, message }: { title: string; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-xl bg-muted/30">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-destructive">{title}</h3>
            <p className="text-muted-foreground mt-2 max-w-md">{message}</p>
        </div>
    );
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isAdmin, loginAdmin, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fetchErrors, setFetchErrors] = useState<Record<string, boolean>>({});
  
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
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';


  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setFetchErrors(prev => ({...prev, [activeTab]: false}));
    
    const handleError = (tabName: string, error: any) => {
        console.error(`Failed to fetch data for ${tabName}:`, error);
        setFetchErrors(prev => ({...prev, [tabName]: true}));
        toast({ title: "Fetch Error", description: `Could not load data for the ${tabName} tab.`, variant: "destructive" });
    };

    try {
        if (activeTab === 'analytics' && (role === 'owner' || role === 'admin')) {
            try {
                const data = await getAnalyticsData();
                setAnalyticsData(data);
                if (!data) setFetchErrors(prev => ({...prev, analytics: true}));
            } catch (e) { handleError('analytics', e); }
        }
        if (activeTab === 'rooms' || activeTab === 'transactions') {
             try {
                const data = await getRooms();
                setRooms(data);
            } catch (e) { handleError('rooms', e); }
        }
        if (activeTab === 'content') {
             try {
                const establishmentData = await getEstablishmentImages();
                if (establishmentData) {
                    const sortedGallery = (establishmentData.galleryImages || []).sort((a: any, b: any) => a.id.localeCompare(b.id));
                    setGalleryImages(sortedGallery);
                    setHeroImage(establishmentData.heroImage?.src || '');
                    const defaultImage = establishmentData.heroImage?.src || establishmentData.galleryImages[0]?.src || '';
                    if(defaultImage && !posterForm.primaryImage) setPosterForm(prev => ({...prev, primaryImage: defaultImage}));
                } else {
                    setFetchErrors(prev => ({...prev, content: true}));
                }
             } catch (e) { handleError('content', e); }
        }
        if (activeTab === 'messages') {
             try {
                const data = await getMessages();
                setMessages(data);
             } catch (e) { handleError('messages', e); }
        }
        if (activeTab === 'transactions') {
             try {
                const data = await getAllBookings();
                setBookings(data);
             } catch (e) { handleError('transactions', e); }
        }
        if (activeTab === 'settings' && role === 'owner') {
             try {
                const data = await getSiteSettings();
                setSiteSettings(data);
                if (!data) setFetchErrors(prev => ({...prev, settings: true}));
             } catch (e) { handleError('settings', e); }
        }
        if (activeTab === 'users' && (role === 'owner' || role === 'admin')) {
             try {
                const data = await getAllUsers();
                setUsers(data);
             } catch (e) { handleError('users', e); }
        }
    } catch (error) {
        console.error("An unexpected error occurred during data fetching:", error);
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
  const handleRoomImageChange = (roomId: string, imageId: string, newSrc: string) => setRooms(rooms.map(room => room.id === roomId ? { ...room, images: (room.images || []).map(img => img.id === imageId ? { ...img, src: newSrc } : img) } : room));
  const addRoomImage = (roomId: string) => setRooms(rooms.map(room => room.id === roomId ? { ...room, images: [...(room.images || []), { id: `img-${Date.now()}`, src: '', alt: room.name }] } : room));
  const removeRoomImage = (roomId: string, imageId: string) => setRooms(rooms.map(room => room.id === roomId ? { ...room, images: (room.images || []).filter(img => img.id !== imageId) } : room));

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
      toast({ title: "Success", description: "New room created." });
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
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setSavingStates(prev => ({...prev, [bookingId]: true}));
    try {
      await cancelBooking(bookingId);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      toast({ title: 'Booking Cancelled' });
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);
      toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, [bookingId]: false}));
    }
  };

   const handleGeneratePoster = async () => {
    if (!posterForm.primaryImage) {
        toast({ title: "Image Required", variant: "destructive" });
        return;
    }
    setPosterGenLoading(true);
    setGeneratedPoster(null);
    try {
      const result = await createPoster(posterForm);
      if(result.posterUrl) {
        setGeneratedPoster(result.posterUrl);
        toast({ title: 'Poster Generated!' });
      } else {
        throw new Error('AI did not return a poster.');
      }
    } catch (error: any) {
      console.error("Poster generation failed:", error);
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
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
      toast({ title: "Role Updated" });
    } catch (error: any) {
      console.error("Failed to set user role:", error);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, [uid]: false}));
    }
  };

  if (loading && !isAdmin) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  if (!isAdmin) {
    return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-10">
        <div className="flex items-center justify-center py-12 px-4 lg:col-span-6">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Admin Login</h1>
              <p className="text-balance text-muted-foreground text-sm">
                Secure access required
              </p>
            </div>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </div>
        </div>
        <div className="hidden bg-muted lg:block lg:col-span-4 p-8">
            <div className="relative flex h-full flex-col rounded-3xl p-10 text-white bg-zinc-900 overflow-hidden shadow-2xl">
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Logo className="h-12 w-48 brightness-200" />
                </div>
                <div className="relative z-20 mt-auto">
                    <p className="text-lg italic opacity-80">
                        &ldquo;Managing luxury with precision.&rdquo;
                    </p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  const getStatusChip = (status: Booking['status'], checkIn: string) => {
    if (status === 'confirmed' && isPast(new Date(checkIn))) {
       return <div className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">Completed</div>;
    }
    switch(status) {
        case 'confirmed': return <div className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-700">Confirmed</div>;
        case 'pending': return <div className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-700">Pending</div>;
        case 'cancelled': return <div className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">Cancelled</div>;
    }
  }

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
        case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
        case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
        case 'manager': return <Building className="h-4 w-4 text-gray-500" />;
        default: return <User className="h-4 w-4 text-muted-foreground" />;
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
    return <div className="flex justify-center items-center h-[calc(100vh-12rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
       {activeTab === 'analytics' && (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsData ? (
                    <>
                        <Card className="shadow-sm border-none bg-primary/5">
                            <CardHeader className="pb-2"><CardDescription className="text-[10px] uppercase font-bold tracking-widest">Total Revenue</CardDescription></CardHeader>
                            <CardContent><p className="text-2xl font-black">KES {analyticsData.totalRevenue.toLocaleString()}</p></CardContent>
                        </Card>
                        <Card className="shadow-sm border-none bg-blue-500/5">
                            <CardHeader className="pb-2"><CardDescription className="text-[10px] uppercase font-bold tracking-widest">Bookings</CardDescription></CardHeader>
                            <CardContent><p className="text-2xl font-black text-blue-600">{analyticsData.totalBookings}</p></CardContent>
                        </Card>
                        <Card className="shadow-sm border-none bg-green-500/5">
                            <CardHeader className="pb-2"><CardDescription className="text-[10px] uppercase font-bold tracking-widest">Occupancy</CardDescription></CardHeader>
                            <CardContent><p className="text-2xl font-black text-green-600">{analyticsData.occupancyRate.toFixed(1)}%</p></CardContent>
                        </Card>
                        <Card className="shadow-sm border-none bg-orange-500/5">
                            <CardHeader className="pb-2"><CardDescription className="text-[10px] uppercase font-bold tracking-widest">Avg Value</CardDescription></CardHeader>
                            <CardContent><p className="text-2xl font-black text-orange-600">KES {(analyticsData.totalRevenue / (analyticsData.totalBookings || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})}</p></CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="col-span-full"><ErrorDisplay title="Analytics Offline" message="Could not load your dashboard metrics." /></div>
                )}
            </div>

            {analyticsData && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-lg">Monthly Performance</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.bookingsPerMonth}>
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-lg">Revenue Mix</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={analyticsData.revenueByRoom} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={5} stroke="none">
                                    {analyticsData.revenueByRoom.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(var(--primary), ${1 - (index / (analyticsData.revenueByRoom.length || 1)) * 0.6})`} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      )}

      {activeTab === 'content' && (
         <div className="space-y-8">
            {fetchErrors.content ? (
                <ErrorDisplay title="Content Offline" message="Establishment data is currently unavailable." />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30"><CardTitle className="text-sm uppercase tracking-tighter font-black">Hero Background</CardTitle></CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {heroImage && <div className="relative aspect-video rounded-xl overflow-hidden shadow-inner bg-muted"><Image src={heroImage} alt="Hero" fill className="object-cover" /></div>}
                                <div className="space-y-2">
                                    <Input type="file" className="text-xs h-8 cursor-pointer" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'hero-upload', url => setHeroImage(url))} />
                                    <Input value={heroImage} className="text-xs h-8" onChange={handleHeroImageChange} placeholder="Or paste image URL" />
                                    <Button size="sm" className="w-full" onClick={() => handleSave('hero', 'hero-image')} disabled={savingStates['hero-image'] || role === 'manager'}>
                                        {savingStates['hero-image'] && <Loader2 className="mr-2 h-3 w-3 animate-spin" />} Update Hero
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-primary/20 bg-primary/5">
                            <CardHeader><CardTitle className="text-sm uppercase tracking-tighter font-black flex items-center gap-2"><PartyPopper className="h-4 w-4 text-primary"/> AI Designer</CardTitle></CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold opacity-60">Poster Title</Label>
                                    <Input value={posterForm.title} className="text-xs h-8" onChange={e => handlePosterFormChange('title', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold opacity-60">Primary Image</Label>
                                    <Select value={posterForm.primaryImage} onValueChange={value => handlePosterFormChange('primaryImage', value)}>
                                        <SelectTrigger className="text-xs h-8">
                                            <SelectValue placeholder="Select from library" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {allImages.map(image => (
                                                <SelectItem key={image.id} value={image.src} className="text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Image src={image.src} alt="lib" width={24} height={16} className="rounded-sm object-cover" />
                                                        <span className="truncate w-32">{image.alt}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button size="sm" className="w-full font-black text-xs h-9" onClick={handleGeneratePoster} disabled={posterGenLoading || role === 'manager'}>
                                    {posterGenLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <PlusCircle className="mr-2 h-3 w-3" />}
                                    GENERATE POSTER
                                </Button>
                                {generatedPoster && (
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border mt-4">
                                        <Image src={generatedPoster} alt="Gen" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button size="icon" variant="secondary" className="rounded-full" asChild><a href={generatedPoster} download="poster.png"><Download className="h-4 w-4" /></a></Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-8">
                        <Card className="shadow-sm border-none bg-muted/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm uppercase tracking-tighter font-black">Photo Library</CardTitle>
                                <Button variant="outline" size="xs" className="h-7 text-[10px] uppercase font-bold" onClick={handleAddGalleryImage} disabled={savingStates['new-gallery-image'] || role === 'manager'}>
                                    <PlusCircle className="mr-1.5 h-3 w-3" /> Add Image
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {galleryImages.map(image => (
                                        <Card key={image.id} className="shadow-none border p-2 space-y-2 bg-background">
                                            <div className="relative aspect-video rounded-lg overflow-hidden shadow-inner">
                                                {image.src ? <Image src={image.src} alt={image.alt} fill className="object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground uppercase font-bold">No Image</div>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Input value={image.src} className="text-[10px] h-7" onChange={e => handleGalleryImageChange(image.id, e.target.value)} placeholder="Image URL" />
                                                <div className="flex gap-1">
                                                    <Button size="icon" className="h-7 w-7" onClick={() => handleSave('gallery', image.id)} disabled={savingStates[image.id] || role === 'manager'}>
                                                        {savingStates[image.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                                    </Button>
                                                    <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteGalleryImage(image.id)} disabled={savingStates[image.id] || role === 'manager'}><Trash2 className="h-3 w-3" /></Button>
                                                    <div className="flex-1">
                                                        <Input type="file" className="text-[8px] h-7 px-1 py-0 cursor-pointer" onChange={e => e.target.files && handleFileUpload(e.target.files[0], `gallery-${image.id}`, url => handleGalleryImageChange(image.id, url))} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
         </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Rooms & Facilities</h2>
                    <p className="text-xs text-muted-foreground">Manage your inventory and pricing</p>
                </div>
                <Button size="sm" onClick={handleCreateRoom} disabled={savingStates['new-room'] || role === 'manager'} className="font-black text-xs">
                    <PlusCircle className="mr-2 h-4 w-4" /> CREATE NEW UNIT
                </Button>
            </div>
            {fetchErrors.rooms ? (
                <ErrorDisplay title="Rooms Unavailable" message="Could not retrieve unit data." />
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {rooms.map(room => (
                        <Card key={room.id} className="shadow-sm border-muted/50 overflow-hidden">
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-48 relative h-48 md:h-auto bg-muted">
                                    {room.imageUrl ? <Image src={room.imageUrl} alt={room.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold uppercase opacity-30">No Image</div>}
                                </div>
                                <div className="flex-1 p-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <Input value={room.name} className="h-8 font-black text-lg border-none p-0 focus-visible:ring-0" onChange={(e) => handleRoomChange(room.id, 'name', e.target.value)} readOnly={role === 'manager'} />
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5"><Bed className="h-3 w-3" /> {room.type || 'room'}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRoom(room.id)} disabled={savingStates[room.id] || role === 'manager'}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] uppercase font-black opacity-50">Price (KES)</Label>
                                            <Input type="number" className="h-8 text-xs font-bold" value={room.price} onChange={(e) => handleRoomChange(room.id, 'price', Number(e.target.value))} readOnly={role === 'manager'} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] uppercase font-black opacity-50">Inventory</Label>
                                            <Input type="number" className="h-8 text-xs font-bold" value={room.inventory} onChange={(e) => handleRoomChange(room.id, 'inventory', Number(e.target.value))} readOnly={role === 'manager'} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button size="xs" className="h-8 flex-1 text-[10px] uppercase font-black" onClick={() => handleSave('room', room.id)} disabled={savingStates[room.id] || role === 'manager'}>
                                            {savingStates[room.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Changes'}
                                        </Button>
                                        <Button variant="outline" size="xs" className="h-8 text-[10px] uppercase font-black" onClick={() => router.push(`/rooms/${room.id}`)}>View Site</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tighter">Reservations</h2>
                <p className="text-xs text-muted-foreground">Monitor and manage guest bookings</p>
            </div>
            {fetchErrors.transactions ? (
                <ErrorDisplay title="Reservations Offline" message="Booking data could not be retrieved." />
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <Card key={booking.id} className={cn("shadow-sm border-none bg-muted/30 p-4 transition-all hover:bg-muted/50", booking.status === 'cancelled' && 'opacity-50 grayscale')}>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                <div className="md:col-span-3 space-y-1">
                                    <p className="font-black text-sm uppercase tracking-tight truncate">{booking.roomName}</p>
                                    <div className="flex items-center gap-2">{getStatusChip(booking.status, booking.checkIn)}</div>
                                </div>
                                <div className="md:col-span-3 space-y-0.5">
                                    <p className="text-xs font-bold truncate opacity-80">{booking.userEmail}</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd, yy')}</p>
                                </div>
                                <div className="md:col-span-2 space-y-0.5 text-center md:text-left">
                                    <p className="text-xs font-black">KES {booking.totalCost.toLocaleString()}</p>
                                    <p className="text-[9px] uppercase font-bold opacity-50">{booking.paymentMethod}</p>
                                </div>
                                <div className="md:col-span-2 text-center md:text-left">
                                    <p className="text-[10px] uppercase font-black opacity-40">Booked {formatDistanceToNow(new Date(booking.bookedOn), { addSuffix: true })}</p>
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    {booking.status !== 'cancelled' && !isPast(new Date(booking.checkIn)) && (role === 'owner' || role === 'admin') && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleCancelBooking(booking.id)} disabled={savingStates[booking.id]}><XCircle className="h-4 w-4" /></Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tighter">User Directory</h2>
                <p className="text-xs text-muted-foreground">Manage permissions and roles</p>
            </div>
            {fetchErrors.users ? (
                <ErrorDisplay title="Directory Unavailable" message="Admin privileges required to view users." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map(user => (
                        <Card key={user.uid} className="shadow-sm p-4 hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border shadow-inner">
                                    <AvatarImage src={user.photoURL || undefined} />
                                    <AvatarFallback className="bg-muted text-muted-foreground font-black text-xs">{user.displayName?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm truncate flex items-center gap-1.5">{getRoleIcon(user.role)} {user.displayName || 'Unnamed User'}</p>
                                    <p className="text-xs text-muted-foreground truncate font-bold opacity-60">{user.email}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                {role === 'owner' ? (
                                    <Select value={user.role || 'none'} onValueChange={(val: any) => handleSetUserRole(user.uid, val)} disabled={savingStates[user.uid]}>
                                        <SelectTrigger className="h-7 text-[10px] w-24 uppercase font-black"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" className="text-[10px] font-bold">User</SelectItem>
                                            <SelectItem value="manager" className="text-[10px] font-bold">Manager</SelectItem>
                                            <SelectItem value="admin" className="text-[10px] font-bold">Admin</SelectItem>
                                            <SelectItem value="owner" className="text-[10px] font-bold">Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="text-[10px] uppercase font-black opacity-40">{user.role || 'user'}</span>
                                )}
                                <div className="text-right text-[9px] uppercase font-bold text-muted-foreground opacity-50">
                                    {user.metadata.lastSignInTime ? `Seen ${formatDistanceToNow(new Date(user.metadata.lastSignInTime), {addSuffix: true})}` : 'Never active'}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      )}
      
      {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tighter">Inquiries</h2>
                <p className="text-xs text-muted-foreground">Direct messages from potential guests</p>
            </div>
            {fetchErrors.messages ? (
                <ErrorDisplay title="Messaging Error" message="Inquiry database is offline." />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {messages.map(message => (
                        <Card key={message.id} className="shadow-sm p-4 space-y-3 bg-background border-muted hover:border-blue-500/30 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                    <p className="font-black text-sm uppercase">{message.name}</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                                        <p className="text-[10px] font-bold opacity-60 flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {message.email}</p>
                                        {message.phone && <p className="text-[10px] font-bold opacity-60 flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {message.phone}</p>}
                                    </div>
                                </div>
                                <p className="text-[9px] uppercase font-black opacity-30 whitespace-nowrap">{format(new Date(message.sentAt), 'MMM dd, h:mm a')}</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-xl">
                                <p className="text-xs leading-relaxed font-bold opacity-80">{message.message}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
          </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md space-y-6">
            <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tighter">General Settings</h2>
                <p className="text-xs text-muted-foreground">Global configuration for your hotel</p>
            </div>
            {fetchErrors.settings ? (
                <ErrorDisplay title="Settings Locked" message="System configuration is currently inaccessible." />
            ) : siteSettings && (
                <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30"><CardTitle className="text-xs uppercase font-black">Visual Identity</CardTitle></CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">Active Seasonal Theme</Label>
                            <Select value={siteSettings.activeTheme} onValueChange={(theme) => setSiteSettings(prev => prev ? { ...prev, activeTheme: theme as 'default' | 'christmas' } : null)}>
                                <SelectTrigger className="h-9 font-bold text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default" className="text-xs font-bold">Standard Elegance</SelectItem>
                                    <SelectItem value="christmas" className="text-xs font-bold">Christmas Special</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button size="sm" className="w-full font-black text-xs h-9" onClick={() => handleSave('settings', 'site-settings')} disabled={savingStates['site-settings'] || role !== 'owner'}>
                            {savingStates['site-settings'] && <Loader2 className="mr-2 h-3 w-3 animate-spin" />} APPLY SITE SETTINGS
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
      )}
    </div>
  );
}
