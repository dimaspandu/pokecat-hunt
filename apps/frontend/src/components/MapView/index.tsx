import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { type LatLngExpression } from "leaflet";
import { type Pokecat } from "@/types/pokecat";
import { io, Socket } from "socket.io-client";
import styles from "./MapView.module.scss";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapViewProps {
  setCaughtList: React.Dispatch<React.SetStateAction<Pokecat[]>>;
  setNotification: React.Dispatch<React.SetStateAction<{
    message: string;
    type: "info" | "success" | "warning" | "error";
  } | null>>;
}

function FlyToUser({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    // Move the map smoothly to the user's position
    map.flyTo(position, 15, { duration: 1.5 });
  }, [position, map]);
  return null;
}

export default function MapView({ setCaughtList, setNotification }: MapViewProps) {
  const [wildCats, setWildCats] = useState<Pokecat[]>([]);
  const [userName, setUserName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const defaultCenter: LatLngExpression = [-6.2, 106.8];

  const userRef = useRef<{ id: string; name: string } | null>(null);

  // Initialize user data once when the component mounts
  useEffect(() => {
    const savedId = localStorage.getItem("userId");
    const savedName = localStorage.getItem("userName");
    if (savedId && savedName) {
      userRef.current = { id: savedId, name: savedName };
    } else {
      const generatedId = "user-" + Math.random().toString(36).slice(2, 9);
      userRef.current = { id: generatedId, name: "" };
      setShowModal(true); // safe to call inside useEffect
    }
  }, []);

  // Set up socket connection and events
  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.on("pokecats", (data: Pokecat[]) => {
      setWildCats(data);
    });

    socket.on("pokecat-caught", (data: { id: string; caughtBy: string }) => {
      setWildCats(prev => prev.filter(pc => pc.id !== data.id));
      setNotification({ message: `${data.caughtBy} caught a Pokecat!`, type: "info" });
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
        socket.emit("user-location", { lat: latitude, lng: longitude });
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [setNotification]);

  // Handle catching a Pokecat
  const handleCatch = (pc: Pokecat) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("catch-pokecat", {
      pokecatId: pc.id,
      user: userRef.current,
    });

    socket.once("catch-result", (res) => {
      if (res.success) {
        setNotification({ message: `You caught ${res.pokecat.name}!`, type: "success" });
        setCaughtList(prev => [...prev, res.pokecat]);
        setWildCats(prev => prev.filter(p => p.id !== pc.id));
      } else {
        setNotification({ message: `${res.message}`, type: "error" });
      }
    });
  };

  // Create custom Leaflet icon
  const createIcon = (url: string) =>
    L.icon({
      iconUrl: url,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });

  // Handle trainer name input and save to localStorage
  const handleNameSubmit = () => {
    if (!userName.trim()) return;
    if (!userRef.current) return;
    userRef.current.name = userName.trim();
    localStorage.setItem("userId", userRef.current.id);
    localStorage.setItem("userName", userRef.current.name);
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Enter Your Trainer Name</h2>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Ash, Misty, etc."
            />
            <button onClick={handleNameSubmit}>Start Hunting</button>
          </div>
        </div>
      )}
      <MapContainer
        className={styles.map}
        center={userPosition ?? defaultCenter}
        zoom={15}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPosition && <FlyToUser position={userPosition} />}
        {wildCats.map(pc => (
          <Marker key={pc.id} position={[pc.lat, pc.lng]} icon={createIcon(pc.iconUrl)}>
            <Popup className={styles.pokecatPopup}>
              <div className={styles.pokecatPopup__content}>
                <img
                  src={pc.iconUrl}
                  alt={pc.name}
                  className={`${styles.pokecatPopup__image} ${styles[`rarity_${pc.rarity}`]}`}
                />
                <h3 className={styles.pokecatPopup__title}>{pc.name}</h3>
                <button
                  className={styles.pokecatPopup__button}
                  onClick={() => handleCatch(pc)}
                >
                  Catch
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
