export const metadata = {
  title: "Shipping Policy | Chain & Straps",
  description: "Learn about Chain & Straps shipping methods, delivery times, and worldwide shipping options.",
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-serif text-white text-xl mb-4 pb-3 border-b border-border-color">{title}</h2>
    <div className="text-text-muted text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function ShippingPolicyPage() {
  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <div className="border-b border-border-color">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Legal</p>
          <h1 className="font-serif text-white text-5xl font-light mb-4">Shipping Policy</h1>
          <p className="text-text-muted text-sm">Last updated: May 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        <Section title="Order Processing">
          <p>All orders are processed within <strong className="text-white">1–3 business days</strong> after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day.</p>
          <p>You will receive a confirmation email with your order details and tracking information once your order has been dispatched.</p>
        </Section>

        <Section title="Shipping Methods & Delivery Times">
          <div className="bg-bg-secondary border border-border-color rounded p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border-color">
              <div>
                <p className="text-white text-sm font-semibold">Standard International</p>
                <p className="text-xs text-text-muted">Tracked delivery</p>
              </div>
              <div className="text-right">
                <p className="text-gold text-sm font-bold">$15.00</p>
                <p className="text-xs text-text-muted">15–25 business days</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border-color">
              <div>
                <p className="text-white text-sm font-semibold">Express International</p>
                <p className="text-xs text-text-muted">Priority tracked delivery</p>
              </div>
              <div className="text-right">
                <p className="text-gold text-sm font-bold">$35.00</p>
                <p className="text-xs text-text-muted">7–12 business days</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white text-sm font-semibold">Free Shipping</p>
                <p className="text-xs text-text-muted">On orders over $500</p>
              </div>
              <div className="text-right">
                <p className="text-gold text-sm font-bold">FREE</p>
                <p className="text-xs text-text-muted">15–25 business days</p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Worldwide Shipping">
          <p>We ship to <strong className="text-white">180+ countries</strong> worldwide. Delivery times may vary depending on your location and local customs processing.</p>
          <p>Countries we serve include: United States, United Kingdom, Canada, Australia, UAE, Saudi Arabia, Pakistan, Germany, France, and many more.</p>
        </Section>

        <Section title="Customs & Import Duties">
          <p>International orders may be subject to customs fees, import duties, and taxes imposed by the destination country. These charges are the <strong className="text-white">responsibility of the customer</strong> and are not included in our shipping fees.</p>
          <p>We recommend checking your country's customs regulations before placing an order.</p>
        </Section>

        <Section title="Tracking Your Order">
          <p>Once your order is shipped, you will receive a tracking number via email. You can use this number to monitor your shipment's progress in real-time.</p>
          <p>If you have not received your tracking information within 5 business days of placing your order, please contact us at <a href="mailto:chainandstrap@gmail.com" className="text-gold hover:underline">chainandstrap@gmail.com</a>.</p>
        </Section>

        <Section title="Lost or Damaged Shipments">
          <p>In the rare event that your order is lost or arrives damaged, please contact us within <strong className="text-white">7 days</strong> of the expected delivery date. We will work with the courier to resolve the issue and ensure you receive your order or a full refund.</p>
        </Section>

        <div className="bg-bg-secondary border border-gold/30 p-6 text-center">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">Need Help?</p>
          <p className="text-text-muted text-sm mb-4">For any shipping-related inquiries, please reach out to our support team.</p>
          <a href="mailto:chainandstrap@gmail.com" className="text-gold font-semibold hover:underline">chainandstrap@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
