
'use client';

import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addOrUpdateEstablishmentImage, addOrUpdateRoom, deleteEstablishmentImage, deleteRoom, updateHeroImage, allocateRoom, getBookings as fetchBookings, getRooms, getEstablishmentImages } from "./actions";
import { config as appConfig } from "@/lib/config";
import { type Booking, type Room, type EstablishmentImage } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Loader2, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function AdminDashboard({
    bookings,
    rooms,
    images
}: {
    bookings: Booking[],
    rooms: Room[],
    images: EstablishmentImage[]
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold">Admin Panel</h1>
            <p className="mt-2 text-muted-foreground">
              Manage website content here.
            </p>
          </div>

          <Alert className="mb-8">
              <Info className="h-4 w-4" />
              <AlertTitle>Admin Access</AlertTitle>
              <AlertDescription>
                <p>To access the admin panel, you need to be logged in with an authorized admin account.</p>
                <p className="mt-2">You can create an account through the normal sign-up process. Then, to grant admin privileges, you will need to manually modify the user's record in your authentication provider (e.g., Firebase Authentication) to add a custom claim or role (e.g., `admin: true`).</p>
                <p className="mt-2">The admin URL is <a href="/admin" className="font-bold underline">/admin</a>.</p>
              </AlertDescription>
          </Alert>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Update the main image on the homepage.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateHeroImage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroImageUrl">Hero Image URL</Label>
                    <Input id="heroImageUrl" name="heroImageUrl" placeholder="https://example.com/image.png" defaultValue={appConfig.heroImageUrl} />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>

            <Separator />

            <div>
              <h2 className="font-headline text-3xl font-bold">Booking Management</h2>
              <p className="mt-2 text-muted-foreground">
                View bookings and allocate rooms.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Room No.</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id.slice(-6)}</TableCell>
                        <TableCell>{booking.roomName}</TableCell>
                        <TableCell>{booking.checkIn} to {booking.checkOut}</TableCell>
                        <TableCell>{booking.userId.slice(0,10)}...</TableCell>
                        <TableCell>{booking.status}</TableCell>
                        <TableCell>
                          {booking.allocatedRoomNumber || 'Not set'}
                        </TableCell>
                         <TableCell>
                          <form action={allocateRoom} className="flex gap-2">
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <Input name="allocatedRoomNumber" placeholder="e.g. 101" className="h-8" required/>
                            <Button size="sm" type="submit">Save</Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Separator />

            <div>
              <h2 className="font-headline text-3xl font-bold">Room Management</h2>
              <p className="mt-2 text-muted-foreground">
                Add, edit, or delete rooms.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="add-room">
                <AccordionTrigger>
                    <h3 className="font-headline text-2xl font-bold">Add New Room</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6">
                      <form action={addOrUpdateRoom} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Room Name</Label>
                          <Input id="name" name="name" placeholder="e.g. Deluxe King Room" required/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price per night</Label>
                          <Input id="price" name="price" type="number" placeholder="150" required/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" rows={4} required/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image">Main Image URL</Label>
                          <Input id="image" name="image" required/>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="image1">Image URL 1</Label>
                            <Input id="image1" name="image1" required/>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="image2">Image URL 2</Label>
                            <Input id="image2" name="image2" required/>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="image3">Image URL 3</Label>
                            <Input id="image3" name="image3" required/>
                          </div>
                        </div>
                        <Button type="submit">Add Room</Button>
                      </form>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-8 space-y-6">
              {rooms.map((room) => (
                <Card key={room.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{room.name}</CardTitle>
                      <form action={deleteRoom}>
                        <input type="hidden" name="id" value={room.id} />
                        <Button variant="destructive" size="icon" type="submit">
                           <Trash2 className="h-4 w-4"/>
                           <span className="sr-only">Delete Room</span>
                        </Button>
                      </form>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form action={addOrUpdateRoom} className="space-y-4">
                      <input type="hidden" name="id" value={room.id} />
                      <div className="space-y-2">
                        <Label htmlFor={`name-${room.id}`}>Room Name</Label>
                        <Input id={`name-${room.id}`} name="name" defaultValue={room.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`price-${room.id}`}>Price per night</Label>
                        <Input id={`price-${room.id}`} name="price" type="number" defaultValue={room.price} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${room.id}`}>Description</Label>
                        <Textarea id={`description-${room.id}`} name="description" defaultValue={room.description} rows={4} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`image-${room.id}`}>Main Image URL</Label>
                        <Input id={`image-${room.id}`} name="image" defaultValue={room.image} />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`image1-${room.id}`}>Image URL 1</Label>
                          <Input id={`image1-${room.id}`} name="image1" defaultValue={room.images[0]} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`image2-${room.id}`}>Image URL 2</Label>
                          <Input id={`image2-${room.id}`} name="image2" defaultValue={room.images[1]} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`image3-${room.id}`}>Image URL 3</Label>
                          <Input id={`image3-${room.id}`} name="image3" defaultValue={room.images[2]} />
                        </div>
                      </div>
                      <Button type="submit">Update Room</Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />
            
            <div>
              <h2 className="font-headline text-3xl font-bold">Establishment Gallery</h2>
              <p className="mt-2 text-muted-foreground">
                Manage the images in the homepage gallery.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="add-image">
                <AccordionTrigger>
                  <h3 className="font-headline text-2xl font-bold">Add New Gallery Image</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6">
                      <form action={addOrUpdateEstablishmentImage} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="src">Image URL</Label>
                          <Input id="src" name="src" placeholder="https://example.com/image.png or Google Drive link" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input id="description" name="description" placeholder="e.g. Our main lobby" required />
                        </div>
                        <Button type="submit">Add Image</Button>
                      </form>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-8 space-y-6">
              {images.map((image) => (
                <Card key={image.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Gallery Image</CardTitle>
                      <form action={deleteEstablishmentImage}>
                        <input type="hidden" name="id" value={image.id} />
                        <Button variant="destructive" size="icon" type="submit">
                           <Trash2 className="h-4 w-4"/>
                           <span className="sr-only">Delete Image</span>
                        </Button>
                      </form>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form action={addOrUpdateEstablishmentImage} className="space-y-4">
                      <input type="hidden" name="id" value={image.id} />
                      <div className="space-y-2">
                        <Label htmlFor={`src-${image.id}`}>Image URL</Label>
                        <Input id={`src-${image.id}`} name="src" defaultValue={image.src} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${image.id}`}>Description</Label>
                        <Input id={`description-${image.id}`} name="description" defaultValue={image.description} />
                      </div>
                      <Button type="submit">Update Image</Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>


          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


export default function AdminPage() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [images, setImages] = useState<EstablishmentImage[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
        if (user) {
            const idTokenResult = await user.getIdTokenResult();
            if (idTokenResult.claims.admin) {
                setIsAdmin(true);
                const loadData = async () => {
                    const [bookingsData, roomsData, imagesData] = await Promise.all([
                        fetchBookings(),
                        getRooms(),
                        getEstablishmentImages(),
                    ]);
                    setBookings(bookingsData);
                    setRooms(roomsData);
                    setImages(imagesData);
                }
                loadData();
            } else {
                setIsAdmin(false);
            }
        }
    }
    checkAdminStatus();
  }, [user]);

  if (loading) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-secondary">
          <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
            <div className="text-center">
              <h1 className="font-headline text-4xl font-bold">Admin Panel</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                You must be logged in as an administrator to view this page.
              </p>
                 <Alert className="mt-8 text-left">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Admin Access Information</AlertTitle>
                  <AlertDescription>
                    <p>To gain admin access, please sign up for an account. After signing up, contact the system super-administrator to elevate your account to have admin privileges. This is a manual security step to protect site data.</p>
                  </AlertDescription>
              </Alert>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <AdminDashboard bookings={bookings} rooms={rooms} images={images} />;
}
