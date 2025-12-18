
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';

// Even though this is a client component for the map, we can export metadata
// export const metadata: Metadata = {
//   title: 'About Us | La Quita',
//   description: 'Learn about the history, mission, and team behind La Quita Hotel & suites.',
// };

export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">About La Quita</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Discover the story behind Nakuru's premier destination for luxury and comfort.
        </p>
      </div>

      {/* Our Story & Mission Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded in 2020, La Quita Hotel & suites was born from a vision to create a sanctuary of luxury and tranquility in the heart of Nakuru. Our journey began with a simple goal: to offer a unique blend of modern elegance and warm Kenyan hospitality.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From the architectural design that reflects the beauty of the surrounding landscape to the meticulously curated interiors, every detail at La Quita has been thoughtfully considered to provide our guests with an unparalleled experience.
          </p>
        </div>
         <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our mission is to be more than just a place to stay. We aspire to be a destination where memories are made, where our guests can unwind, connect, and be inspired.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We are committed to delivering exceptional service, providing luxurious comfort, and creating authentic experiences that celebrate the rich culture and natural beauty of Kenya. Your comfort is our commitment.
          </p>
        </div>
      </div>
      
       {/* Location Section */}
      <section id="location" className="mb-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Location</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-lg h-96">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.24584285573!2d36.131977840134!3d-0.3293699996720208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182977000adf0c13%3A0x7a5f35c4157e80ee!2sLa%20Quita%20Hotel%20and%20Suites!5e0!3m2!1sen!2ske!4v1716892558509!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
             <div className="flex flex-col justify-center space-y-6">
                <a href="https://maps.app.goo.gl/mpzfqvHyTpLaD7UQ6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-primary transition-colors">
                    <MapPin className="h-8 w-8 text-primary" />
                    <span className="text-lg">Elementaita road, Nakuru, Kenya</span>
                </a>
                <a href="mailto:contact@laquita.com" className="flex items-center gap-4 hover:text-primary transition-colors">
                    <Mail className="h-8 w-8 text-primary" />
                    <span className="text-lg">contact@laquita.com</span>
                </a>
                <a href="tel:0759713882" className="flex items-center gap-4 hover:text-primary transition-colors">
                    <Phone className="h-8 w-8 text-primary" />
                    <span className="text-lg">0759713882</span>
                </a>
            </div>
        </div>
      </section>
    </div>
  );
}
