import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-gold text-8xl md:text-[120px] font-light mb-8 opacity-20">404</h1>
      <h2 className="font-serif text-white text-3xl md:text-5xl mb-6 tracking-widest uppercase">
        Piece Not Found
      </h2>
      <p className="text-text-secondary text-sm md:text-base tracking-[0.2em] uppercase max-w-lg mb-12">
        THIS PIECE IS NO LONGER IN THE ATELIER OR HAS BEEN ARCHIVED.
      </p>
      <Link 
        href="/all" 
        className="bg-transparent border border-gold text-gold px-12 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gold hover:text-bg-primary transition-colors"
      >
        RETURN TO COLLECTIONS
      </Link>
    </div>
  );
}
