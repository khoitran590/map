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
  const [selectedColor, setSelectedColor] = useState<string>("#ef4444"); // red
  const [selectedShape, setSelectedShape] = useState<"circle" | "square" | "star">("circle");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Keep the latest selection in refs so the map click handler
  // always uses the current values, even after re-renders.
  const colorRef = useRef(selectedColor);
  const shapeRef = useRef<"circle" | "square" | "star">(selectedShape);

  useEffect(() => {
    colorRef.current = selectedColor;
  }, [selectedColor]);

  useEffect(() => {
    shapeRef.current = selectedShape;
  }, [selectedShape]);

  const createIcon = (color: string, shape: "circle" | "square" | "star"): google.maps.Symbol => {
    if (shape === "square") {
      return {
        path: "M -8 -8 L 8 -8 L 8 8 L -8 8 z",
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#111827",
        scale: 1,
      };
    }

    if (shape === "star") {
      return {
        path: "M 0 -10 L 2.94 -3.09 L 9.51 -3.09 L 4.29 1.18 L 6.8 8 L 0 4.5 L -6.8 8 L -4.29 1.18 L -9.51 -3.09 L -2.94 -3.09 z",
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#111827",
        scale: 1,
      };
    }

    // default: circle
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: "#111827",
      scale: 8,
    };
  };

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
        icon: createIcon(colorRef.current, shapeRef.current),
      });

      // Allow removing a pin by clicking on it
      marker.addListener("click", () => {
        marker.setMap(null);
        setMarkers((prev) => prev.filter((m) => m !== marker));
      });

      setMarkers((prev) => [...prev, marker]);
    });
  };

  return (
    <div style={{ width: "100%", height: "700px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.875rem",
        }}
      >
        <span style={{ fontWeight: 500 }}>Pin color:</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { label: "Red", value: "#ef4444" },
            { label: "Blue", value: "#3b82f6" },
            { label: "Green", value: "#22c55e" },
            { label: "Purple", value: "#a855f7" },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedColor(c.value)}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "999px",
                border: selectedColor === c.value ? "2px solid #111827" : "1px solid #d1d5db",
                backgroundColor: c.value,
                cursor: "pointer",
              }}
              aria-label={c.label}
            />
          ))}
        </div>

        <span style={{ fontWeight: 500, marginLeft: "1rem" }}>Shape:</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { label: "Circle", value: "circle" as const },
            { label: "Square", value: "square" as const },
            { label: "Star", value: "star" as const },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedShape(s.value)}
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                border: selectedShape === s.value ? "2px solid #111827" : "1px solid #d1d5db",
                backgroundColor: selectedShape === s.value ? "#f3f4f6" : "white",
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setLocationError(null);
            if (!navigator.geolocation) {
              setLocationError("Geolocation is not supported in this browser.");
              return;
            }

            setLocating(true);
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setLocating(false);
                const { latitude, longitude } = pos.coords;
                const map = mapInstanceRef.current;
                if (!map) return;

                const position = { lat: latitude, lng: longitude };
                map.setCenter(position);
                map.setZoom(14);

                const userMarker = new window.google.maps.Marker({
                  position,
                  map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#0ea5e9",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#0369a1",
                    scale: 10,
                  },
                  title: "Your location",
                });

                setMarkers((prev) => [...prev, userMarker]);
              },
              (err) => {
                setLocating(false);
                setLocationError(err.message || "Unable to retrieve your location.");
              }
            );
          }}
          style={{
            marginLeft: "auto",
            padding: "0.35rem 0.9rem",
            borderRadius: "999px",
            border: "1px solid #0f766e",
            backgroundColor: "#14b8a6",
            color: "white",
            fontSize: "0.8rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            whiteSpace: "nowrap",
          }}
        >
          {locating ? "Locating..." : "Show my location"}
        </button>
      </div>

      {locationError && (
        <p style={{ color: "#b91c1c", fontSize: "0.8rem" }}>{locationError}</p>
      )}

      <div style={{ width: "100%", height: "100%" }}>
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
    </div>
  );
}

