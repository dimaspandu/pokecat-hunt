export interface Pokecat {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'wild' | 'caught';
  iconUrl: string;
  expiresAt: number;
  rarity: 'common' | 'rare' | 'legendary';
}