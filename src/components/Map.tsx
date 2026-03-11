 "use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type LatLng = {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: LatLng = {
  lat: 37.7749, // San Francisco
  lng: -122.4194,
};

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const handleScriptLoad = () => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 10,
    });

    mapInstanceRef.current = map;

    map.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const marker = new window.google.maps.Marker({
        position: event.latLng,
        map,
      });

      // Allow removing a pin by clicking on it
      marker.addListener("click", () => {
        marker.setMap(null);
        setMarkers((prev) => prev.filter((m) => m !== marker));
      });

      setMarkers((prev) => [...prev, marker]);
    });
  };

  useEffect(() => {
    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [markers]);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      />
    </div>
  );
}

