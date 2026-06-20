export const metadata = {
  title: "Privacy Policy | Chain & Straps",
  description: "Chain & Straps privacy policy. How we collect, use, and protect your personal information.",
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-serif text-white text-xl mb-4 pb-3 border-b border-border-color">{title}</h2>
    <div className="text-text-muted text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <div className="border-b border-border-color">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Legal</p>
          <h1 className="font-serif text-white text-5xl font-light mb-4">Privacy Policy</h1>
          <p className="text-text-muted text-sm">Last updated: May 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        <Section title="Introduction">
          <p><strong className="text-white">Chain &amp; Straps</strong> ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.</p>
          <p>By using our website, you agree to the terms of this Privacy Policy.</p>
        </Section>

        <Section title="Information We Collect">
          <p>We collect information you provide directly to us, including:</p>
          <ul className="space-y-2 mt-2">
            {[
              "Name, email address, and password (account registration)",
              "Billing and shipping address",
              "Phone number (optional)",
              "Payment information (processed securely — we do not store card details)",
              "Order history and preferences",
              "Communications with our support team",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-gold">•</span><span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="space-y-2 mt-2">
            {[
              "Process and fulfill your orders",
              "Send transactional emails (order confirmation, shipping updates)",
              "Verify your identity and secure your account via OTP",
              "Provide customer support",
              "Improve our products, services, and website experience",
              "Comply with legal obligations",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-gold">•</span><span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Data Security">
          <p>We take data security seriously. All passwords are <strong className="text-white">bcrypt-hashed</strong> and never stored in plaintext. All OTPs are hashed before database storage. Our website uses <strong className="text-white">HTTPS/SSL encryption</strong> for all data transmission.</p>
          <p>While we implement industry-standard security measures, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.</p>
        </Section>

        <Section title="Sharing of Information">
          <p>We do <strong className="text-white">not sell, trade, or rent</strong> your personal information to third parties. We may share data only with:</p>
          <ul className="space-y-2 mt-2">
            {[
              "Shipping carriers (to fulfill your order)",
              "Email service providers (to send transactional emails)",
              "Legal authorities (if required by law)",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-gold">•</span><span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Cookies">
          <p>We use cookies and similar technologies to enhance your browsing experience, remember your cart, and analyze website traffic. You can control cookie settings through your browser preferences.</p>
        </Section>

        <Section title="Your Rights">
          <p>You have the right to:</p>
          <ul className="space-y-2 mt-2">
            {[
              "Access the personal information we hold about you",
              "Request correction of inaccurate data",
              "Request deletion of your account and data",
              "Withdraw consent for marketing communications",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-gold">•</span><span>{item}</span>
              </li>
            ))}
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:chainandstrap@gmail.com" className="text-gold hover:underline">chainandstrap@gmail.com</a>.</p>
        </Section>

        <Section title="Children's Privacy">
          <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.</p>
        </Section>

        <div className="bg-bg-secondary border border-gold/30 p-6 text-center">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">Contact</p>
          <p className="text-text-muted text-sm mb-4">For privacy-related inquiries, please contact us at:</p>
          <a href="mailto:chainandstrap@gmail.com" className="text-gold font-semibold hover:underline">chainandstrap@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
