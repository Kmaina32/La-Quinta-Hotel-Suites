
'use client';

import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ContactSection() {
    return (
        <section className="bg-background py-16">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Get In Touch</h2>
                    <p className="text-muted-foreground mt-2">
                        We're here to help. Contact us with any questions or for booking inquiries.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                             <h3 className="text-2xl font-semibold mb-4">Contact Information</h3>
                             <ul className="space-y-4 text-muted-foreground">
                                <li>
                                    <a href="https://maps.app.goo.gl/mpzfqvHyTpLaD7UQ6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-primary transition-colors">
                                        <MapPin className="h-6 w-6 text-primary" />
                                        <span>Elementaita road, Nakuru, Kenya</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:contact@laquita.com" className="flex items-center gap-4 hover:text-primary transition-colors">
                                        <Mail className="h-6 w-6 text-primary" />
                                        <span>contact@laquita.com</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:0759713882" className="flex items-center gap-4 hover:text-primary transition-colors">
                                        <Phone className="h-6 w-6 text-primary" />
                                        <span>Reception: 0759713882</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://wa.me/254710147434" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-primary transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle text-primary"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                                        <span>WhatsApp: 0710147434</span>
                                    </a>
                                </li>
                             </ul>
                        </div>
                        <div>
                             <h3 className="text-2xl font-semibold mb-4">Follow Us</h3>
                            <div className="flex space-x-2">
                                <Button size="icon" variant="outline" asChild>
                                    <Link href="#" aria-label="Facebook">
                                    <Facebook size={20} />
                                    </Link>
                                </Button>
                                <Button size="icon" variant="outline" asChild>
                                    <Link href="#" aria-label="Instagram">
                                    <Instagram size={20} />
                                    </Link>
                                </Button>
                                <Button size="icon" variant="outline" asChild>
                                    <Link href="#" aria-label="Twitter">
                                    <Twitter size={20} />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Message Us Form - will be built in a future step */}
                     <div>
                        <h3 className="text-2xl font-semibold mb-4">Message Us</h3>
                        <p className="text-muted-foreground">
                            The messaging form will be implemented soon to allow you to send messages directly to our admin team.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
