import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, count } = useCart();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
        >
          <div className="absolute inset-0 bg-cocoa/70 backdrop-blur-md" onClick={closeCart} aria-hidden />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream text-cocoa shadow-luxe"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-cocoa/10 px-5 sm:px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="font-display text-2xl">Your Cart</h2>
                <span className="rounded-full bg-cocoa/10 px-2 py-0.5 text-xs">{count}</span>
              </div>
              <button onClick={closeCart} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-cocoa/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-cocoa/5">
                    <ShoppingBag className="h-8 w-8 text-cocoa/40" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl">Your cart is empty</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    Discover our latest pieces and wear your faith with style.
                  </p>
                  <button onClick={closeCart} className="mt-6 inline-flex items-center gap-2 rounded-full bg-cocoa px-6 py-3 text-sm font-medium text-cream transition hover:bg-coffee">
                    Continue shopping
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 80 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4"
                      >
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cocoa/5">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="truncate font-medium">{item.name}</h4>
                              <p className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">
                                {item.category}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="grid h-8 w-8 place-items-center rounded-full text-cocoa/50 transition hover:bg-cocoa/5 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="inline-flex items-center rounded-full border border-cocoa/15">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity" className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-cocoa/5">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity" className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-cocoa/5">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-medium tabular-nums">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-cocoa/10 bg-sand/40 px-5 sm:px-6 py-5">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="tabular-nums">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between border-t border-cocoa/10 pt-2 font-display text-lg">
                    <span>Total</span>
                    <span className="tabular-nums">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cocoa px-6 py-4 text-sm font-medium text-cream transition hover:bg-coffee"
                >
                  View cart & checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={closeCart}
                  className="mt-2 w-full rounded-full px-6 py-3 text-xs uppercase tracking-widest text-cocoa/60 transition hover:text-cocoa"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
