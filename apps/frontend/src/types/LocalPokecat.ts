import type { Pokecat } from "./Pokecat";

export interface LocalPokecat extends Pokecat {
  originLat: number;
  originLng: number;
  direction: number;
  fadingOut?: boolean;
}
