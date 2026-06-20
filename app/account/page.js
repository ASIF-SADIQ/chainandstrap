"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE as API } from "@/lib/config";
import { 
  Package, 
  User as UserIcon, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Truck, 
  Box,
  ShoppingBag
} from "lucide-react";

export default function AccountPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [user, loading, router]);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API}/orders/myorders`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, token]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const tabs = [
    { id: "orders", label: "Order History", icon: Package },
    { id: "profile", label: "Profile Details", icon: UserIcon },
    { id: "addresses", label: "Address Book", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-white mb-2 tracking-wide">My Account</h1>
          <p className="text-text-muted text-sm tracking-widest uppercase">
            Welcome back, <span className="text-gold">{user.name}</span>
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-bg-secondary border border-border-color rounded p-4 sticky top-28">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm tracking-widest uppercase transition-colors ${
                        activeTab === tab.id 
                          ? "bg-gold/10 border-l-2 border-gold text-gold" 
                          : "text-text-muted hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight size={14} className={activeTab === tab.id ? "opacity-100" : "opacity-0"} />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-border-color">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-widest"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === "orders" && <OrdersTab orders={orders} loading={ordersLoading} />}
            {activeTab === "profile" && <ProfileTab user={user} />}
            {activeTab === "addresses" && <AddressesTab />}
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Orders Tab Component ---
function OrdersTab({ orders, loading }) {
  if (loading) {
    return <div className="text-center py-20 text-gold animate-pulse">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border-color p-12 text-center">
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="text-gold" size={32} />
        </div>
        <h3 className="font-serif text-2xl text-white mb-2">No Orders Yet</h3>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          You haven't placed any orders yet. Discover our latest collections and find something you love.
        </p>
        <Link 
          href="/all" 
          className="inline-block bg-gold text-black px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map(order => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
}

// --- Order Card with Visual Timeline ---
function OrderCard({ order }) {
  // Timeline Logic
  const stages = [
    { id: 'Pending', label: 'Order Placed', icon: Clock },
    { id: 'Processing', label: 'Processing', icon: Box },
    { id: 'Shipped', label: 'Shipped', icon: Truck },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === order.status);
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="bg-bg-secondary border border-border-color p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-border-color pb-4 mb-6">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
          <p className="text-sm text-white">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Total Amount</p>
          <p className="text-lg font-serif text-gold">${order.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="mb-8 py-4 px-2 overflow-x-auto">
        <div className="min-w-[400px] flex items-center justify-between relative">
          {/* Connecting Line Base */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#222] z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gold z-0 transition-all duration-500"
            style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
          ></div>

          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index <= activeIndex;
            const isCurrent = index === activeIndex;

            return (
               <div key={stage.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    isCompleted 
                      ? 'bg-gold border-gold text-black' 
                      : 'bg-bg-secondary border-[#444] text-[#666]'
                  } ${isCurrent && 'ring-4 ring-gold/20'}`}
                >
                  <Icon size={18} />
                </div>
                <p className={`mt-3 text-[10px] tracking-widest uppercase font-bold ${isCompleted ? 'text-gold' : 'text-[#666]'}`}>
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex items-center space-x-4 bg-bg-primary p-3 border border-border-color">
            <div className="w-16 h-16 bg-[#111] border border-border-color flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 mix-blend-screen" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium line-clamp-1">{item.title}</p>
              <p className="text-xs text-text-muted mt-1">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Actions */}
      <div className="mt-6 pt-6 border-t border-border-color flex justify-between items-center">
        <a href="#" className="text-xs text-text-muted hover:text-white underline tracking-widest uppercase">Download Invoice</a>
        {order.status === 'Delivered' && (
          <button className="border border-gold text-gold px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold/10 transition-colors">
            Return / Exchange
          </button>
        )}
      </div>
    </div>
  );
}

// --- Profile Tab Component ---
function ProfileTab({ user }) {
  return (
    <div className="bg-bg-secondary border border-border-color p-8">
      <h3 className="font-serif text-2xl text-white mb-6">Profile Details</h3>
      
      <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-border-color">
        <div className="w-20 h-20 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold font-serif text-3xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="text-xl text-white">{user.name}</h4>
          <p className="text-text-muted text-sm">{user.email}</p>
          <div className="mt-2 inline-block bg-[#1a1a1a] border border-[#333] px-3 py-1 text-xs text-gold tracking-widest uppercase">
            Silver Member
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-widest mb-2">Full Name</label>
          <input 
            type="text" 
            defaultValue={user.name} 
            disabled
            className="w-full bg-bg-primary border border-border-color text-white px-4 py-3 text-sm opacity-60 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-widest mb-2">Email Address</label>
          <input 
            type="email" 
            defaultValue={user.email} 
            disabled
            className="w-full bg-bg-primary border border-border-color text-white px-4 py-3 text-sm opacity-60 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-[#666] mt-4">Contact support to update your email address or password.</p>
      </div>
    </div>
  );
}

// --- Addresses Tab Component ---
function AddressesTab() {
  return (
    <div className="bg-bg-secondary border border-border-color p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
      <MapPin size={40} className="text-[#333] mb-4" />
      <h3 className="font-serif text-2xl text-white mb-2">Address Book</h3>
      <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">
        Save multiple addresses for a faster checkout experience. This feature is coming soon to your premium account.
      </p>
      <button className="border border-[#444] text-[#666] px-6 py-3 text-xs uppercase tracking-widest cursor-not-allowed">
        Add New Address
      </button>
    </div>
  );
}
