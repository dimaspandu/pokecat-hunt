import type { ItemCategory } from "./ItemCategory";

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  iconComponent?: React.FC<React.SVGProps<SVGSVGElement>>;
  iconUrl?: string;
  usable?: boolean; // if true, can be used (e.g., food, cage)
  useEffect?: string; // short effect description
  catchRate?: number; // value between 0 and 1, e.g., 0.7 = 70% success
}