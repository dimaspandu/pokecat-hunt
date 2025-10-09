import { useGameStore } from "@/stores/useGameStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { type LatLngExpression } from "leaflet";
import { type Pokecat } from "@/types/pokecat";
import { io, Socket } from "socket.io-client";
import styles from "./MapView.module.scss";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function FlyToUser({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 15, { duration: 1.5 });
  }, [position, map]);
  return null;
}

export default function MapView() {
  const setNotification = useGameStore((s) => s.setNotification);
  const navigate = useNavigate();
  const [wildCats, setWildCats] = useState<Pokecat[]>([]);
  const [userName, setUserName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const defaultCenter: LatLngExpression = [-6.2, 106.8];
  const userRef = useRef<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("userId");
    const savedName = localStorage.getItem("userName");
    if (savedId && savedName) {
      userRef.current = { id: savedId, name: savedName };
    } else {
      const generatedId = "user-" + Math.random().toString(36).slice(2, 9);
      userRef.current = { id: generatedId, name: "" };
      setShowModal(true);
    }
  }, []);

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
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setUserPosition([latitude, longitude]);
          socket.emit("user-location", { lat: latitude, lng: longitude });
        },
        () => {
          const randomOffset = () => (Math.random() - 0.5) * 0.02;
          const lat = -6.2 + randomOffset();
          const lng = 106.8 + randomOffset();
          setUserPosition([lat, lng]);
          socket.emit("user-location", { lat, lng });
        }
      );
    }

    return () => {
      socket.disconnect();
    };
  }, [setNotification]);

  const handleCatch = (pc: Pokecat) => {
    const socket = socketRef.current;
    if (!socket || !userRef.current) return;

    socket.emit("lock-pokecat", {
      pokecatId: pc.id,
      user: userRef.current,
    });

    socket.once("lock-result", res => {
      if (res.success) {
        setWildCats(prev => prev.filter(cat => cat.id !== pc.id));
        navigate(`/catch/${pc.id}`);
      } else {
        setNotification({ message: res.message, type: "error" });
      }
    });
  };

  const createIcon = (url: string) =>
    L.icon({
      iconUrl: url,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });

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
        <div className={styles["modal-backdrop"]}>
          <div className={styles["modal"]}>
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
        className={styles["map"]}
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
            <Popup className={styles["pokecat-popup"]}>
              <div className={styles["pokecat-popup__content"]}>
                <img
                  src={pc.iconUrl}
                  alt={pc.name}
                  className={`${styles["pokecat-popup__image"]} ${styles[`pokecat-popup__image--${pc.rarity}`]}`}
                />
                <h3 className={styles["pokecat-popup__title"]}>{pc.name}</h3>
                <button
                  className={styles["pokecat-popup__button"]}
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
