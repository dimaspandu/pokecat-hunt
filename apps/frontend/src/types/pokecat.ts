export interface Pokecat {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'wild' | 'caught';
  iconUrl: string;
  caughtAt?: number;
  expiresAt: number;
  rarity: 'common' | 'rare' | 'legendary';
}