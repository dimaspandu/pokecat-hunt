import ChickMeow from "@/components/2D/ChickMeow";
import FastpawShoes from "@/components/2D/FastpawShoes";
import MeowNet from "@/components/2D/MeowNet";
import AutoCage from "@/components/2D/AutoCage";
import GrilledFish from "@/components/2D/GrilledFish";
import WishCash from "@/components/2D/WishCash";

export type ItemCategory = "food" | "equipment" | "weapon" | "cage";

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

export const ITEMS: ItemDefinition[] = [
  {
    id: "chick-meow",
    name: "Chick Meow",
    description: "Pokecat's favorite fried chicken! Increases happiness by +20.",
    category: "food",
    price: 80,
    rarity: "common",
    iconComponent: ChickMeow,
    iconUrl: "/2D/chick-meow.svg",
    usable: true,
    useEffect: "Restore 20 happiness",
    catchRate: 0.55,
  },
  {
    id: "grilled-fish",
    name: "Grilled Fish",
    description: "Delicious grilled fish with an irresistible aroma.",
    category: "food",
    price: 120,
    rarity: "rare",
    iconComponent: GrilledFish,
    iconUrl: "/2D/grilled-fish.svg",
    usable: true,
    useEffect: "Restore 40 happiness",
    catchRate: 0.65,
  },
  {
    id: "wish-cash",
    name: "Wish Cash",
    description: "A rare currency that can be exchanged for special items.",
    category: "food",
    price: 0,
    rarity: "epic",
    iconComponent: WishCash,
    iconUrl: "/2D/wish-cash.svg",
    usable: false,
  },
  {
    id: "fastpaw-shoes",
    name: "Fastpaw Shoes",
    description: "Magical shoes that make Pokecat run twice as fast!",
    category: "equipment",
    price: 300,
    rarity: "rare",
    iconComponent: FastpawShoes,
    iconUrl: "/2D/fastpaw-shoes.svg",
    usable: true,
    useEffect: "Increase catch speed",
    catchRate: 0.7,
  },
  {
    id: "meow-net",
    name: "Meow Net",
    description: "A legendary net with high accuracy.",
    category: "weapon",
    price: 500,
    rarity: "epic",
    iconComponent: MeowNet,
    iconUrl: "/2D/meow-net.svg",
    usable: true,
    useEffect: "Higher catch success rate",
    catchRate: 0.85,
  },
  {
    id: "auto-cage",
    name: "Auto Pokecage",
    description: "An automatic cage to catch Pokecat without fail.",
    category: "cage",
    price: 800,
    rarity: "legendary",
    iconComponent: AutoCage,
    iconUrl: "/2D/auto-cage.svg",
    usable: true,
    useEffect: "Instant capture for next catch",
    catchRate: 1.0,
  },
];
