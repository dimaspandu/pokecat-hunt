export interface GameItem {
  id: string;
  name: string;
  quantity: number;
  category?: "food" | "equipment" | "weapon" | "cage";
  iconUrl?: string;
  iconComponent?: React.FC<React.SVGProps<SVGSVGElement>>;
  catchRate?: number;
}