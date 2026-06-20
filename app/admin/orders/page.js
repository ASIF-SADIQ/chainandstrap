"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Eye, Phone, Mail, MapPin, X, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { API_BASE } from "@/lib/config";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.orders || data.data || [];
      setOrders(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(true);
    setMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("cs_token");
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage({ type: "success", text: `Order marked as ${status}!` });
        // Update local state
        setOrders(orders.map(o => o._id === orderId ? { ...o, status, isDelivered: status === "Delivered" } : o));
        setSelectedOrder(prev => prev ? { ...prev, status, isDelivered: status === "Delivered" } : null);
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Backend update failed. Please check if the status update route exists on your server." });
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    const name = `${o.shippingAddress?.firstName || ""} ${o.shippingAddress?.lastName || ""}`.toLowerCase();
    const email = (o.shippingAddress?.email || "").toLowerCase();
    const phone = (o.shippingAddress?.phone || "").toLowerCase();
    const id = (o._id || "").toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || phone.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !o.isDelivered && o.status !== "Cancelled") ||
      (filter === "delivered" && o.isDelivered) ||
      (filter === "cancelled" && o.status === "Cancelled");
      
    // Exact match for the date using YYYY-MM-DD
    const matchesDate = !dateFilter || new Date(o.createdAt).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const statusBadge = (order) => {
    if (order.isDelivered) return <span className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">Delivered</span>;
    if (order.status === "Cancelled") return <span className="px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Cancelled</span>;
    return <span className="px-3 py-1 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full">Pending</span>;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-light tracking-wide">Orders</h1>
        <p className="text-[#666] text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            placeholder="Search by name, email, phone or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#222] text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#b8972e] transition-colors placeholder-[#444] rounded"
          />
        </div>
        
        <div className="relative min-w-[160px]">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full h-full bg-[#111] border border-[#222] text-white px-4 py-3 text-sm focus:outline-none focus:border-[#b8972e] transition-colors rounded [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            title="Filter by Date"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter("")} 
              className="absolute -top-2 -right-2 bg-[#222] text-white rounded-full p-1 border border-[#333] hover:bg-[#333] hover:text-[#b8972e] transition-colors z-10"
              title="Clear date filter"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "pending", "delivered", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 text-xs tracking-widest uppercase rounded transition-all duration-200 ${
                filter === f
                  ? "bg-[#b8972e] text-black font-bold"
                  : "bg-[#111] border border-[#222] text-[#888] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#555] tracking-widest uppercase text-xs animate-pulse">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[#555] tracking-widest uppercase text-xs">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Order</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Customer</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Phone</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Items</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Total</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Date</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-[#b8972e] text-xs font-mono">#{order._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                      <p className="text-[#555] text-xs mt-0.5">{order.shippingAddress?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-[#888] text-sm">{order.shippingAddress?.phone || "—"}</td>
                    <td className="px-6 py-4 text-[#888] text-sm">{order.orderItems?.length || 0}</td>
                    <td className="px-6 py-4 text-white text-sm font-medium">${(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">{statusBadge(order)}</td>
                    <td className="px-6 py-4 text-[#555] text-xs">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-[#555] hover:text-[#b8972e] transition-colors hover:bg-[#b8972e]/10 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#222] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#222]">
              <div>
                <h2 className="text-white text-lg font-light">Order Details</h2>
                <p className="text-[#b8972e] text-xs font-mono mt-1">#{selectedOrder._id?.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => { setSelectedOrder(null); setMessage({ type: "", text: "" }); }} className="text-[#555] hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {message.text && (
                <div className={`p-4 rounded flex items-center gap-3 text-sm ${
                  message.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}>
                  {message.type === "success" ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
                  {message.text}
                </div>
              )}

              {/* Action Buttons */}
              {!selectedOrder.isDelivered && selectedOrder.status !== "Cancelled" && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, "Delivered")}
                    disabled={updating}
                    className="bg-green-600 text-white py-3 rounded text-xs tracking-widest uppercase font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? "Updating..." : <><CheckCircle size={14} /> Mark Delivered</>}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, "Cancelled")}
                    disabled={updating}
                    className="bg-red-600/10 border border-red-600/30 text-red-500 py-3 rounded text-xs tracking-widest uppercase font-bold hover:bg-red-600/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? "Updating..." : <><X size={14} /> Cancel Order</>}
                  </button>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h3 className="text-[#b8972e] text-xs tracking-widest uppercase mb-3">Customer Information</h3>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#b8972e]/10 flex items-center justify-center">
                      <span className="text-[#b8972e] text-sm font-medium">
                        {selectedOrder.shippingAddress?.firstName?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#888] text-sm">
                    <Mail size={14} className="text-[#555]" />
                    {selectedOrder.shippingAddress?.email || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-[#888] text-sm">
                    <Phone size={14} className="text-[#555]" />
                    {selectedOrder.shippingAddress?.phone || "—"}
                  </div>
                  <div className="flex items-start gap-2 text-[#888] text-sm">
                    <MapPin size={14} className="text-[#555] mt-0.5 flex-shrink-0" />
                    <span>
                      {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.zip}, {selectedOrder.shippingAddress?.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-[#b8972e] text-xs tracking-widest uppercase mb-3">Items Ordered</h3>
                <div className="space-y-2">
                  {(selectedOrder.orderItems || []).map((item, idx) => (
                    <div key={idx} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 flex items-center gap-3">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.title} className="w-12 h-14 object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm line-clamp-1">{item.title || "Product"}</p>
                        <p className="text-[#555] text-xs mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[#b8972e] text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-[#b8972e] text-xs tracking-widest uppercase mb-3">Order Summary</h3>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Subtotal</span>
                    <span className="text-white">${(selectedOrder.itemsPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Shipping</span>
                    <span className="text-white">${(selectedOrder.shippingPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-[#222] pt-2 mt-2">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-[#b8972e] font-medium">${(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666]">Order Status</span>
                {statusBadge(selectedOrder)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666]">Placed On</span>
                <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
