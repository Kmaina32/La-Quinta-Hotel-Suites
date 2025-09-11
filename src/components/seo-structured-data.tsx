
'use client';

// This component is safe to be a client component because the script tag
// is only rendered, not executed in a way that would cause hydration mismatches.
// It simply injects a JSON-LD script into the head.

export function SeoStructuredData() {
    const siteUrl = "https://www.laquitahotel.com/";
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": "La Quita - Hotel, Lounge & Suites",
        "description": "Hotel, lounge and suites in Nakuru, Kenya along Pipeline Road offering accommodation, conference facilities, and a restaurant.",
        "url": siteUrl,
        "telephone": "+254759713882",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Pipeline Road",
            "addressLocality": "Nakuru",
            "addressCountry": "KE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -0.3293644,
            "longitude": 36.0619809
        },
        "image": `${siteUrl}og-image.png`,
        "priceRange": "KES",
        "checkinTime": "12:00",
        "checkoutTime": "10:00"
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
