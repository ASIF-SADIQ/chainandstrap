"use client";

import { useEffect, useState } from "react";
import { Search, Mail, Phone } from "lucide-react";
import { API_BASE } from "@/lib/config";

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Deduplicate customers by email
  const customerMap = {};
  orders.forEach((order) => {
    const email = order.shippingAddress?.email;
    if (!email) return;
    if (!customerMap[email]) {
      customerMap[email] = {
        name: `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim(),
        email,
        phone: order.shippingAddress?.phone || "—",
        city: order.shippingAddress?.city || "—",
        country: order.shippingAddress?.country || "—",
        orders: 0,
        totalSpent: 0,
        lastOrder: order.createdAt,
      };
    }
    customerMap[email].orders += 1;
    customerMap[email].totalSpent += order.totalAmount || 0;
    if (new Date(order.createdAt) > new Date(customerMap[email].lastOrder)) {
      customerMap[email].lastOrder = order.createdAt;
    }
  });

  const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  const filtered = customers.filter((c) => {
    if (!search) return true;
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-light tracking-wide">Customers</h1>
        <p className="text-[#666] text-sm mt-1">{customers.length} unique customers</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#222] text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#b8972e] transition-colors placeholder-[#444] rounded max-w-md"
        />
      </div>

      <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#555] tracking-widest uppercase text-xs animate-pulse">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[#555] tracking-widest uppercase text-xs">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Customer</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Phone</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Location</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Orders</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Total Spent</th>
                  <th className="text-left px-6 py-4 text-[#555] text-xs tracking-widest uppercase">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.email} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#b8972e]/10 border border-[#b8972e]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#b8972e] text-sm font-medium">{customer.name[0]?.toUpperCase() || "?"}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm">{customer.name || "Unknown"}</p>
                          <p className="text-[#555] text-xs mt-0.5 flex items-center gap-1">
                            <Mail size={10} />
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#888] text-sm flex items-center gap-1">
                        <Phone size={12} className="text-[#555]" />
                        {customer.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#888] text-sm">{customer.city}, {customer.country}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-[#b8972e]/10 text-[#b8972e] border border-[#b8972e]/20 rounded-full">{customer.orders}</span>
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-medium">${customer.totalSpent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-[#555] text-xs">{new Date(customer.lastOrder).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
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
