import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateHeroImage } from "./actions";
import { config } from "@/lib/config";

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
        </div>
      </main>
      <Footer />
    </div>
  );
}
