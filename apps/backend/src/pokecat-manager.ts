import { Server } from "socket.io";
import fs from "fs/promises";
import path from "path";
import { generateId, randomLocationNear } from "./utils";

// ----------------------
// Types & Interfaces
// ----------------------

interface Pokecat {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "wild" | "locked" | "caught";
  iconUrl: string;
  expiresAt: number;
  rarity: "common" | "rare" | "legendary";
}

interface User {
  id: string;
  name: string;
}

// ----------------------
// Pokecat Manager Class
// ----------------------

export class PokecatManager {
  private pokecats: Pokecat[] = []; // Active pokecats in the game
  private io: Server;               // Socket.IO server instance
  private catPool: { name: string; iconUrl: string }[] = []; // Base cats loaded from local JSON
  private userLocations = new Map<string, { lat: number; lng: number }>(); // User positions

  constructor(io: Server) {
    this.io = io;

    // Load the initial cat list and start timers
    this.loadCatList().then(() => {
      // Spawn pokecats near users every 3 seconds
      setInterval(() => {
        for (const [, loc] of this.userLocations) {
          this.spawnPokecatNear(loc.lat, loc.lng);
        }
      }, 3000);

      // Clean up expired pokecats every 5 seconds
      setInterval(() => {
        this.cleanupExpired();
      }, 5000);
    });

    // ----------------------
    // Socket.IO Handlers
    // ----------------------
    io.on("connection", (socket) => {
      console.log("Client connected");

      // Send current wild pokecats to new client
      socket.emit("pokecats", this.getWildPokecats());

      // Update user location
      socket.on("user-location", ({ lat, lng }) => {
        this.userLocations.set(socket.id, { lat, lng });
      });

      // Handle initial catch (lock)
      socket.on("lock-pokecat", ({ pokecatId, user }: { pokecatId: string; user: User }) => {
        const index = this.pokecats.findIndex((p) => p.id === pokecatId);
        if (index === -1) {
          socket.emit("lock-result", { success: false, message: "Pokecat not found!" });
          return;
        }
        const cat = this.pokecats[index];
        if (cat.status !== "wild") {
          socket.emit("lock-result", { success: false, message: "Pokecat is not available!" });
          return;
        }
        this.pokecats[index].status = "locked";
        socket.emit("lock-result", { success: true, pokecat: cat });
        socket.broadcast.emit("pokecat-locked", { id: cat.id, lockedBy: user.name });
      });

      // Handle catch confirmation (detail view)
      socket.on("confirm-catch", ({ pokecatId, success, user }: { pokecatId: string; success: boolean; user: User }) => {
        const index = this.pokecats.findIndex(p => p.id === pokecatId);
        if (index === -1) return;

        const cat = this.pokecats[index];

        if (cat.status !== "locked") return; // only locked cats can be resolved

        if (success) {
          // Finalize catch
          this.pokecats[index].status = "caught";
          socket.emit("confirm-result", { success: true, pokecat: cat });
          socket.broadcast.emit("pokecat-caught", { id: cat.id, caughtBy: user.name });
        } else {
          // Release lock
          this.pokecats[index].status = "wild";
          socket.emit("confirm-result", { success: false, message: "Pokecat escaped!" });
          this.io.emit("pokecats", this.getWildPokecats());
        }
      });

      // Handle catching in detail
      socket.on("get-pokecat", ({ id }) => {
        const cat = this.pokecats.find(p => p.id === id);
        socket.emit("pokecat-detail", cat ?? null);
      });

      // Cleanup on disconnect
      socket.on("disconnect", () => {
        this.userLocations.delete(socket.id);
      });
    });
  }

  // ----------------------
  // Data Loading
  // ----------------------

  // Load the cats from the Go backend, or fallback to local JSON file if unavailable
  private async loadCatList() {
    try {
      // Try fetching cats from Go backend
      const response = await this.fetchCatData("http://localhost:5000/api/cats");

      if (response) {
        // If successful, use the cats from the backend
        this.catPool = response.map((cat: { name: string; iconUrl: string }) => ({
          name: cat.name,
          iconUrl: cat.iconUrl,
        }));

        console.log(`Loaded ${this.catPool.length} pokecats from Go backend.`);
      } else {
        // If fetching from Go fails, load from local JSON file
        await this.loadCatListFromFile();
      }
    } catch (err) {
      console.error("Error fetching from Go backend, falling back to local JSON:", err);
      await this.loadCatListFromFile();
    }
  }

  // Use fetch API to get the cat data
  private async fetchCatData(url: string): Promise<any | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json(); // Parse and return JSON response
    } catch (err) {
      console.error("Failed to fetch data:", err);
      return null; // Return null if there is an error (e.g., Go backend is offline)
    }
  }

  // Fallback to loading cats from local JSON file
  private async loadCatListFromFile() {
    try {
      const filePath = path.join(__dirname, "cats.json");
      const data = await fs.readFile(filePath, "utf-8");
      const cats = JSON.parse(data);

      this.catPool = cats.map((c: { name: string; iconUrl: string }) => ({
        name: c.name,
        iconUrl: c.iconUrl,
      }));

      console.log(`Loaded ${this.catPool.length} pokecats from cats.json file.`);
    } catch (err) {
      console.error("Failed to load cat list from local file", err);
    }
  }

  // ----------------------
  // Pokecat Lifecycle
  // ----------------------

  private spawnPokecatNear(lat: number, lng: number) {
    if (this.catPool.length === 0) return;

    // Assign rarity by probability
    function getRandomRarity(): "common" | "rare" | "legendary" {
      const roll = Math.random();
      if (roll < 0.7) return "common";
      if (roll < 0.95) return "rare";
      return "legendary";
    }

    const template = this.catPool[Math.floor(Math.random() * this.catPool.length)];
    const location = randomLocationNear(lat, lng, 1000);

    const newCat: Pokecat = {
      id: generateId(),
      name: template.name,
      iconUrl: template.iconUrl,
      lat: location.lat,
      lng: location.lng,
      status: "wild",
      expiresAt: Date.now() + 30000, // expires in 30s
      rarity: getRandomRarity(),
    };

    this.pokecats.push(newCat);
    this.io.emit("pokecats", this.getWildPokecats());
  }

  private cleanupExpired() {
    const now = Date.now();
    const before = this.pokecats.length;

    // Remove expired wild pokecats
    this.pokecats = this.pokecats.filter(p => p.status !== "wild" || p.expiresAt > now);

    if (before !== this.pokecats.length) {
      this.io.emit("pokecats", this.getWildPokecats());
    }
  }

  private getWildPokecats() {
    return this.pokecats.filter(p => p.status === "wild");
  }

  // ----------------------
  // Public API
  // ----------------------

  getAll() {
    return [...this.pokecats];
  }

  simulateRaceCondition() {
    const testUsers: User[] = [
      { id: "test1", name: "Tester One" },
      { id: "test2", name: "Tester Two" },
      { id: "test3", name: "Tester Three" },
      { id: "test4", name: "Tester Four" },
      { id: "test5", name: "Tester Five" },
    ];

    const target = this.pokecats.find(p => p.status === "wild");
    if (!target) {
      console.log("No wild pokecats found for simulation.");
      return;
    }

    const results: string[] = [];

    const tryCatch = (user: User) => {
      if (target.status === "caught") {
        results.push(`${user.name} failed: already caught.`);
      } else {
        target.status = "caught";
        results.push(`${user.name} succeeded in catching ${target.name}`);
      }
    };

    testUsers.forEach(u => tryCatch(u));

    console.log("Race condition result:");
    results.forEach(r => console.log(r));

    return results;
  }
}
