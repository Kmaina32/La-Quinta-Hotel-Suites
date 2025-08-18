'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LAQUINTA_LOCATION_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.810599187176!2d36.14180787496587!3d-0.3293593995804588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182977000adf0c13%3A0x7a5f35c4157e80ee!2sLa%20Quita%20Hotel%20and%20Suites!5e0!3m2!1sen!2ske!4v1720524885803!5m2!1sen!2ske";
const LAQUINTA_DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=La+Quita+Hotel+and+Suites,Nakuru,Kenya";

export default function LocationMap() {
    const [mapSrc, setMapSrc] = useState(LAQUINTA_LOCATION_URL);
    const { toast } = useToast();

    const handleGetDirections = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const directionsUrl = `https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d3989.810599187176!2d36.14180787496587!3d-0.3293593995804588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x0%3A0x0!2s${latitude}%2C${longitude}!4m5!1s0x182977000adf0c13%3A0x7a5f35c4157e80ee!2sLa+Quita+Hotel+and+Suites!5e0!3m2!1sen!2ske`;
                    setMapSrc(directionsUrl);
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    toast({
                        variant: "destructive",
                        title: "Could not get your location",
                        description: "Please enable location services in your browser and try again. Redirecting to Google Maps.",
                    });
                    // Fallback to redirecting
                    window.open(LAQUINTA_DIRECTIONS_URL, '_blank');
                }
            );
        } else {
            toast({
                variant: "destructive",
                title: "Geolocation not supported",
                description: "Your browser does not support geolocation. Redirecting to Google Maps.",
            });
             // Fallback to redirecting
            window.open(LAQUINTA_DIRECTIONS_URL, '_blank');
        }
    };

    return (
        <>
            <div className="overflow-hidden rounded-lg">
                <iframe
                    src={mapSrc}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={handleGetDirections}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Directions
                </Button>
            </div>
        </>
    );
}
