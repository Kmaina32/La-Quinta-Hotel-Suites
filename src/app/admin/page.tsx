import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateHeroImage, updateRoom } from "./actions";
import { config } from "@/lib/config";
import { rooms } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
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
                    <Input id="heroImageUrl" name="heroImageUrl" placeholder="https://example.com/image.png" defaultValue={config.heroImageUrl} />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>

            <Separator />

            <div>
              <h2 className="font-headline text-3xl font-bold">Room Management</h2>
              <p className="mt-2 text-muted-foreground">
                Update the details for each room.
              </p>
            </div>

            {rooms.map((room) => (
              <Card key={room.id}>
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={updateRoom} className="space-y-4">
                    <input type="hidden" name="id" value={room.id} />
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
