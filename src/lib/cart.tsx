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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
  size?: string;
}

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
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cf_cart_v2";

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
  // Always start empty to avoid SSR/CSR hydration mismatches; load from storage after mount.
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

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

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((s: number, i: CartItem) => s + i.quantity, 0),
      subtotal: items.reduce((s: number, i: CartItem) => s + i.quantity * i.price, 0),
    }),
    [items],
  );

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
