// Zustand store for managing the Pokecat catching game state
import { create } from "zustand";
import type { Pokecat } from "~/types/Pokecat";
import type { GameItem } from "~/types/GameItem";
import type { ItemDefinition } from "~/types/ItemDefinition";

interface Notification {
  message: string;
  type: "info" | "success" | "warning" | "error";
}

/** Represents the current player's basic identity info */
interface UserIdentity {
  id: string;
  name: string;
}

interface GameState {
  /** User identity, stored persistently */
  user: UserIdentity | null;

  /** List of caught Pokecats */
  caughtList: Pokecat[];

  /** Toast/alert notification state */
  notification: Notification | null;

  /** Currently selected Pokecat for modal display */
  selectedPokecat: Pokecat | null;

  /** Player inventory and balance */
  items: GameItem[];
  dirhams: number;

  /** State modification actions */
  setUser: (user: UserIdentity) => void;
  clearUser: () => void;

  setCaughtList: (updater: (prev: Pokecat[]) => Pokecat[]) => void;
  addCaught: (pokecat: Pokecat) => void;
  setNotification: (notification: Notification | null) => void;
  clearNotification: () => void,
  openModal: (pokecat: Pokecat) => void;
  closeModal: () => void;
  addItem: (item: ItemDefinition | GameItem, quantity?: number) => void;
  removeItem: (id: string, quantity?: number) => void;
  addDirhams: (amount: number) => void;
  spendDirhams: (amount: number) => boolean;
}

const defaultItems: GameItem[] = [];

/** Persist JSON-serializable data to localStorage */
export const saveToLocalStorage = (key: string, value: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/** Load persisted value from localStorage or return fallback */
export const loadFromLocalStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch {
    return fallback;
  }
};

// ------------------------------
// Main Zustand Store
// ------------------------------
export const useGameStore = create<GameState>((set, get) => ({
  user: loadFromLocalStorage<UserIdentity | null>("user", null),
  caughtList: loadFromLocalStorage<Pokecat[]>("caughtList", []),
  notification: null,
  selectedPokecat: null,
  items: loadFromLocalStorage("items", defaultItems),
  dirhams: loadFromLocalStorage("dirhams", 2500),

  /** Set or update the current user identity */
  // Updates the current user and persists it to localStorage
  setUser: (user) => {
    saveToLocalStorage("user", user);
    set({ user });
  },

  /** Clear current user (for logout or reset) */
  clearUser: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },

  setCaughtList: (updater) =>
    set((state) => {
      const newCaughtList = updater(state.caughtList);
      saveToLocalStorage("caughtList", newCaughtList);
      return { caughtList: newCaughtList };
    }),

  addCaught: (pokecat) =>
    set((state) => {
      const newCaughtList = [...state.caughtList, pokecat];
      saveToLocalStorage("caughtList", newCaughtList);
      return { caughtList: newCaughtList };
    }),

  setNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
  openModal: (pokecat) => set({ selectedPokecat: pokecat }),
  closeModal: () => set({ selectedPokecat: null }),

  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      const newItems = existing
        ? state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [
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
      saveToLocalStorage("items", newItems);
      return { items: newItems };
    }),

  removeItem: (id, quantity = 1) =>
    set((state) => {
      const newItems = state.items
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - quantity } : i
        )
        .filter((i) => i.quantity > 0);
      saveToLocalStorage("items", newItems);
      return { items: newItems };
    }),

  addDirhams: (amount) =>
    set((state) => {
      const newBalance = state.dirhams + amount;
      saveToLocalStorage("dirhams", newBalance);
      return { dirhams: newBalance };
    }),

  spendDirhams: (amount) => {
    const { dirhams } = get();
    if (dirhams < amount) return false;
    const newBalance = dirhams - amount;
    set({ dirhams: newBalance });
    saveToLocalStorage("dirhams", newBalance);
    return true;
  },
}));
