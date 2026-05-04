import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, CheckCircle2, ShieldCheck, Phone } from "lucide-react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

import { usePaystackPayment } from "react-paystack";

export const Route = createFileRoute("/_site/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success

  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shipping;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "momo",
  });

  // Paystack Configuration
  const config = {
    reference: (new Date()).getTime().toString(),
    email: formData.email,
    amount: Math.round(total * 100), // Paystack expects amount in pesewas/cents
    publicKey: "pk_test_b449552cd6346656d517050eb2ec50cdcf768593",
    currency: "GHS",
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${formData.firstName} ${formData.lastName}`,
        },
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: formData.phone,
        }
      ]
    }
  };

  const initializePayment = usePaystackPayment(config as any);

  const onSuccess = async (reference: any) => {
    setLoading(true);
    try {
      const orderData = {
        user_id: user?.id || null,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        total: total,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
          size: item.size,
        })),
        shipping_address: {
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
        },
        status: "paid",
        metadata: { paystack_reference: reference.reference }
      };

      const { error } = await supabase.from("orders").insert([orderData]);

      if (error) throw error;

      clear(); // Clear cart
      setStep(3); // Move to success step
      toast.success("Order placed successfully!");
    } catch (err: any) {
      console.error("Order recording failed:", err);
      toast.error("Payment successful but failed to record order. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    toast.error("Payment cancelled.");
    setLoading(false);
  };

  const handlePlaceOrder = () => {
    if (!formData.email || !formData.phone) {
      toast.error("Please fill in all shipping details first.");
      setStep(1);
      return;
    }
    setLoading(true);
    // @ts-ignore
    initializePayment(onSuccess, onClose);
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center p-6">
        <h2 className="font-display text-3xl">Your cart is empty</h2>
        <button
          onClick={() => navigate({ to: "/products" })}
          className="mt-6 text-gold hover:underline"
        >
          Go back to shop
        </button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="grid h-24 w-24 place-items-center rounded-full bg-gold/10 text-gold"
        >
          <CheckCircle2 className="h-12 w-12" />
        </motion.div>
        <h1 className="mt-8 font-display text-5xl">Thank you!</h1>
        <p className="mt-4 max-w-md text-muted-foreground text-lg">
          Your order has been received. We've sent a confirmation email to{" "}
          <span className="text-cocoa font-medium">{formData.email}</span>.
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-10 rounded-full bg-cocoa px-8 py-4 text-sm font-medium text-cream transition hover:scale-105"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/30 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr]">
          {/* Left Column: Forms */}
          <div className="space-y-8">
            <button
              onClick={() => navigate({ to: "/cart" })}
              className="flex items-center gap-2 text-sm text-cocoa/60 hover:text-cocoa transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to cart
            </button>

            <div className="flex items-center gap-4 border-b border-cocoa/10 pb-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-display ${step >= 1 ? "bg-cocoa text-cream" : "bg-cocoa/10 text-cocoa"}`}
              >
                1
              </div>
              <span className="font-display text-xl">Shipping</span>
              <div className="h-px w-12 bg-cocoa/10" />
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-display ${step >= 2 ? "bg-cocoa text-cream" : "bg-cocoa/10 text-cocoa"}`}
              >
                2
              </div>
              <span className="font-display text-xl opacity-50">Payment</span>
            </div>

            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-cocoa/60 font-bold">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full rounded-2xl border border-cocoa/10 bg-white px-5 py-3.5 outline-none focus:border-gold transition-colors"
                      placeholder="Kofi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-cocoa/60 font-bold">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full rounded-2xl border border-cocoa/10 bg-white px-5 py-3.5 outline-none focus:border-gold transition-colors"
                      placeholder="Ansah"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cocoa/60 font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl border border-cocoa/10 bg-white px-5 py-3.5 outline-none focus:border-gold transition-colors"
                    placeholder="kofi@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cocoa/60 font-bold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-2xl border border-cocoa/10 bg-white px-5 py-3.5 outline-none focus:border-gold transition-colors"
                    placeholder="024 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cocoa/60 font-bold">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-2xl border border-cocoa/10 bg-white px-5 py-3.5 outline-none focus:border-gold transition-colors"
                    placeholder="Street Address, Apartment, etc."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cocoa/60 font-bold">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-2xl border border-cocoa/10 bg-white px-5 py-3.5 outline-none focus:border-gold transition-colors"
                    placeholder="Accra"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.firstName || !formData.address || !formData.email}
                  className="w-full rounded-full bg-cocoa py-5 text-sm font-medium text-cream shadow-luxe transition hover:bg-coffee disabled:opacity-50"
                >
                  Continue to Payment
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-widest text-cocoa/60 font-bold">
                    Select Payment Method
                  </label>

                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: "momo" })}
                    className={`flex items-center gap-4 cursor-pointer rounded-2xl border p-5 transition-all ${formData.paymentMethod === "momo" ? "border-gold bg-gold/5 shadow-sm" : "border-cocoa/10 hover:border-cocoa/30"}`}
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-cocoa">Mobile Money</p>
                      <p className="text-xs text-cocoa/50">MTN, Vodafone, or AirtelTigo</p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === "momo" ? "border-gold" : "border-cocoa/20"}`}
                    >
                      {formData.paymentMethod === "momo" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-gold" />
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                    className={`flex items-center gap-4 cursor-pointer rounded-2xl border p-5 transition-all ${formData.paymentMethod === "card" ? "border-gold bg-gold/5 shadow-sm" : "border-cocoa/10 hover:border-cocoa/30"}`}
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-cocoa">Card Payment</p>
                      <p className="text-xs text-cocoa/50">Visa or Mastercard</p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === "card" ? "border-gold" : "border-cocoa/20"}`}
                    >
                      {formData.paymentMethod === "card" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-gold" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-cocoa/5 border border-cocoa/10 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-cocoa/70">
                      Your payment is secured by our 256-bit SSL encrypted system. For Momo
                      payments, you will receive a prompt on your phone after clicking place order.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full rounded-full bg-cocoa py-5 text-sm font-medium text-cream shadow-luxe transition hover:bg-coffee disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : `Place Order (₵${total.toFixed(2)})`}
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="h-fit space-y-6 lg:sticky lg:top-32">
            <div className="rounded-3xl glass p-8">
              <h2 className="font-display text-2xl mb-6">Order Summary</h2>
              <div className="space-y-4 mb-8 max-h-[300px] overflow-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cocoa/5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-cocoa/40">
                        {item.quantity} × ₵{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-medium self-center tabular-nums">
                      ₵{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-cocoa/10 pt-6">
                <div className="flex justify-between text-sm text-cocoa/60">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-cocoa">
                    ₵{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-cocoa/60">
                  <span>Shipping</span>
                  <span className="tabular-nums font-medium text-cocoa">
                    {shipping === 0 ? "FREE" : `₵${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-display pt-3 border-t border-cocoa/10">
                  <span>Total</span>
                  <span className="tabular-nums">₵{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs text-cocoa/40">
                  <Truck className="h-4 w-4" />
                  Standard Delivery (3-5 Business Days)
                </div>
                <div className="flex items-center gap-3 text-xs text-cocoa/40">
                  <ShieldCheck className="h-4 w-4" />
                  30-Day Devotion Guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
