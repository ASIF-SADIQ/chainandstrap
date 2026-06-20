"use client";

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const router = useRouter();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-bg-primary border-l border-border-color z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-border-color">
              <h2 className="font-serif text-gold text-xl tracking-[0.3em] uppercase flex items-center">
                <ShoppingBag className="mr-3" size={20} />
                Your Cart
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-text-secondary hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="tracking-widest uppercase text-sm">Your cart is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="luxury-button-outline px-8 py-3 text-xs mt-4"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  // images is now an array from MongoDB grouping
                  const imgUrl = Array.isArray(item.images) && item.images.length > 0
                    ? item.images[0]
                    : (item.image || "/placeholder.png");

                  const formattedPrice = item.price
                    ? `$${Number(item.price).toFixed(2)}`
                    : "Price on Request";

                  return (
                    <div key={item.id} className="flex space-x-4">
                      <div className="w-24 h-32 relative bg-bg-secondary flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-gold text-[10px] tracking-widest uppercase mb-1">
                              {item.vendor}
                            </p>
                            <Link
                              href={`/product/${item.handle}`}
                              onClick={() => setIsCartOpen(false)}
                              className="text-sm font-light hover:text-gold transition-colors line-clamp-2"
                            >
                              {item.title}
                            </Link>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-text-muted hover:text-red-400 transition-colors ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <div className="flex items-center border border-border-color">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-text-secondary hover:text-white transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 text-xs w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-text-secondary hover:text-white transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-sm">{formattedPrice}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border-color bg-bg-secondary">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm tracking-widest uppercase">Subtotal</span>
                  <span className="text-xl font-serif">${Number(cartTotal).toFixed(2)}</span>
                </div>
                <p className="text-text-muted text-xs mb-6 text-center">
                  Shipping & taxes calculated at checkout
                </p>
                <button
                  onClick={handleCheckout}
                  className="bg-gold text-bg-primary w-full py-4 text-sm font-bold flex justify-center items-center tracking-widest uppercase hover:bg-[#e8c98a] transition-colors"
                >
                  PROCEED TO CHECKOUT
                </button>
                <div className="mt-4 text-center">
                  <button onClick={() => setIsCartOpen(false)} className="text-gold text-xs tracking-widest uppercase hover:underline">
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
