import { createFileRoute } from "@tanstack/react-router";
import { Products } from "@/components/site/Products";
import { Newsletter } from "@/components/site/Newsletter";

export const Route = createFileRoute("/_site/products")({
  head: () => ({
    meta: [
      { title: "Shop — ChristFitz Apparel" },
      { name: "description", content: "Shop premium Christian streetwear: tees, hoodies, and accessories." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <>
      <div className="pt-32 pb-4 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Shop</p>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">All Pieces</h1>
      </div>
      <Products />
      <Newsletter />
    </>
  );
}
