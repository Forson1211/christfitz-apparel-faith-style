import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/_site/shipping")({
  component: () => (
    <StaticPage title="Shipping" eyebrow="Support">
      <section className="space-y-6">
        <h2 className="text-cocoa font-display text-2xl">Delivery & Care</h2>
        <p>
          We take great care in packaging your pieces to ensure they arrive in perfect condition. 
          Each order is a blessing, and we treat it as such.
        </p>
        <h3 className="text-cocoa font-bold">Domestic Shipping (Ghana)</h3>
        <p>
          Orders within Accra are usually delivered within 1-2 business days. Outside Accra, 
          please allow 3-5 business days for delivery via our trusted courier partners.
        </p>
        <h3 className="text-cocoa font-bold">International Shipping</h3>
        <p>
          We ship globally! International delivery times vary by destination, typically taking 
          7-14 business days.
        </p>
        <h3 className="text-cocoa font-bold">Returns & Exchanges</h3>
        <p>
          If you are not completely satisfied with your purchase, you may return unworn items 
          in their original packaging within 14 days of delivery for an exchange or store credit.
        </p>
      </section>
    </StaticPage>
  )
});
