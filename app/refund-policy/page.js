export const metadata = {
  title: "Return & Refund Policy | Chain & Straps",
  description: "Chain & Straps return and refund policy. Learn how to return products and get refunds.",
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-serif text-white text-xl mb-4 pb-3 border-b border-border-color">{title}</h2>
    <div className="text-text-muted text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function RefundPolicyPage() {
  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <div className="border-b border-border-color">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Legal</p>
          <h1 className="font-serif text-white text-5xl font-light mb-4">Return &amp; Refund Policy</h1>
          <p className="text-text-muted text-sm">Last updated: May 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        <Section title="Our Commitment">
          <p>At <strong className="text-white">Chain &amp; Straps</strong>, your satisfaction is our highest priority. We stand behind every product we sell and are committed to ensuring you have a seamless luxury experience — from browsing to delivery.</p>
        </Section>

        <Section title="Cancellation">
          <p>You may cancel your order within <strong className="text-white">12 hours</strong> of placing it. To cancel, contact us immediately at <a href="mailto:chainandstrap@gmail.com" className="text-gold hover:underline">chainandstrap@gmail.com</a> with your order number and reason.</p>
          <p>Cancellations cannot be processed once the order has been dispatched.</p>
        </Section>

        <Section title="Return Eligibility">
          <p>We accept returns within <strong className="text-white">14 days</strong> of delivery, provided the item meets the following conditions:</p>
          <ul className="list-none space-y-2 mt-3">
            {[
              "Item must be unused and in its original condition",
              "Original packaging, dust bags, tags, and authenticity cards must be intact",
              "Item must not have been worn, altered, or damaged",
              "Proof of purchase (order confirmation) must be provided",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-gold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Non-Returnable Items">
          <p>The following items are <strong className="text-white">not eligible</strong> for returns:</p>
          <ul className="list-none space-y-2 mt-3">
            {[
              "Items showing signs of wear, use, or alteration",
              "Items returned without original packaging",
              "Sale or discounted items (marked as Final Sale)",
              "Custom or personalized orders",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How to Return">
          <p>To initiate a return:</p>
          <ol className="list-none space-y-3 mt-3 counter-reset-list">
            {[
              'Email us at chainandstrap@gmail.com with your order number and photos of the item',
              'Our team will review your request within 2 business days',
              'If approved, you will receive return shipping instructions',
              'Ship the item back — return shipping costs are the customer\'s responsibility',
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-gold font-bold w-5 flex-shrink-0">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Refund Process">
          <p>Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund.</p>
          <p>If approved, your refund will be processed within <strong className="text-white">5–10 business days</strong> to your original payment method. Shipping costs are <strong className="text-white">non-refundable</strong>.</p>
        </Section>

        <Section title="Late or Missing Refunds">
          <p>If you have not received your refund within 10 business days, please:</p>
          <p>1. Check your bank account again<br />2. Contact your bank or card provider<br />3. If still not received, email us at <a href="mailto:chainandstrap@gmail.com" className="text-gold hover:underline">chainandstrap@gmail.com</a></p>
        </Section>

        <div className="bg-bg-secondary border border-gold/30 p-6 text-center">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">Questions?</p>
          <p className="text-text-muted text-sm mb-4">Our team is here to help resolve any concerns quickly and professionally.</p>
          <a href="mailto:chainandstrap@gmail.com" className="text-gold font-semibold hover:underline">chainandstrap@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
