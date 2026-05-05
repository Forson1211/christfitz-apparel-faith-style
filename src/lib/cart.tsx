import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type { DBProduct } from "./site";
import { resolveImage } from "./assetMap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
  size?: string;
}

export type AppliedDiscount = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
};

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: DBProduct | CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  discount: AppliedDiscount | null;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => void;
  discountAmount: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cf_cart_v3";

function toCartItem(p: DBProduct | CartItem): CartItem {
  if ("quantity" in p) return p;
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image: resolveImage(p.image_url),
    quantity: 1,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || []);
        setDiscount(parsed.discount || null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, discount }));
    } catch {}
  }, [items, discount]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((o: boolean) => !o), []);

  const addItem = useCallback((product: DBProduct | CartItem) => {
    const item = toCartItem(product);
    setItems((prev: CartItem[]) => {
      const found = prev.find((i: CartItem) => i.id === item.id);
      if (found)
        return prev.map((i: CartItem) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, item];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev: CartItem[]) => prev.filter((i: CartItem) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems((prev: CartItem[]) =>
      qty <= 0
        ? prev.filter((i: CartItem) => i.id !== id)
        : prev.map((i: CartItem) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setDiscount(null);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((s: number, i: CartItem) => s + i.quantity * i.price, 0),
    [items]
  );

  const applyDiscount = async (code: string) => {
    const { data, error } = await (supabase as any)
      .from("discounts")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("active", true)
      .single();

    if (error || !data) {
      toast.error("Invalid or inactive discount code.");
      return false;
    }

    if (data.uses >= data.max_uses) {
      toast.error("This discount code has reached its usage limit.");
      return false;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("This discount code has expired.");
      return false;
    }

    if (subtotal < data.min_order) {
      toast.error(`Minimum order of ₵${data.min_order} required for this code.`);
      return false;
    }

    setDiscount({
      id: data.id,
      code: data.code,
      type: data.type,
      value: data.value,
    });
    toast.success(`Discount code "${data.code}" applied!`);
    return true;
  };

  const removeDiscount = () => setDiscount(null);

  const { discountAmount, total, count } = useMemo(() => {
    let amt = 0;
    if (discount) {
      if (discount.type === "percent") {
        amt = subtotal * (discount.value / 100);
      } else {
        amt = discount.value;
      }
    }
    return {
      discountAmount: amt,
      total: Math.max(0, subtotal - amt),
      count: items.reduce((s: number, i: CartItem) => s + i.quantity, 0),
    };
  }, [subtotal, discount, items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        count,
        subtotal,
        discount,
        applyDiscount,
        removeDiscount,
        discountAmount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
