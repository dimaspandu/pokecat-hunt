import { Routes, Route } from "react-router-dom";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useGameStore } from "@/stores/useGameStore";
import CatchScene from "./scenes/CatchScene";
import StartHuntModal from "@/components/Fragment/StartHuntModal";
import Notification from "@/components/Notification";
import CollectionModal from "@/components/Fragment/CollectionModal";
import "./App.scss";

const MainScene = lazy(() => import("@/scenes/MainScene"));
const CollectionScene = lazy(() => import("@/scenes/CollectionScene"));
const BackpackScene = lazy(() => import("@/scenes/BackpackScene"));
const StoreScene = lazy(() => import("@/scenes/StoreScene"));
const ScannerScene = lazy(() => import("@/scenes/ScannerScene"));
const CreatorScene = lazy(() => import("@/scenes/CreatorScene"));

export default function App() {
  const { notification, selectedPokecat, closeModal, setNotification } = useGameStore();
  const [showStartModal, setShowStartModal] = useState(false);
  const userRef = useRef<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("userId");
    const savedName = localStorage.getItem("userName");

    if (savedId && savedName) {
      userRef.current = { id: savedId, name: savedName };
    } else {
      const generatedId = "user-" + Math.random().toString(36).slice(2, 9);
      userRef.current = { id: generatedId, name: "" };
      setShowStartModal(true);
    }
  }, []);

  const handleStartSubmit = (name: string) => {
    if (!userRef.current) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    userRef.current.name = trimmed;
    localStorage.setItem("userId", userRef.current.id);
    localStorage.setItem("userName", trimmed);
    setShowStartModal(false);
  };

  return (
    <div className="app-container">
      <Suspense
        fallback={
          <div className="app-container__loading">
            <div className="app-container__spinner" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<MainScene />} />
          <Route path="/catch/:id" element={<CatchScene />} />
          <Route path="/collection" element={<CollectionScene />} />
          <Route path="/backpack" element={<BackpackScene />} />
          <Route path="/store" element={<StoreScene />} />
          <Route path="/scanner" element={<ScannerScene />} />
          <Route path="/creator" element={<CreatorScene />} />
        </Routes>
      </Suspense>

      {showStartModal && <StartHuntModal onStart={handleStartSubmit} />}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {selectedPokecat && <CollectionModal pokecat={selectedPokecat} onClose={closeModal} />}
    </div>
  );
}
