import { createFileRoute } from "@tanstack/react-router";
import { Collections } from "@/components/site/Collections";
import { Products } from "@/components/site/Products";

export const Route = createFileRoute("/_site/categories")({
  head: () => ({
    meta: [
      { title: "Collections — ChristFitz Apparel" },
      { name: "description", content: "Explore our curated collections of Christian streetwear." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <>
      <div className="pt-32 pb-4 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Curated Drops</p>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">Collections</h1>
      </div>
      <Collections />
      <Products />
    </>
  );
}
