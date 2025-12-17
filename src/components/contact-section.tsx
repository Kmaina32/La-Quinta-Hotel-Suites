
'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { saveMessage } from '@/lib/actions';

export function ContactSection() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveMessage(formState);
            toast({
                title: 'Message Sent!',
                description: "Thank you for contacting us. We'll get back to you shortly.",
            });
            setFormState({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to send message. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="bg-secondary py-16">
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

                    {/* Message Us Form */}
                     <div>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-2xl font-semibold mb-4">Message Us</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" placeholder="Your Name" value={formState.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" placeholder="your@email.com" value={formState.email} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                        <Input id="phone" type="tel" placeholder="e.g. 0712 345 678" value={formState.phone} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" placeholder="Your message..." rows={5} value={formState.message} onChange={handleInputChange} required />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Send Message
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
