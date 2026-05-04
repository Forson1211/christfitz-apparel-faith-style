import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/_site/privacy")({
  component: () => (
    <StaticPage title="Privacy" eyebrow="Legal">
      <section className="space-y-6">
        <h2 className="text-cocoa font-display text-2xl">Your Data is Sacred</h2>
        <p>
          At ChristFitz Apparel, we respect your privacy as much as we respect our craft. This
          policy outlines how we handle your personal information.
        </p>
        <h3 className="text-cocoa font-bold">Information Collection</h3>
        <p>
          We collect information you provide directly to us when you make a purchase, sign up for
          our newsletter, or contact our support team. This may include your name, email address,
          shipping address, and payment information.
        </p>
        <h3 className="text-cocoa font-bold">How We Use Your Data</h3>
        <p>
          We use your information to process orders, communicate with you about your purchase, and
          (with your permission) send you updates about new collections and spiritual insights.
        </p>
        <h3 className="text-cocoa font-bold">Security</h3>
        <p>
          We implement industry-standard security measures to protect your data. We never sell your
          personal information to third parties.
        </p>
      </section>
    </StaticPage>
  ),
});
