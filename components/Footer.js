"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="bg-bg-secondary border-t border-border-color pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1 — Brand */}
          <div>
            <h2 className="font-serif text-gold text-2xl tracking-[0.4em] uppercase mb-6">Chain&Straps</h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Curated pieces from the world's most iconic maisons. Redefining luxury for the modern era.
            </p>
            <div className="flex space-x-4 text-text-muted">
              <a href="#" className="hover:text-gold transition-colors"><Instagram size={20} /></a>
              <a href="https://pinterest.com/chainandstrap" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-gold transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-gold transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h3 className="font-serif text-white tracking-widest uppercase mb-6 text-sm">Quick Links</h3>
            <ul className="space-y-3 text-text-secondary text-sm">
              <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link href="/all" className="hover:text-gold transition-colors">All Products</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Col 3 — Policies */}
          <div>
            <h3 className="font-serif text-white tracking-widest uppercase mb-6 text-sm">Policies</h3>
            <ul className="space-y-3 text-text-secondary text-sm">
              <li><Link href="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-gold transition-colors">Return &amp; Refund</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-gold transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h3 className="font-serif text-white tracking-widest uppercase mb-6 text-sm">Newsletter</h3>
            <p className="text-text-secondary text-sm mb-4">Subscribe for exclusive deals and new arrivals.</p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address"
                className="bg-bg-primary border border-border-color px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
              <button type="submit" className="luxury-button py-3 text-xs font-bold">Subscribe</button>
            </form>
            <p className="text-text-muted text-xs mt-4">
              Questions? <a href="mailto:chainandstrap@gmail.com" className="text-gold hover:underline">chainandstrap@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="border-t border-border-color pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Chain&amp;Straps. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Returns</Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <a href="/admin" 
              className="text-gold hover:underline font-semibold ml-auto">
              🔐 Admin Portal
            </a>
          </div>
        </div>
      </div>
    </footer>

  );
}
