export type Category =
  | "top"
  | "bottom"
  | "dress"
  | "outerwear"
  | "shoes"
  | "bag"
  | "accessory";

export const CATEGORY_LABELS: Record<Category, string> = {
  top: "Blusas y tops",
  bottom: "Faldas y pantalones",
  dress: "Vestidos",
  outerwear: "Abrigos",
  shoes: "Zapatos",
  bag: "Bolsos",
  accessory: "Accesorios",
};

export interface Garment {
  id: number;
  name: string;
  category: Category;
  color: string;
  notes: string;
  image: string;
  cutout: string | null;
  favorite: boolean;
  created_at: string;
}

export interface OutfitItem {
  garment: number;
  x: number; // % del ancho del lienzo (centro de la prenda)
  y: number; // % del alto del lienzo
  scale: number; // ancho de la prenda como fracción del ancho del lienzo
  rotation: number; // grados
  z: number;
}

export interface OutfitRender {
  id: number;
  image: string;
  created_at: string;
}

export interface Outfit {
  id: number;
  name: string;
  occasion: string;
  items: OutfitItem[];
  renders: OutfitRender[];
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvatarPhoto {
  image: string;
  cutout: string | null;
  updated_at: string;
}
