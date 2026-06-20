const policyLayout = (title, subtitle, children) => (
  <div className="pt-24 min-h-screen bg-bg-primary">
    <div className="border-b border-border-color">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Legal</p>
        <h1 className="font-serif text-white text-5xl font-light mb-4">{title}</h1>
        <p className="text-text-muted text-sm">{subtitle}</p>
      </div>
    </div>
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="prose-policy">
        {children}
      </div>
    </div>
  </div>
);
