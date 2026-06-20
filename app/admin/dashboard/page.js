"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Users, TrendingUp, Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { API_BASE } from "@/lib/config";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("cs_token");
        const res = await fetch(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(data.orders || data.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pending = orders.filter((o) => o.status === "Pending").length;
  const delivered = orders.filter((o) => o.isDelivered).length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-[#b8972e]", bg: "bg-[#b8972e]/10 border-[#b8972e]/20" },
    { label: "Pending Orders", value: pending, icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Delivered", value: delivered, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  ];

  const statusBadge = (order) => {
    if (order.isDelivered) return <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded">Delivered</span>;
    if (order.status === "Cancelled") return <span className="px-2 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded">Cancelled</span>;
    return <span className="px-2 py-1 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded">Pending</span>;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-light tracking-wide">Dashboard</h1>
        <p className="text-[#666] text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`bg-[#111] border ${bg} rounded-lg p-6 border border-[#222]`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#666] text-xs tracking-widest uppercase">{label}</span>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <p className={`text-2xl font-light ${color}`}>{loading ? "..." : value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-white text-sm font-medium tracking-wide">Recent Orders</h2>
          <a href="/admin/orders" className="text-[#b8972e] text-xs hover:underline tracking-widest uppercase">View All</a>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#555] tracking-widest uppercase text-xs animate-pulse">Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center text-[#555] tracking-widest uppercase text-xs">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left px-6 py-3 text-[#555] text-xs tracking-widest uppercase">Order ID</th>
                  <th className="text-left px-6 py-3 text-[#555] text-xs tracking-widest uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-[#555] text-xs tracking-widest uppercase">Items</th>
                  <th className="text-left px-6 py-3 text-[#555] text-xs tracking-widest uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-[#555] text-xs tracking-widest uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-[#555] text-xs tracking-widest uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-[#b8972e] text-xs font-mono">#{order._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                      <p className="text-[#555] text-xs">{order.shippingAddress?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-[#888] text-sm">{order.orderItems?.length || 0} item(s)</td>
                    <td className="px-6 py-4 text-white text-sm">${(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">{statusBadge(order)}</td>
                    <td className="px-6 py-4 text-[#555] text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
