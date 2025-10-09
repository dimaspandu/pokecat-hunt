import { Routes, Route } from "react-router-dom";
import { useGameStore } from "@/stores/useGameStore";
import MainScene from "@/scenes/MainScene";
import CatchScene from "@/scenes/CatchScene";
import CollectionScene from "@/scenes/CollectionScene";
import BackpackScene from "@/scenes/BackpackScene";
import StoreScene from "./scenes/StoreScene";
import ScannerScene from "./scenes/ScannerScene";
import CreatorScene from "./scenes/CreatorScene";
import Notification from "@/components/Notification";
import CollectionModal from "@/components/Fragment/CollectionModal";

function App() {
  const {
    notification,
    selectedPokecat,
    closeModal,
    setNotification
  } = useGameStore();

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Routes>
        <Route path="/" element={<MainScene />} />
        <Route path="/catch/:id" element={<CatchScene />} />
        <Route path="/collection" element={<CollectionScene />} />
        <Route path="/backpack" element={<BackpackScene />} />
        <Route path="/store" element={<StoreScene />} />
        <Route path="/scanner" element={<ScannerScene />} />
        <Route path="/creator" element={<CreatorScene />} />
      </Routes>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {selectedPokecat && (
        <CollectionModal pokecat={selectedPokecat} onClose={closeModal} />
      )}
    </div>
  );
}

export default App;
