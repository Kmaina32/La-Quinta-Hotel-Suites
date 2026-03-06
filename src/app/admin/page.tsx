
'use client';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRooms, getEstablishmentImages, updateHeroImage, updateGalleryImage, updateRoomDetails, addRoom, deleteRoom, uploadImage, getMessages, getAllBookings, getSiteSettings, updateSiteSettings, getAllUsers, getAnalyticsData } from '@/lib/actions';
import type { Room, EstablishmentImage, Message, Booking, SiteSettings, UserData, AnalyticsData } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, Bed, Users, AlertTriangle, Image as ImageIcon, Bath, BedDouble, Layers, Clock, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';

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
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-[2rem] bg-muted/30 h-full w-full">
            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-destructive">{title}</h3>
            <p className="text-muted-foreground mt-2 max-w-md">{message}</p>
        </div>
    );
}

function AdminContent() {
  const [password, setPassword] = useState('');
  const { isAdmin, loginAdmin, logoutAdmin, role } = useAuth();
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
    setFetchErrors({});
    try {
        if (activeTab === 'analytics') {
            const data = await getAnalyticsData();
            setAnalyticsData(data);
            if (!data || data.totalRevenue === 0 && data.totalBookings === 0) {
                setFetchErrors(p => ({...p, analytics: true}));
            }
        }
        if (activeTab === 'rooms') setRooms(await getRooms());
        if (activeTab === 'content') {
            const est = await getEstablishmentImages();
            setGalleryImages(est.galleryImages || []);
            setHeroImage(est.heroImage?.src || '');
        }
        if (activeTab === 'messages') setMessages(await getMessages());
        if (activeTab === 'transactions') setBookings(await getAllBookings());
        if (activeTab === 'settings') setSiteSettings(await getSiteSettings());
        if (activeTab === 'users') {
            const data = await getAllUsers();
            setUsers(data);
            if (!data || data.length === 0) setFetchErrors(p => ({...p, users: true}));
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
      toast({ title: "Login Failed", variant: "destructive" });
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
      } catch (error: any) {
          toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
      } finally {
          setUploadingStates(prev => ({...prev, [uploadId]: false}));
      }
  };
  
  const handleRoomChange = (id: string, field: keyof Room, value: any) => {
    setRooms(rooms.map(room => room.id === id ? { ...room, [field]: value } : room));
  };

  const handleRoomImageChange = (roomId: string, index: number, field: string, value: string) => {
    setRooms(rooms.map(room => {
        if (room.id !== roomId) return room;
        const newImages = [...(room.images || [])];
        newImages[index] = { ...newImages[index], [field]: value };
        return { ...room, images: newImages };
    }));
  };

  const addRoomImage = (roomId: string) => {
    setRooms(rooms.map(room => {
        if (room.id !== roomId) return room;
        return { ...room, images: [...(room.images || []), { id: Date.now().toString(), src: '', alt: room.name }] };
    }));
  };

  const handleSave = async (type: 'hero' | 'gallery' | 'room' | 'settings', id: string) => {
    setSavingStates(prev => ({...prev, [id]: true}));
    try {
      if (type === 'hero') await updateHeroImage(heroImage);
      else if (type === 'room') {
        const room = rooms.find(r => r.id === id);
        if (room) await updateRoomDetails(room.id, room);
      } else if (type === 'settings' && siteSettings) {
        await updateSiteSettings(siteSettings);
      }
      toast({ title: "Saved Successfully" });
    } catch (error) {
      toast({ title: "Save Failed", variant: "destructive" });
    } finally {
       setSavingStates(prev => ({...prev, [id]: false}));
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md shadow-2xl rounded-[2.5rem] border-none bg-muted/50 backdrop-blur-sm">
          <CardHeader className="text-center pt-10">
            <Logo className="h-12 w-48 mx-auto mb-4" />
            <CardTitle className="text-2xl font-black">Admin Gateway</CardTitle>
            <CardDescription>Master Console requires Authorization</CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="h-12 rounded-2xl text-center text-lg tracking-widest" 
              />
              <Button type="submit" className="w-full h-12 rounded-2xl font-black tracking-widest uppercase">Unlock Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-16rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       {activeTab === 'analytics' && (
        <div className="space-y-8">
            {fetchErrors.analytics ? (
                <ErrorDisplay title="Database Offline" message="Connect your FIREBASE_PRIVATE_KEY to view revenue and booking metrics." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="rounded-[2rem] border-none bg-primary/5 p-6">
                        <p className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">Gross Revenue</p>
                        <p className="text-2xl font-black">KES {analyticsData?.totalRevenue.toLocaleString()}</p>
                    </Card>
                    <Card className="rounded-[2rem] border-none bg-blue-500/5 p-6">
                        <p className="text-[10px] font-black uppercase text-blue-600 mb-1 tracking-widest">Total Bookings</p>
                        <p className="text-2xl font-black">{analyticsData?.totalBookings}</p>
                    </Card>
                </div>
            )}
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter">INVENTORY</h2>
                    <p className="text-xs text-muted-foreground">Manage units, pricing and occupancy</p>
                </div>
                <Button onClick={async () => {
                    const id = await addRoom(defaultRoom);
                    setRooms([{id, ...defaultRoom, booked: {}}, ...rooms]);
                }} className="rounded-xl font-black" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> NEW UNIT</Button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {rooms.map(room => (
                    <Card key={room.id} className="rounded-[2.5rem] overflow-hidden shadow-sm border-none bg-muted/20 hover:bg-muted/30 transition-colors">
                        <CardHeader className="bg-muted/30 flex flex-row items-center justify-between p-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm"><Bed className="h-5 w-5 text-primary" /></div>
                                <Input 
                                    value={room.name} 
                                    onChange={(e) => handleRoomChange(room.id, 'name', e.target.value)} 
                                    className="font-black border-none bg-transparent text-lg focus-visible:ring-0 p-0 h-auto w-full" 
                                    readOnly={role === 'manager'}
                                />
                            </div>
                            <Button size="sm" onClick={() => handleSave('room', room.id)} disabled={savingStates[room.id] || role === 'manager'} className="rounded-xl font-black px-6">{savingStates[room.id] ? <Loader2 className="animate-spin h-4 w-4" /> : 'SAVE'}</Button>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase opacity-50 tracking-widest">Description</Label>
                                    <Textarea 
                                        value={room.description} 
                                        onChange={(e) => handleRoomChange(room.id, 'description', e.target.value)} 
                                        className="rounded-2xl min-h-[100px] resize-none" 
                                        readOnly={role === 'manager'}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase opacity-50 tracking-widest">Daily Rate (KES)</Label>
                                        <Input 
                                            type="number" 
                                            value={room.price} 
                                            onChange={(e) => handleRoomChange(room.id, 'price', Number(e.target.value))} 
                                            className="rounded-xl" 
                                            readOnly={role === 'manager'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase opacity-50 tracking-widest">Units</Label>
                                        <Input 
                                            type="number" 
                                            value={room.inventory} 
                                            onChange={(e) => handleRoomChange(room.id, 'inventory', Number(e.target.value))} 
                                            className="rounded-xl" 
                                            readOnly={role === 'manager'}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-50">Capacity</Label><Input type="number" value={room.capacity} onChange={(e) => handleRoomChange(room.id, 'capacity', Number(e.target.value))} className="h-8 rounded-lg" readOnly={role === 'manager'}/></div>
                                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-50">Beds</Label><Input type="number" value={room.beds} onChange={(e) => handleRoomChange(room.id, 'beds', Number(e.target.value))} className="h-8 rounded-lg" readOnly={role === 'manager'}/></div>
                                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-50">Baths</Label><Input type="number" value={room.baths} onChange={(e) => handleRoomChange(room.id, 'baths', Number(e.target.value))} className="h-8 rounded-lg" readOnly={role === 'manager'}/></div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase opacity-50 tracking-widest">Cover Image</Label>
                                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted flex items-center justify-center border-2 border-dashed">
                                        {room.imageUrl ? <Image src={room.imageUrl} alt={room.name} fill className="object-cover" /> : <ImageIcon className="opacity-20" />}
                                        {role !== 'manager' && (
                                            <Input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], `room-main-${room.id}`, url => handleRoomChange(room.id, 'imageUrl', url))} 
                                            />
                                        )}
                                        {uploadingStates[`room-main-${room.id}`] && <div className="absolute inset-0 bg-background/50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                                    </div>
                                    <Input 
                                        value={room.imageUrl} 
                                        onChange={(e) => handleRoomChange(room.id, 'imageUrl', e.target.value)} 
                                        placeholder="Paste image URL" 
                                        className="text-[10px] h-8 rounded-lg mt-2" 
                                        readOnly={role === 'manager'}
                                    />
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
            <h2 className="text-2xl font-black tracking-tighter px-2">DIRECTORY</h2>
            {fetchErrors.users ? (
                <ErrorDisplay title="Access Restricted" message="User management requires a valid FIREBASE_PRIVATE_KEY in your environment variables." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {users.map(user => (
                        <Card key={user.uid} className="rounded-[2rem] p-6 border-none bg-muted/10 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                                    <AvatarImage src={user.photoURL || ''} />
                                    <AvatarFallback className="font-black bg-primary/10 text-primary">{user.displayName?.[0] || user.email?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <p className="font-black text-sm truncate">{user.displayName || 'Anonymous'}</p>
                                    <p className="text-[10px] opacity-50 truncate">{user.email}</p>
                                    <div className="mt-1"><span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">{user.role || 'Guest'}</span></div>
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
