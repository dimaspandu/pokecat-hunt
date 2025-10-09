// Zustand store for managing the Pokecat catching game state
import { create } from "zustand";
import { type Pokecat } from "@/types/pokecat";
import { type GameItem } from "@/types/gameitem";
import { type ItemDefinition } from "@/constants/items";

// Type for toast/alert notifications
interface Notification {
  message: string;
  type: "info" | "success" | "warning" | "error";
}

// Zustand store state and actions interface
interface GameState {
  caughtList: Pokecat[];                   // List of caught Pokecats
  notification: Notification | null;       // UI notification state
  selectedPokecat: Pokecat | null;         // Currently selected Pokecat (e.g., for modal)

  items: GameItem[];                       // Player's items
  dirhams: number;                         // In-game currency balance

  setCaughtList: (updater: (prev: Pokecat[]) => Pokecat[]) => void;
  addCaught: (pokecat: Pokecat) => void;
  setNotification: (notification: Notification | null) => void;
  openModal: (pokecat: Pokecat) => void;
  closeModal: () => void;

  addItem: (item: ItemDefinition | GameItem, quantity?: number) => void;
  removeItem: (id: string, quantity?: number) => void;

  addDirhams: (amount: number) => void;
  spendDirhams: (amount: number) => boolean;
}

// Default starter items (empty)
const defaultItems: GameItem[] = [];

// Utility: Save value to localStorage as JSON
const saveToLocalStorage = (key: string, value: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Utility: Load value from localStorage, or fallback to default
const loadFromLocalStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch {
    return fallback;
  }
};

// Zustand store implementation
export const useGameStore = create<GameState>((set, get) => ({
  // Initial game state
  caughtList: loadFromLocalStorage<Pokecat[]>("caughtList", []),
  notification: null,
  selectedPokecat: null,

  items: loadFromLocalStorage("items", defaultItems),
  dirhams: loadFromLocalStorage("dirhams", 2500), // Starting balance

  // Updates caught list using updater function and persists it
  setCaughtList: (updater) =>
    set((state) => {
      const newCaughtList = updater(state.caughtList);
      saveToLocalStorage("caughtList", newCaughtList);
      return { caughtList: newCaughtList };
    }),

  // Adds a newly caught Pokecat and persists to localStorage
  addCaught: (pokecat) =>
    set((state) => {
      const newCaughtList = [...state.caughtList, pokecat];
      saveToLocalStorage("caughtList", newCaughtList);
      return { caughtList: newCaughtList };
    }),

  // Updates or clears the notification
  setNotification: (notification) => set({ notification }),

  // Opens modal for selected Pokecat
  openModal: (pokecat) => set({ selectedPokecat: pokecat }),

  // Closes the Pokecat modal
  closeModal: () => set({ selectedPokecat: null }),

  // Adds item(s) to inventory, or increases quantity if already owned
  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      let newItems: GameItem[];

      if (existing) {
        // Update quantity for existing item
        newItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        // Add new item to inventory
        newItems = [
          ...state.items,
          {
            id: item.id,
            name: item.name,
            quantity,
            category: (item as ItemDefinition).category,
            iconComponent: (item as ItemDefinition).iconComponent,
            iconUrl: (item as ItemDefinition).iconUrl,
            catchRate: (item as ItemDefinition).catchRate,
          },
        ];
      }

      // Persist updated inventory
      saveToLocalStorage("items", newItems);
      return { items: newItems };
    }),

  // Removes quantity from item or deletes if quantity reaches 0
  removeItem: (id, quantity = 1) =>
    set((state) => {
      const newItems = state.items
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - quantity } : i
        )
        .filter((i) => i.quantity > 0); // Remove item if quantity <= 0

      saveToLocalStorage("items", newItems);
      return { items: newItems };
    }),

  // Adds dirhams to balance
  addDirhams: (amount) =>
    set((state) => {
      const newBalance = state.dirhams + amount;
      saveToLocalStorage("dirhams", newBalance);
      return { dirhams: newBalance };
    }),

  // Attempts to deduct dirhams. Returns false if insufficient balance
  spendDirhams: (amount) => {
    const { dirhams } = get();
    if (dirhams < amount) return false;

    const newBalance = dirhams - amount;
    set({ dirhams: newBalance });
    saveToLocalStorage("dirhams", newBalance);
    return true;
  },
}));
