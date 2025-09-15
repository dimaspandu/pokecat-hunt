import { useState } from "react";
import { type Pokecat } from "./types/pokecat";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import Notification from "./components/Notification";
import CollectionModal from "./components/CollectionModal";

function App() {
  const [caughtList, setCaughtList] = useState<Pokecat[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "info" | "success" | "warning" | "error"
  } | null>(null);

  const [selectedPokecat, setSelectedPokecat] = useState<Pokecat | null>(null);

  const openModal = (pokecat: Pokecat) => {
    console.log("pokecat", pokecat);
    setSelectedPokecat(pokecat);
  };

  const closeModal = () => {
    setSelectedPokecat(null);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MapView setCaughtList={setCaughtList} setNotification={setNotification} />
      <Sidebar caughtList={caughtList} openModal={openModal} />

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
