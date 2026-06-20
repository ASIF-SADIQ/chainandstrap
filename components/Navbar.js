"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X, User, LogOut, Settings, Package, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import SearchOverlay from "./SearchOverlay";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "ALL PRODUCTS", href: "/all" },
    { name: "BRANDS", href: "/all" },
    { name: "BAGS", href: "/category/bags" },
    { name: "SHOES", href: "/category/shoes" },
    { name: "WATCHES", href: "/category/watches" },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Get user initials for avatar
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-black border-b border-gold py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button className="md:hidden text-text-primary" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="font-serif text-gold text-2xl tracking-widest uppercase">
              Chain <span className="italic font-light">&</span> Straps
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}
                className="text-sm tracking-widest hover:text-gold transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            {/* Search */}
            <button onClick={() => setIsSearchOpen(true)}
              className="text-text-primary hover:text-gold transition-colors">
              <Search size={22} />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="text-text-primary hover:text-gold transition-colors relative">
              <Heart size={22} />
              {wishlistItems && wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-bg-primary text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* User / Auth Icon */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                // Logged in — show avatar with dropdown
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 group"
                  title={user.name}
                >
                  <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center text-xs font-bold tracking-wider group-hover:bg-[#e8c98a] transition-colors">
                    {initials}
                  </div>
                </button>
              ) : (
                // Not logged in — show person icon
                <Link href="/login"
                  className="text-text-primary hover:text-gold transition-colors"
                  title="Sign In">
                  <User size={22} />
                </Link>
              )}

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 bg-bg-secondary border border-border-color shadow-2xl z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border-color">
                      <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-text-muted text-xs truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[9px] bg-gold/20 text-gold px-2 py-0.5 tracking-widest uppercase">
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link href="/account" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-text-secondary text-sm hover:text-gold hover:bg-white/5 transition-colors">
                        <Package size={15} />
                        <span>My Orders</span>
                      </Link>

                      <button onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 text-sm hover:bg-white/5 transition-colors border-t border-border-color mt-1">
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button onClick={() => setIsCartOpen(true)}
              className="text-text-primary hover:text-gold transition-colors relative">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-bg-primary text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-bg-primary border-r border-border-color z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-gold text-xl tracking-widest uppercase">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
              </div>

              {/* Mobile User Info */}
              {user ? (
                <div className="flex items-center space-x-3 mb-8 p-3 bg-bg-secondary border border-border-color">
                  <div className="w-10 h-10 bg-gold text-black rounded-full flex items-center justify-center text-sm font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user.name}</p>
                    <p className="text-text-muted text-xs">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3 mb-8">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center border border-gold text-gold py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-gold/10 transition-colors">
                    SIGN IN
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center bg-gold text-black py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors">
                    REGISTER
                  </Link>
                </div>
              )}

              <nav className="flex flex-col space-y-5">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg tracking-widest hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Logout */}
              {user && (
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="mt-auto flex items-center space-x-2 text-red-400 text-sm py-4 border-t border-border-color">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
