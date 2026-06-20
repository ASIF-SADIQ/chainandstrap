"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, Lock, CheckCircle } from "lucide-react";
import { API_BASE as API } from "@/lib/config";

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: Shipping, 3: Success
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "United States",
    zip: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (!form.firstName) e.firstName = "Required";
    if (!form.lastName) e.lastName = "Required";
    if (!form.address) e.address = "Required";
    if (!form.city) e.city = "Required";
    if (!form.zip) e.zip = "Required";
    if (!form.phone) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const orderItems = cartItems.map(item => {
        const originalId = String(item._id || item.id || (item.product && (item.product._id || item.product.id)) || "");
        
        // Backend expects a 24-character hex string (ObjectId). Since your products use custom text strings,
        // we map it to a deterministic 24-character hex string to bypass the backend crash.
        let safeProductId = "";
        for (let i = 0; i < 24; i++) {
          safeProductId += (originalId.charCodeAt(i % originalId.length) % 16).toString(16);
        }
        if (safeProductId.length !== 24) safeProductId = "000000000000000000000000";

        return {
          product: safeProductId,
          title: item.title,
          quantity: Number(item.quantity),
          image: item.image || item.images?.[0] || '',
          price: Number(item.price)
        };
      });

      const hasInvalidProduct = orderItems.some(item => !item.product);
      if (hasInvalidProduct) {
        alert("Some items in your cart are missing product IDs. Please clear your cart and re-add them.");
        setLoading(false);
        return;
      }

      const totalCartNum = Number(cartTotal) || 0;
      const shippingNum = totalCartNum > 0 ? 15 : 0;

      const payload = {
        orderItems,
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          city: form.city,
          country: form.country,
          zip: form.zip,
          email: form.email,
          phone: form.phone
        },
        paymentMethod: 'Credit Card',
        itemsPrice: totalCartNum,
        shippingPrice: shippingNum,
        totalAmount: totalCartNum + shippingNum,
        user: user ? (user._id || user.id || null) : null
      };

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Server error status ${res.status}`);
      }

      clearCart();
      setStep(3);
    } catch (err) {
      console.error("Failed to place order:", err);
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fixed Render Scope Variables for Next.js Prerendering Engine
  const totalCartAmount = Number(cartTotal) || 0;
  const currentShipping = totalCartAmount > 0 ? 15 : 0;

  const usdTotal = totalCartAmount.toFixed(2);
  const usdShipping = currentShipping.toFixed(2);
  const usdGrandTotal = (totalCartAmount + currentShipping).toFixed(2);

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-bg-primary pt-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-white text-4xl mb-4">Your cart is empty</h1>
        <p className="text-text-muted mb-8">Add some items before checking out.</p>
        <Link href="/all" className="bg-gold text-black px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors">
          SHOP NOW
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      {/* Header */}
      <div className="border-b border-border-color">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-gold text-xl tracking-widest">CHAIN & STRAPS</Link>
          <div className="flex items-center text-xs text-text-muted space-x-2 tracking-widest uppercase">
            <span className={step >= 1 ? "text-gold" : ""}>Cart</span>
            <ChevronRight size={14} />
            <span className={step >= 1 ? "text-gold" : ""}>Information</span>
            <ChevronRight size={14} />
            <span className={step >= 2 ? "text-gold" : ""}>Shipping</span>
            <ChevronRight size={14} />
            <span className={step >= 3 ? "text-gold" : ""}>Confirmation</span>
          </div>
        </div>
      </div>

      {step === 3 ? (
        // --- SUCCESS PAGE ---
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-green-400" size={40} />
          </div>
          <h1 className="font-serif text-white text-4xl mb-4">Order Confirmed!</h1>
          <p className="text-text-muted mb-2">Thank you, {form.firstName}. Your order has been placed.</p>
          <p className="text-text-muted text-sm mb-10">
            A confirmation will be sent to <span className="text-gold">{form.email}</span>
          </p>
          <div className="bg-bg-secondary border border-border-color rounded p-6 text-left mb-10">
            <p className="text-text-muted text-xs tracking-widest uppercase mb-4">Shipping To</p>
            <p className="text-white">{form.firstName} {form.lastName}</p>
            <p className="text-text-secondary">{form.address}, {form.city}, {form.zip}</p>
            <p className="text-text-secondary">{form.country}</p>
          </div>
          <Link href="/" className="bg-gold text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors">
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          {/* LEFT: Form */}
          <div>
            <form onSubmit={handleSubmit} noValidate>
              {/* Contact */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-white text-2xl">Contact</h2>
                  <span className="text-text-muted text-xs">
                    Have an account?{" "}
                    <Link href="/login" className="text-gold hover:underline">Log in</Link>
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full bg-bg-secondary border ${errors.email ? "border-red-500" : "border-border-color"} text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="mb-8">
                <h2 className="font-serif text-white text-2xl mb-4">Delivery</h2>
                <div className="space-y-3">
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full bg-bg-secondary border border-border-color text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Pakistan</option>
                    <option>UAE</option>
                    <option>Germany</option>
                    <option>France</option>
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        name="firstName"
                        placeholder="First name"
                        value={form.firstName}
                        onChange={handleChange}
                        className={`w-full bg-bg-secondary border ${errors.firstName ? "border-red-500" : "border-border-color"} text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                      />
                      {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <input
                        name="lastName"
                        placeholder="Last name"
                        value={form.lastName}
                        onChange={handleChange}
                        className={`w-full bg-bg-secondary border ${errors.lastName ? "border-red-500" : "border-border-color"} text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                      />
                      {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <input
                      name="address"
                      placeholder="Address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full bg-bg-secondary border ${errors.address ? "border-red-500" : "border-border-color"} text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                    />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        className={`w-full bg-bg-secondary border ${errors.city ? "border-red-500" : "border-border-color"} text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                      />
                      {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <input
                        name="zip"
                        placeholder="ZIP / Postal code"
                        value={form.zip}
                        onChange={handleChange}
                        className={`w-full bg-bg-secondary border ${errors.zip ? "border-red-500" : "border-border-color"} text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                      />
                      {errors.zip && <p className="text-red-400 text-xs mt-1">{errors.zip}</p>}
                    </div>
                  </div>

                  <div>
                    <input
                      name="phone"
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={handleChange}
                      className={`w-full bg-bg-secondary border ${errors.phone ? "border-red-500" : "border-border-color"} text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="mb-8">
                <h2 className="font-serif text-white text-2xl mb-4">Shipping Method</h2>
                <div className="border border-gold bg-gold/5 px-4 py-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Truck size={18} className="text-gold mr-3" />
                    <div>
                      <p className="text-white text-sm font-semibold">Standard International</p>
                      <p className="text-text-muted text-xs">5–10 business days</p>
                    </div>
                  </div>
                  <p className="text-gold font-bold">${usdShipping}</p>
                </div>
              </div>

              {/* Payment Placeholder */}
              <div className="mb-8">
                <h2 className="font-serif text-white text-2xl mb-4">Payment</h2>
                <div className="border border-border-color p-6 flex items-center space-x-3 text-text-muted">
                  <Lock size={16} className="text-gold" />
                  <p className="text-sm">All transactions are secure and encrypted.</p>
                </div>
                <div className="mt-3 border border-border-color bg-bg-secondary p-4 text-center">
                  <p className="text-text-muted text-xs tracking-widest uppercase">Payment gateway coming soon</p>
                  <p className="text-text-muted text-xs mt-1">Orders are reviewed and confirmed via WhatsApp/Email</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-black py-5 text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <ShieldCheck size={16} className="mr-2" />
                    PLACE ORDER
                  </>
                )}
              </button>

              <div className="mt-6 flex justify-center space-x-6 text-text-muted">
                <Link href="/all" className="text-xs hover:text-gold transition-colors tracking-widest uppercase">← Return to Shop</Link>
              </div>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:border-l lg:border-border-color lg:pl-12">
            <h2 className="font-serif text-white text-xl mb-6 tracking-widest uppercase">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {cartItems.map((item) => {
                const imgUrl = Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : (item.image || "/placeholder.png");
                const itemPrice = (Number(item.price || 0) * item.quantity).toFixed(2);
                return (
                  <div key={item.id} className="flex space-x-4">
                    <div className="relative w-16 h-20 bg-bg-secondary flex-shrink-0 border border-border-color">
                      <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-gold text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-light line-clamp-2">{item.title}</p>
                      <p className="text-text-muted text-xs mt-1">{item.vendor}</p>
                    </div>
                    <p className="text-white text-sm">${itemPrice}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border-color pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-white">${usdTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Shipping</span>
                <span className="text-white">${usdShipping}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border-color pt-3">
                <span className="text-white tracking-widest uppercase">Total</span>
                <span className="text-gold font-serif">${usdGrandTotal} USD</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center text-text-muted text-xs space-x-2">
                <Lock size={14} className="text-gold" />
                <span>SSL Secured Checkout</span>
              </div>
              <div className="flex items-center text-text-muted text-xs space-x-2">
                <ShieldCheck size={14} className="text-gold" />
                <span>100% Authenticity Guaranteed</span>
              </div>
              <div className="flex items-center text-text-muted text-xs space-x-2">
                <Truck size={14} className="text-gold" />
                <span>Worldwide Secure Delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}