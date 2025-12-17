
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the history, mission, and team behind La Quita Hotel & suits.',
};

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Jane Doe',
      role: 'General Manager',
      imageUrl: 'https://picsum.photos/seed/teammember1/400/400',
      bio: 'With over 20 years of experience in hospitality, Jane ensures every guest has an unforgettable stay.',
    },
    {
      name: 'John Smith',
      role: 'Head Chef',
      imageUrl: 'https://picsum.photos/seed/teammember2/400/400',
      bio: 'John crafts our delicious menus, blending local flavors with international cuisine to delight your palate.',
    },
    {
      name: 'Emily White',
      role: 'Head of Guest Relations',
      imageUrl: 'https://picsum.photos/seed/teammember3/400/400',
      bio: 'Emily and her team are dedicated to providing personalized service and making you feel at home.',
    },
  ];

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">About La Quita</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Discover the story behind Nakuru's premier destination for luxury and comfort.
        </p>
      </div>

      {/* Our Story Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="https://picsum.photos/seed/about-story/800/600"
            alt="La Quita Hotel view"
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint="hotel architecture"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded in 2020, La Quita Hotel & suits was born from a vision to create a sanctuary of luxury and tranquility in the heart of Nakuru. Our journey began with a simple goal: to offer a unique blend of modern elegance and warm Kenyan hospitality.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From the architectural design that reflects the beauty of the surrounding landscape to the meticulously curated interiors, every detail at La Quita has been thoughtfully considered to provide our guests with an unparalleled experience.
          </p>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-24 bg-secondary p-12 rounded-2xl">
         <div className="space-y-4 md:order-2">
          <h2 className="text-3xl font-semibold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our mission is to be more than just a place to stay. We aspire to be a destination where memories are made, where our guests can unwind, connect, and be inspired.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We are committed to delivering exceptional service, providing luxurious comfort, and creating authentic experiences that celebrate the rich culture and natural beauty of Kenya. Your comfort is our commitment.
          </p>
        </div>
        <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-lg md:order-1">
          <Image
            src="https://picsum.photos/seed/about-mission/800/600"
            alt="Hotel Lobby"
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint="hotel lobby"
          />
        </div>
      </div>
      
      {/* Meet the Team Section */}
      <section id="team" className="text-center">
        <h2 className="text-3xl font-bold mb-8">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.name} className="overflow-hidden text-center hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative h-64 w-full">
                    <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        data-ai-hint="professional headshot"
                    />
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
