import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "~/stores/useGameStore";
import type { Pokecat } from "~/types/Pokecat";
import SceneHeader from "~/components/SceneHeader";
import styles from "./ScannerScene.module.scss";

export default function ScannerScene() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { addCaught, setNotification } = useGameStore();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedCat, setCapturedCat] = useState<Pokecat | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }, // prioritize back camera
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // fallback to default camera
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
        } catch {
          setNotification({ message: "Cannot access camera", type: "error" });
        }
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async () => {
    setScanning(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await fetch("http://localhost:5000/api/cats");
      const cats: Pokecat[] = await res.json();
      const randomCat = cats[Math.floor(Math.random() * cats.length)];
      setCapturedCat(randomCat);

      const lat = 37.7749 + (Math.random() - 0.5) * 0.01;
      const lng = -122.4194 + (Math.random() - 0.5) * 0.01;
      const expiresAt = Date.now() + 30 * 60 * 1000;

      addCaught({
        id: randomCat.name.toLowerCase() + "-" + Date.now(),
        name: randomCat.name,
        lat,
        lng,
        status: "caught",
        iconUrl: randomCat.iconUrl,
        caughtAt: Date.now(),
        expiresAt,
        rarity: randomCat.rarity,
      });

      setNotification({ message: `You captured ${randomCat.name}!`, type: "success" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      setNotification({ message: "Failed to scan cat", type: "error" });
    }

    setScanning(false);
  };

  const handleScanSuccess = () => {
    setCapturedCat(null);
    setTimeout(() => navigate("/collection", { replace: true }), 0);
  };

  return (
    <div className={styles["scanner-scene"]}>
      <SceneHeader title="Pokecat Scanner" />

      <p className={styles["scanner-scene__instruction"]}>
        You can scan cats around you and generate your own cat!
      </p>

      <div className={styles["scanner-scene__video-wrapper"]}>
        <video ref={videoRef} autoPlay playsInline className={styles["scanner-scene__video"]} />
      </div>

      <div className={styles["scanner-scene__object-detector"]}>
        ...
      </div>

      <button
        onClick={handleScan}
        className={styles["scanner-scene__btn-scan"]}
        disabled={scanning}
      >
        {scanning ? "Recognizing..." : "Scan Cat"}
      </button>

      {capturedCat && (
        <div className={styles["scanner-scene__modal-overlay"]}>
          <div className={styles["scanner-scene__modal"]}>
            <img src={capturedCat.iconUrl} alt={capturedCat.name} className={styles["scanner-scene__modal-image"]} />
            <h2>{capturedCat.name}</h2>
            <p>Rarity: {capturedCat.rarity}</p>
            <button
              className={styles["scanner-scene__btn-close"]}
              onClick={handleScanSuccess}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
