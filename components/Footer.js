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
            <div className="flex space-x-4 text-text-muted items-center">
              <a href="https://instagram.com/chainandstrap" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors"><Instagram size={20} /></a>
              <a href="https://pinterest.com/chainandstrap" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center" title="Pinterest">
                <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.688 0 1.029-.653 2.568-.992 3.992-.283 1.193.598 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.279 1.14c-.038.154-.127.189-.286.115-1.068-.498-1.736-2.073-1.736-3.337 0-2.712 1.97-5.207 5.688-5.207 2.99 0 5.318 2.13 5.318 4.978 0 2.973-1.875 5.367-4.479 5.367-1.129 0-2.193-.585-2.556-1.279l-.693 2.641c-.25.959-.929 2.158-1.385 2.894 1.077.327 2.215.503 3.395.503 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
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
