import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";

export type Category = "T-Shirts" | "Hoodies" | "Accessories";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  details: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  verse?: string;
}

const tee = {
  details: [
    "240 GSM heavyweight 100% organic cotton",
    "Oversized boxy fit · drop shoulder",
    "Pre-shrunk · garment-dyed for soft hand feel",
    "Embroidered scripture detail at hem",
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
};

const hoodie = {
  details: [
    "450 GSM brushed fleece interior",
    "Relaxed streetwear silhouette",
    "Reinforced double-stitched seams",
    "YKK metal hardware · ribbed cuffs",
  ],
  sizes: ["S", "M", "L", "XL", "XXL"],
};

const accessory = {
  details: [
    "Premium hand-finished construction",
    "Designed in-house · made in small batches",
    "Engraved ChristFitz signature mark",
    "Comes in branded gift packaging",
  ],
  sizes: ["One Size"],
};

export const products: Product[] = [
  {
    id: "1",
    name: "Grace Oversized Tee",
    price: 68,
    category: "T-Shirts",
    image: p1,
    description:
      "A heavyweight oversized tee built for everyday devotion. Soft on the skin, bold on the spirit.",
    rating: 4.9,
    reviews: 128,
    verse: "Ephesians 2:8",
    ...tee,
  },
  {
    id: "2",
    name: "Cocoa Cross Hoodie",
    price: 142,
    category: "Hoodies",
    image: p2,
    description:
      "Our signature cocoa hoodie with embroidered cross. Premium fleece for warmth that lasts.",
    rating: 5.0,
    reviews: 214,
    verse: "Galatians 2:20",
    ...hoodie,
  },
  {
    id: "3",
    name: "Faith Knit Beanie",
    price: 38,
    category: "Accessories",
    image: p3,
    description: "A finely knit beanie in warm tones. Subtle. Spiritual. Always in season.",
    rating: 4.8,
    reviews: 76,
    verse: "Hebrews 11:1",
    ...accessory,
  },
  {
    id: "4",
    name: "Salvation Crewneck",
    price: 118,
    category: "Hoodies",
    image: p4,
    description: "Clean-cut crewneck made for layering. Heavyweight comfort, minimalist soul.",
    rating: 4.9,
    reviews: 167,
    verse: "Romans 10:9",
    ...hoodie,
  },
  {
    id: "5",
    name: "Believer Graphic Tee",
    price: 72,
    category: "T-Shirts",
    image: p5,
    description: "Statement graphic tee with hand-drawn typography. Wear your conviction loud.",
    rating: 4.7,
    reviews: 92,
    verse: "Mark 9:23",
    ...tee,
  },
  {
    id: "6",
    name: "Eternity Zip Hoodie",
    price: 156,
    category: "Hoodies",
    image: p6,
    description: "Full-zip hoodie engineered for movement. Luxe weight, eternal style.",
    rating: 4.9,
    reviews: 188,
    verse: "John 3:16",
    ...hoodie,
  },
  {
    id: "7",
    name: "Gold Cross Chain",
    price: 89,
    category: "Accessories",
    image: p7,
    description: "An 18k gold-plated cross pendant on a refined cuban link chain.",
    rating: 5.0,
    reviews: 244,
    verse: "1 Corinthians 1:18",
    ...accessory,
  },
  {
    id: "8",
    name: "Pilgrim Tote Bag",
    price: 54,
    category: "Accessories",
    image: p8,
    description: "Heavyweight canvas tote built to carry your essentials and your faith.",
    rating: 4.8,
    reviews: 61,
    verse: "Hebrews 11:13",
    ...accessory,
  },
];
