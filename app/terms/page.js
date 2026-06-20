export const metadata = {
  title: "Terms of Service | Chain & Straps",
};

const Section = ({ number, title, children }) => (
  <div className="mb-10">
    <div className="flex items-start space-x-4 mb-4">
      <span className="text-gold font-serif text-2xl font-light">{number}</span>
      <h2 className="font-serif text-white text-xl pt-0.5">{title}</h2>
    </div>
    <div className="text-text-muted text-sm leading-relaxed space-y-3 pl-8 border-l border-border-color">{children}</div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <div className="border-b border-border-color">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Legal</p>
          <h1 className="font-serif text-white text-5xl font-light mb-4">Terms of Service</h1>
          <p className="text-text-muted text-sm">Last updated: May 2025</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-text-muted text-sm leading-relaxed mb-12">By using chainandstrap.store, you agree to these Terms of Service. Please read carefully.</p>
        <Section number="01" title="Use of Website"><p>You must be 18+ to use this site. You agree to use it only for lawful purposes and not to infringe on others' rights.</p></Section>
        <Section number="02" title="Account Registration"><p>You are responsible for maintaining the confidentiality of your login credentials. Provide accurate information during registration. We may suspend accounts that violate these terms.</p></Section>
        <Section number="03" title="Products & Pricing"><p>Prices are in USD and subject to change. We reserve the right to cancel orders placed at incorrect prices and notify customers.</p></Section>
        <Section number="04" title="Orders & Payment"><p>Payment must be made in full before orders ship. We reserve the right to refuse any order at our discretion. All transactions are SSL encrypted.</p></Section>
        <Section number="05" title="Intellectual Property"><p>All website content — text, images, logos — is owned by Chain &amp; Straps. You may not reproduce or distribute any content without written permission.</p></Section>
        <Section number="06" title="Disclaimer"><p>Our services are provided "as is". Chain &amp; Straps makes no warranties regarding accuracy or reliability of any website content.</p></Section>
        <Section number="07" title="Limitation of Liability"><p>Chain &amp; Straps shall not be liable for any indirect or consequential damages arising from your use of our website or products.</p></Section>
        <Section number="08" title="Changes to Terms"><p>We may update these Terms at any time. Continued use of the website constitutes acceptance of updated terms.</p></Section>
        <Section number="09" title="Contact">
          <p>Questions? Email us: <a href="mailto:chainandstrap@gmail.com" className="text-gold hover:underline">chainandstrap@gmail.com</a></p>
        </Section>
      </div>
    </div>
  );
}
