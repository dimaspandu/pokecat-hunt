import "leaflet/dist/leaflet.css";
import { useGameStore } from "~/stores/useGameStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { type LatLngExpression } from "leaflet";
import { type Pokecat } from "~/types/Pokecat";
import { type LocalPokecat } from "~/types/LocalPokecat";
import { io, Socket } from "socket.io-client";
import L from "leaflet";
import FlyToUser from "../FlyToUser";
import styles from "./MapView.module.scss";

/**
 * Create a Leaflet icon from the Pokecat's sprite image.
 */
const createIcon = (url: string) => L.icon({
  iconUrl: url,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

/**
 * Main interactive map scene that displays the user location and nearby Pokecats.
 * Each Pokecat is represented by a LocalPokecat which moves slowly and fades out when expired.
 * Pay attention to the useEffect usage! (heheh...)
 */
export default function MapView() {
  const setNotification = useGameStore((s) => s.setNotification);
  const user = useGameStore((s) => s.user);

  const navigate = useNavigate();

  const [wildCats, setWildCats] = useState<LocalPokecat[]>([]);
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(null);

  const socketRef = useRef<Socket | null>(null);
  
  const defaultCenter: LatLngExpression = [-6.2, 106.8];

  /**
   * Initialize socket connection, listen to server Pokecat events,
   * and set up geolocation tracking for the current user.
   */
  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    // Listen for new Pokecats from server
    socket.on("pokecats", (data: Pokecat[]) => {
      setWildCats((prev) => {
        // Convert Pokecat[] to LocalPokecat[]
        const newCats: LocalPokecat[] = data.map((cat) => {
          const existing = prev.find((p) => p.id === cat.id);
          return (
            existing ?? {
              ...cat,
              originLat: cat.lat,
              originLng: cat.lng,
              direction: Math.random() * 360,
              fadingOut: false,
            }
          );
        });
        return newCats;
      });
    });

    // Remove caught Pokecat when another user catches it
    socket.on("pokecat-caught", (data: { id: string; caughtBy: string }) => {
      setWildCats((prev) =>
        prev.map((pc) =>
          pc.id === data.id ? { ...pc, fadingOut: true } : pc
        )
      );
      setNotification({ message: `${data.caughtBy} caught a Pokecat!`, type: "info" });
      setTimeout(() => {
        // After fade-out animation, remove from state
        setWildCats((prev) => prev.filter((pc) => pc.id !== data.id));
      }, 1000);
    });

    // Handle user geolocation or random fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
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

  /**
   * Handle Pokecat capture logic.
   * Emit lock request to server and navigate to Catch Scene if successful.
   */
  const handleCatch = (pc: Pokecat) => {
    const socket = socketRef.current;
    if (!socket || !user) return;

    socket.emit("lock-pokecat", {
      pokecatId: pc.id,
      user,
    });

    socket.once("lock-result", (res) => {
      if (res.success) {
        setWildCats((prev) =>
          prev.map((cat) =>
            cat.id === pc.id ? { ...cat, fadingOut: true } : cat
          )
        );
        setTimeout(() => {
          setWildCats((prev) => prev.filter((cat) => cat.id !== pc.id));
          navigate(`/catch/${pc.id}`);
        }, 1000);
      } else {
        setNotification({ message: res.message, type: "error" });
      }
    });
  };

  /**
   * Continuously animate local Pokecat positions every 60ms.
   * Each cat moves slightly in its current direction, occasionally changing course.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setWildCats((prev) =>
        prev.map((cat) => {
          if (cat.fadingOut) return cat;

          // Occasionally adjust direction
          if (Math.random() < 0.05) {
            cat.direction += (Math.random() - 0.5) * 60;
          }

          // Compute new position based on direction
          const delta = 0.00005;
          const rad = (cat.direction * Math.PI) / 180;
          const newLat = cat.lat + Math.sin(rad) * delta;
          const newLng = cat.lng + Math.cos(rad) * delta;

          return { ...cat, lat: newLat, lng: newLng };
        })
      );
    }, 60); // ~16 FPS
    return () => clearInterval(interval);
  }, []);

  return (
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

      {wildCats.map((pc) => (
        <Marker
          key={pc.id}
          position={[pc.lat, pc.lng]}
          icon={createIcon(pc.iconUrl)}
        >
          <Popup className={styles["pokecat-popup"]}>
            <div
              className={`${styles["pokecat-popup__content"]} ${
                pc.fadingOut ? styles["pokecat-popup__content--fadeout"] : ""
              }`}
            >
              <img
                src={pc.iconUrl}
                alt={pc.name}
                className={`${styles["pokecat-popup__image"]} ${styles[`pokecat-popup__image--${pc.rarity}`]}`}
              />
              <h3 className={styles["pokecat-popup__title"]}>{pc.name}</h3>
              <button
                className={styles["pokecat-popup__button"]}
                onClick={() => handleCatch(pc)}
                disabled={pc.fadingOut}
              >
                Catch
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
