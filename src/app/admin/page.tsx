
'use client';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRooms, getEstablishmentImages, updateHeroImage, updateGalleryImage, updateRoomDetails, addRoom, deleteRoom, addGalleryImage, deleteGalleryImage, uploadImage, getMessages, getAllBookings, cancelBooking, getSiteSettings, updateSiteSettings, getAllUsers, setUserRole, getAnalyticsData } from '@/lib/actions';
import type { Room, EstablishmentImage, Message, Booking, SiteSettings, UserData, UserRole, AnalyticsData } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, Bed, Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, AlertTriangle, Mail, Phone, DollarSign, Image as ImageIcon, Bath, BedDouble, Info, Layers } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Pie, PieChart, Cell, Legend } from "recharts";
import { formatDistanceToNow } from 'date-fns';

const defaultRoom: Omit<Room, 'id' | 'booked'> = {
  name: 'New Room',
  description: '',
  price: 100,
  halfDayPrice: 60,
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
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-[2rem] bg-muted/30">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-destructive">{title}</h3>
            <p className="text-muted-foreground mt-2 max-w-md">{message}</p>
        </div>
    );
}

function AdminContent() {
  const [password, setPassword] = useState('');
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
    
    try {
        if (activeTab === 'analytics') {
            const data = await getAnalyticsData();
            setAnalyticsData(data);
        }
        if (activeTab === 'rooms') {
            const data = await getRooms();
            setRooms(data);
        }
        if (activeTab === 'content') {
            const establishmentData = await getEstablishmentImages();
            setGalleryImages(establishmentData.galleryImages || []);
            setHeroImage(establishmentData.heroImage?.src || '');
        }
        if (activeTab === 'messages') {
            const data = await getMessages();
            setMessages(data);
        }
        if (activeTab === 'transactions') {
            const data = await getAllBookings();
            setBookings(data);
        }
        if (activeTab === 'settings') {
            const data = await getSiteSettings();
            setSiteSettings(data);
        }
        if (activeTab === 'users') {
            const data = await getAllUsers();
            if (data.length > 0) setUsers(data);
            else setFetchErrors(prev => ({...prev, users: true}));
        }
    } catch (error) {
        setFetchErrors(prev => ({...prev, [activeTab]: true}));
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
      setUploadingStates(prev => ({...prev, [uploadId]: true}));
      try {
          const formData = new FormData();
          formData.append('file', file);
          const imageUrl = await uploadImage(formData);
          onUploadComplete(imageUrl);
          toast({ title: "Upload Successful" });
      } catch (error) {
          toast({ title: "Upload Failed", variant: "destructive" });
      } finally {
          setUploadingStates(prev => ({...prev, [uploadId]: false}));
      }
  };
  
  const handleRoomChange = (id: string, field: keyof Room, value: any) => setRooms(rooms.map(room => room.id === id ? { ...room, [field]: value } : room));

  const handleRoomImageChange = (roomId: string, index: number, field: string, value: string) => {
    setRooms(rooms.map(room => {
        if (room.id !== roomId) return room;
        const newImages = [...room.images];
        newImages[index] = { ...newImages[index], [field]: value };
        return { ...room, images: newImages };
    }));
  };

  const addRoomImage = (roomId: string) => {
    setRooms(rooms.map(room => {
        if (room.id !== roomId) return room;
        return { 
            ...room, 
            images: [...(room.images || []), { id: Date.now().toString(), src: '', alt: room.name + ' detail' }] 
        };
    }));
  };

  const removeRoomImage = (roomId: string, index: number) => {
    setRooms(rooms.map(room => {
        if (room.id !== roomId) return room;
        const newImages = [...room.images];
        newImages.splice(index, 1);
        return { ...room, images: newImages };
    }));
  };

  const handleSave = async (type: 'hero' | 'gallery' | 'room' | 'settings', id: string) => {
    setSavingStates(prev => ({...prev, [id]: true}));
    try {
      if (type === 'hero') await updateHeroImage(heroImage);
      else if (type === 'gallery') {
        const image = galleryImages.find(img => img.id === id);
        if (image) await updateGalleryImage(id, image.src);
      } else if (type === 'room') {
        const room = rooms.find(r => r.id === id);
        if (room) await updateRoomDetails(room.id, room);
      } else if (type === 'settings') {
        if (siteSettings) await updateSiteSettings(siteSettings);
      }
      toast({ title: "Success", description: "Saved successfully!"});
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
       setSavingStates(prev => ({...prev, [id]: false}));
    }
  };

  const handleCreateRoom = async () => {
    setSavingStates(prev => ({...prev, ['new-room']: true}));
    try {
      const newRoomId = await addRoom(defaultRoom);
      setRooms([...rooms, { id: newRoomId, ...defaultRoom, booked: {} }]);
      toast({ title: "Success" });
    } catch(error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSavingStates(prev => ({...prev, ['new-room']: false}));
    }
  };

  if (loading && !isAdmin) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  if (!isAdmin) {
    return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-10 bg-background">
        <div className="flex items-center justify-center py-12 px-4 lg:col-span-6">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Admin Login</h1>
              <p className="text-muted-foreground text-sm">Secure access required</p>
            </div>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </div>
        </div>
        <div className="hidden bg-muted lg:block lg:col-span-4 p-8">
            <div className="relative flex h-full flex-col rounded-[3rem] p-10 text-white bg-zinc-900 overflow-hidden shadow-2xl">
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Logo className="h-12 w-48 brightness-200" />
                </div>
                <div className="relative z-20 mt-auto">
                    <p className="text-lg italic opacity-80">&ldquo;Managing luxury with precision.&rdquo;</p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-12rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       {activeTab === 'analytics' && (
        <div className="space-y-8">
            {fetchErrors.analytics ? (
                <ErrorDisplay title="Analytics Offline" message="Connect your Firebase project to view live performance data." />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="shadow-sm border-none bg-primary/5 rounded-[2rem]">
                            <CardHeader className="pb-2"><CardDescription className="text-[10px] uppercase font-black tracking-widest">Total Revenue</CardDescription></CardHeader>
                            <CardContent><p className="text-2xl font-black">KES {analyticsData?.totalRevenue.toLocaleString() || '0'}</p></CardContent>
                        </Card>
                        <Card className="shadow-sm border-none bg-blue-500/5 rounded-[2rem]">
                            <CardHeader className="pb-2"><CardDescription className="text-[10px] uppercase font-black tracking-widest">Bookings</CardDescription></CardHeader>
                            <CardContent><p className="text-2xl font-black text-blue-600">{analyticsData?.totalBookings || '0'}</p></CardContent>
                        </Card>
                        <Card className="shadow-sm border-none bg-green-500/5 rounded-[2rem]">
                            <CardHeader className="pb-2"><CardDescription className="text-[10px] uppercase font-black tracking-widest">Occupancy</CardDescription></CardHeader>
                            <CardContent><p className="text-2xl font-black text-green-600">{analyticsData?.occupancyRate.toFixed(1) || '0'}%</p></CardContent>
                        </Card>
                        <Card className="shadow-sm border-none bg-orange-500/5 rounded-[2rem]">
                            <CardHeader className="pb-2"><CardDescription className="text-[10px] uppercase font-black tracking-widest">Avg Value</CardDescription></CardHeader>
                            <CardContent><p className="text-2xl font-black text-orange-600">KES {Math.round((analyticsData?.totalRevenue || 0) / (analyticsData?.totalBookings || 1)).toLocaleString()}</p></CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card className="shadow-sm rounded-[2rem]">
                            <CardHeader><CardTitle className="text-lg">Monthly Performance</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analyticsData?.bookingsPerMonth || []}>
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                        <RechartsTooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm rounded-[2rem]">
                            <CardHeader><CardTitle className="text-lg">Revenue Mix</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={analyticsData?.revenueByRoom || []} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={5} stroke="none">
                                            {analyticsData?.revenueByRoom.map((_, i) => <Cell key={i} fill={`hsl(var(--primary), ${1 - (i / 10) * 0.6})`} />)}
                                        </Pie>
                                        <RechartsTooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                                        <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
      )}

      {activeTab === 'content' && (
         <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-sm rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-muted/30"><CardTitle className="text-sm uppercase font-black">Hero Media</CardTitle></CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {heroImage && <div className="relative aspect-video rounded-3xl overflow-hidden bg-muted shadow-inner"><Image src={heroImage} alt="Hero" fill className="object-cover" /></div>}
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input type="file" className="text-xs h-9 cursor-pointer rounded-xl" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'hero', url => setHeroImage(url))} />
                                    {uploadingStates['hero'] && <Loader2 className="h-5 w-5 animate-spin" />}
                                </div>
                                <Input value={heroImage} className="text-xs h-9 rounded-xl" onChange={e => setHeroImage(e.target.value)} placeholder="Image URL" />
                                <Button size="sm" className="w-full rounded-xl font-black" onClick={() => handleSave('hero', 'hero-image')} disabled={savingStates['hero-image'] || role === 'manager'}>
                                    UPDATE HERO
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    <Card className="shadow-sm border-none bg-muted/20 rounded-[2.5rem]">
                        <CardHeader className="flex flex-row items-center justify-between p-8">
                            <CardTitle className="text-sm uppercase font-black">Gallery Library</CardTitle>
                            <Button variant="outline" size="sm" className="rounded-xl font-black h-9" onClick={() => {}} disabled={role === 'manager'}>
                                <PlusCircle className="mr-2 h-4 w-4" /> ADD MEDIA
                            </Button>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {galleryImages.map(img => (
                                    <Card key={img.id} className="shadow-none border rounded-3xl p-2 bg-background group">
                                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                                            <Image src={img.src} alt={img.alt} fill className="object-cover" />
                                        </div>
                                        <div className="flex gap-1 mt-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                            <Input value={img.src} className="h-8 text-[10px] rounded-lg" readOnly />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
         </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tighter">UNITS & INVENTORY</h2>
                    <p className="text-xs text-muted-foreground uppercase font-bold opacity-60">Manage pricing and availability</p>
                </div>
                <Button size="sm" onClick={handleCreateRoom} disabled={savingStates['new-room'] || role === 'manager'} className="font-black rounded-xl">
                    <PlusCircle className="mr-2 h-4 w-4" /> NEW UNIT
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-8">
                {rooms.map(room => (
                    <Card key={room.id} className="shadow-sm rounded-[2rem] overflow-hidden border-none bg-muted/10 group hover:bg-muted/20 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 px-8 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    {room.type === 'conference' ? <Layers className="h-6 w-6" /> : <Bed className="h-6 w-6" />}
                                </div>
                                <div>
                                    <Input 
                                        value={room.name} 
                                        className="h-7 text-xl font-black bg-transparent border-none p-0 focus-visible:ring-0 shadow-none w-auto min-w-[200px]" 
                                        onChange={(e) => handleRoomChange(room.id, 'name', e.target.value)} 
                                        readOnly={role === 'manager'} 
                                    />
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{room.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl font-black h-9 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => deleteRoom(room.id)} disabled={role === 'manager'}>
                                    <Trash2 className="h-4 w-4 mr-2" /> DELETE
                                </Button>
                                <Button size="sm" className="rounded-xl font-black h-9 shadow-lg shadow-primary/20" onClick={() => handleSave('room', room.id)} disabled={savingStates[room.id] || role === 'manager'}>
                                    {savingStates[room.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SAVE CHANGES'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Room Category</Label>
                                        <Select value={room.type} onValueChange={(val: any) => handleRoomChange(room.id, 'type', val)} disabled={role === 'manager'}>
                                            <SelectTrigger className="rounded-xl font-bold border-muted-foreground/20">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="room">Standard Room/Suite</SelectItem>
                                                <SelectItem value="conference">Conference Facility</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Description</Label>
                                        <Textarea 
                                            value={room.description} 
                                            className="rounded-2xl border-muted-foreground/20 min-h-[120px] font-medium leading-relaxed" 
                                            onChange={(e) => handleRoomChange(room.id, 'description', e.target.value)} 
                                            readOnly={role === 'manager'}
                                            placeholder="Describe the unit's features and amenities..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Base Price (KES)</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="number" className="pl-9 rounded-xl font-bold border-muted-foreground/20" value={room.price} onChange={(e) => handleRoomChange(room.id, 'price', Number(e.target.value))} readOnly={role === 'manager'} />
                                            </div>
                                        </div>
                                        {room.type === 'conference' && (
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Half Day Price (KES)</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input type="number" className="pl-9 rounded-xl font-bold border-muted-foreground/20" value={room.halfDayPrice || 0} onChange={(e) => handleRoomChange(room.id, 'halfDayPrice', Number(e.target.value))} readOnly={role === 'manager'} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 flex items-center gap-1.5"><Users className="h-3 w-3" /> Max Capacity</Label>
                                            <Input type="number" className="rounded-xl font-bold border-muted-foreground/20" value={room.capacity} onChange={(e) => handleRoomChange(room.id, 'capacity', Number(e.target.value))} readOnly={role === 'manager'} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 flex items-center gap-1.5"><Layers className="h-3 w-3" /> Total Units</Label>
                                            <Input type="number" className="rounded-xl font-bold border-muted-foreground/20" value={room.inventory} onChange={(e) => handleRoomChange(room.id, 'inventory', Number(e.target.value))} readOnly={role === 'manager'} />
                                        </div>
                                    </div>

                                    {room.type !== 'conference' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 flex items-center gap-1.5"><BedDouble className="h-3 w-3" /> Beds</Label>
                                                <Input type="number" className="rounded-xl font-bold border-muted-foreground/20" value={room.beds} onChange={(e) => handleRoomChange(room.id, 'beds', Number(e.target.value))} readOnly={role === 'manager'} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 flex items-center gap-1.5"><Bath className="h-3 w-3" /> Baths</Label>
                                                <Input type="number" className="rounded-xl font-bold border-muted-foreground/20" value={room.baths} onChange={(e) => handleRoomChange(room.id, 'baths', Number(e.target.value))} readOnly={role === 'manager'} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 block">Main Unit Image</Label>
                                        <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-muted group/img">
                                            {room.imageUrl ? (
                                                <Image src={room.imageUrl} alt={room.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon className="h-12 w-12" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-4">
                                                <Input 
                                                    type="file" 
                                                    className="hidden" 
                                                    id={`file-main-${room.id}`} 
                                                    onChange={e => e.target.files && handleFileUpload(e.target.files[0], `room-main-${room.id}`, url => handleRoomChange(room.id, 'imageUrl', url))} 
                                                />
                                                <Button variant="secondary" size="sm" className="rounded-xl font-black" onClick={() => document.getElementById(`file-main-${room.id}`)?.click()}>
                                                    UPLOAD NEW
                                                </Button>
                                            </div>
                                        </div>
                                        <Input value={room.imageUrl} className="h-8 text-[10px] rounded-lg border-muted-foreground/20" placeholder="Or paste image URL" onChange={(e) => handleRoomChange(room.id, 'imageUrl', e.target.value)} readOnly={role === 'manager'} />
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Detail Library</Label>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black uppercase text-primary hover:bg-primary/5" onClick={() => addRoomImage(room.id)} disabled={role === 'manager'}>
                                            <PlusCircle className="h-3 w-3 mr-1" /> ADD PHOTO
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 h-[300px] overflow-y-auto no-scrollbar pr-2">
                                        {room.images?.map((img, idx) => (
                                            <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden bg-muted group/item border border-muted-foreground/10">
                                                <Image src={img.src || 'https://picsum.photos/seed/placeholder/200/200'} alt={img.alt} fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                                                    <Button size="icon" variant="destructive" className="h-6 w-6 rounded-lg ml-auto" onClick={() => removeRoomImage(room.id, idx)} disabled={role === 'manager'}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                    <div className="space-y-1">
                                                        <Input 
                                                            type="file" 
                                                            className="hidden" 
                                                            id={`file-detail-${room.id}-${idx}`} 
                                                            onChange={e => e.target.files && handleFileUpload(e.target.files[0], `room-detail-${room.id}-${idx}`, url => handleRoomImageChange(room.id, idx, 'src', url))} 
                                                        />
                                                        <Button size="sm" className="w-full h-6 text-[9px] font-black rounded-lg" onClick={() => document.getElementById(`file-detail-${room.id}-${idx}`)?.click()}>UPLOAD</Button>
                                                        <Input value={img.src} className="h-5 text-[8px] bg-white/20 border-none text-white placeholder:text-white/50 rounded-md" placeholder="URL" onChange={(e) => handleRoomImageChange(room.id, idx, 'src', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
            <div className="space-y-1 px-2">
                <h2 className="text-2xl font-black tracking-tighter">TEAM DIRECTORY</h2>
                <p className="text-xs text-muted-foreground uppercase font-bold opacity-60">Manage permissions and access levels</p>
            </div>
            {fetchErrors.users ? (
                <ErrorDisplay title="Access Restricted" message="User management requires a properly configured FIREBASE_PRIVATE_KEY." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map(user => (
                        <Card key={user.uid} className="shadow-sm rounded-[2rem] p-6 hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                                    <AvatarImage src={user.photoURL || undefined} />
                                    <AvatarFallback className="bg-muted text-muted-foreground font-black">{user.displayName?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm truncate flex items-center gap-1.5">{user.displayName || 'Unnamed'}</p>
                                    <p className="text-xs text-muted-foreground truncate font-bold opacity-60">{user.email}</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t flex items-center justify-between">
                                <span className="text-[10px] uppercase font-black px-3 py-1 bg-muted rounded-full">{user.role || 'user'}</span>
                                <div className="text-right text-[9px] uppercase font-bold text-muted-foreground opacity-50">
                                    Seen {user.metadata.lastSignInTime ? formatDistanceToNow(new Date(user.metadata.lastSignInTime), {addSuffix: true}) : 'Never'}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <AdminContent />
        </Suspense>
    )
}
