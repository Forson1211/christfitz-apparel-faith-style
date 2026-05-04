import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/_site/terms")({
  component: () => (
    <StaticPage title="Terms" eyebrow="Legal">
      <section className="space-y-6">
        <h2 className="text-cocoa font-display text-2xl">Usage & Agreement</h2>
        <p>
          By accessing or using the ChristFitz Apparel website, you agree to be bound by these terms
          and conditions.
        </p>
        <h3 className="text-cocoa font-bold">Intellectual Property</h3>
        <p>
          All designs, logos, and content on this site are the property of ChristFitz Apparel.
          Unauthorized use of our artwork or branding is strictly prohibited.
        </p>
        <h3 className="text-cocoa font-bold">Product Availability</h3>
        <p>
          While we strive for accuracy, we cannot guarantee that all items will be in stock at all
          times. We reserve the right to limit quantities or cancel orders at our discretion.
        </p>
        <h3 className="text-cocoa font-bold">Pricing</h3>
        <p>
          Prices are shown in GH₵ and are subject to change without notice. Shipping costs are
          calculated at checkout.
        </p>
      </section>
    </StaticPage>
  ),
});
