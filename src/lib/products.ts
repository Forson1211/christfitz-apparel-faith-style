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
}

export const products: Product[] = [
  { id: "1", name: "Grace Oversized Tee", price: 68, category: "T-Shirts", image: p1 },
  { id: "2", name: "Cocoa Cross Hoodie", price: 142, category: "Hoodies", image: p2 },
  { id: "3", name: "Faith Knit Beanie", price: 38, category: "Accessories", image: p3 },
  { id: "4", name: "Salvation Crewneck", price: 118, category: "Hoodies", image: p4 },
  { id: "5", name: "Believer Graphic Tee", price: 72, category: "T-Shirts", image: p5 },
  { id: "6", name: "Eternity Zip Hoodie", price: 156, category: "Hoodies", image: p6 },
  { id: "7", name: "Gold Cross Chain", price: 89, category: "Accessories", image: p7 },
  { id: "8", name: "Pilgrim Tote Bag", price: 54, category: "Accessories", image: p8 },
];
