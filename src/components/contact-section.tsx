
'use client';

import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ContactSection() {
    return (
        <section className="p-2 md:p-3">
             <div className="container mx-auto px-4 py-8 bg-secondary text-secondary-foreground rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
                    {/* Contact Us */}
                    <div className="md:flex md:justify-end">
                        <div className="space-y-4">
                             <h3 className="text-xl font-semibold">Contact Us</h3>
                             <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a href="https://maps.app.goo.gl/mpzfqvHyTpLaD7UQ6" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 hover:text-primary">
                                        <MapPin size={16} />
                                        <span>Get Directions</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:contact@laquita.com" className="flex items-center justify-center md:justify-start gap-3 hover:text-primary">
                                        <Mail size={16} />
                                        <span>contact@laquita.com</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:0759713882" className="flex items-center justify-center md:justify-start gap-3 hover:text-primary">
                                        <Phone size={16} />
                                        <span>Reception: 0759713882</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://wa.me/254710147434" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 hover:text-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                                        <span>WhatsApp: 0710147434</span>
                                    </a>
                                </li>
                             </ul>
                        </div>
                    </div>

                    {/* Follow Us */}
                    <div className="md:flex md:justify-start">
                         <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Follow Us</h3>
                            <div className="flex justify-center md:justify-start space-x-2">
                                <Button size="icon" variant="ghost" asChild>
                                    <Link href="#" aria-label="Facebook">
                                    <Facebook size={20} />
                                    </Link>
                                </Button>
                                <Button size="icon" variant="ghost" asChild>
                                    <Link href="#" aria-label="Instagram">
                                    <Instagram size={20} />
                                    </Link>
                                </Button>
                                <Button size="icon" variant="ghost" asChild>
                                    <Link href="#" aria-label="Twitter">
                                    <Twitter size={20} />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
