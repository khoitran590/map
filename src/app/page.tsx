import Map from "@/components/Map";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        alignItems: "center",
      }}
    >
      <h1>Interactive Google Map</h1>
      <p>Click anywhere on the map to drop a pin.</p>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <Map />
      </div>
    </main>
  );
}