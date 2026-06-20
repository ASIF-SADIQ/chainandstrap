export default function Loading() {
  return (
    <div className="fixed inset-0 bg-bg-primary z-[100] flex flex-col items-center justify-center">
      <div className="relative">
        <h1 className="font-serif text-gold text-3xl md:text-5xl tracking-widest uppercase opacity-20">
          Chain <span className="italic font-light">&</span> Straps
        </h1>
        <div className="absolute inset-0 flex overflow-hidden">
          <h1 className="font-serif text-gold text-3xl md:text-5xl tracking-widest uppercase whitespace-nowrap animate-shimmer" style={{
            background: "linear-gradient(90deg, transparent 0%, #c9a96e 50%, transparent 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Chain <span className="italic font-light">&</span> Straps
          </h1>
        </div>
      </div>
      <div className="mt-8 h-px w-24 bg-border-color overflow-hidden">
        <div className="h-full w-full bg-gold animate-progress"></div>
      </div>
    </div>
  );
}
