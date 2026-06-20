"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE as API, API_BASE } from "@/lib/config";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage initially
  useEffect(() => {
    const localWishlist = localStorage.getItem("cs_wishlist");
    if (localWishlist) {
      try {
        setWishlistItems(JSON.parse(localWishlist));
      } catch (e) {
        console.error("Failed to parse local wishlist", e);
      }
    }
  }, []);

  // Sync Logic
  useEffect(() => {
    if (user && token) {
      syncWithServer();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  // Persist to local storage whenever wishlistItems change (if not logged in)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cs_wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const syncWithServer = async () => {
    try {
      const localWishlist = JSON.parse(localStorage.getItem("cs_wishlist") || "[]");
      const productIds = localWishlist.map(item => item._id || item.id).filter(Boolean);

      const res = await fetch(`${API}/wishlist/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productIds })
      });
      
      const data = await res.json();
      if (data.success) {
        setWishlistItems(data.wishlist);
        localStorage.removeItem("cs_wishlist"); // Clear local after successful sync
      }
    } catch (err) {
      console.error("Failed to sync wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product) => {
    const productId = product._id || product.id;
    const exists = wishlistItems.some(item => (item._id || item.id) === productId);

    // Optimistic Update
    if (exists) {
      setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
    } else {
      setWishlistItems(prev => [...prev, product]);
    }

    if (user && token) {
      try {
        const res = await fetch(`${API}/wishlist/toggle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
        const data = await res.json();
        if (data.success) {
          // Sync state with server response to ensure full product details
          setWishlistItems(data.wishlist);
        }
      } catch (err) {
        console.error("Failed to toggle wishlist on server", err);
        // Revert optimistic update on failure could be implemented here
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item._id || item.id) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
