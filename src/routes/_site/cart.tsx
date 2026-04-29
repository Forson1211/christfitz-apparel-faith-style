import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/_site/cart")({
  head: () => ({
    meta: [
      { title: "Cart — ChristFitz Apparel" },
      { name: "description", content: "Review your selected pieces." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, clear } = useCart();
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shipping;

  return (
    <section className="pt-36 pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Your bag</p>
          <h1 className="mt-3 font-display text-5xl sm:text-7xl">Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-cocoa/5">
              <ShoppingBag className="h-10 w-10 text-cocoa/40" />
            </div>
            <h2 className="mt-6 font-display text-3xl">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">Discover pieces crafted with intention.</p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cocoa px-7 py-3.5 text-sm font-medium text-cream transition hover:bg-coffee"
            >
              Shop the collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            <ul className="flex flex-col divide-y divide-cocoa/10 rounded-3xl glass p-2 sm:p-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                    className="flex gap-4 p-4 sm:p-5"
                  >
                    <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-cocoa/5">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-medium">{item.name}</h3>
                          <p className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="grid h-9 w-9 place-items-center rounded-full text-cocoa/50 transition hover:bg-cocoa/5 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-cocoa/15">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-cocoa/5"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-cocoa/5"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-medium tabular-nums">₵{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              <div className="flex justify-between p-4">
                <button onClick={clear} className="text-xs uppercase tracking-widest text-cocoa/60 hover:text-cocoa">
                  Clear cart
                </button>
                <Link to="/products" className="text-xs uppercase tracking-widest text-cocoa/60 hover:text-cocoa">
                  Continue shopping
                </Link>
              </div>
            </ul>

            <div className="h-fit rounded-3xl bg-cocoa p-7 text-cream shadow-luxe">
              <h2 className="font-display text-2xl">Order Summary</h2>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between text-cream/70">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cream/70">
                  <span>Shipping</span>
                  <span className="tabular-nums">{shipping === 0 ? "Free" : `₵${shipping.toFixed(2)}`}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-cream/15 pt-3 font-display text-xl">
                  <span>Total</span>
                  <span className="tabular-nums">₵{total.toFixed(2)}</span>
                </div>
              </div>
              <button className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cream px-6 py-4 text-sm font-medium text-cocoa transition hover:scale-[1.02]">
                Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-[11px] text-cream/60">
                Secure checkout · Free shipping on orders over ₵100
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
