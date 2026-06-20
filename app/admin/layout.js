"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Users, LogOut, Package, ChevronRight } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("cs_user");
    const storedToken = localStorage.getItem("cs_token");

    if (!storedUser || !storedToken) {
      if (pathname !== "/admin/login") router.replace("/admin/login");
      setReady(true);
      return;
    }

    const parsed = JSON.parse(storedUser);
    if (parsed.role !== "admin") {
      if (pathname !== "/admin/login") router.replace("/admin/login");
      setReady(true);
      return;
    }

    setUser(parsed);
    setReady(true);

    if (pathname === "/admin" || pathname === "/admin/") {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_user");
    router.replace("/admin/login");
  };

  // Show login page without sidebar
  if (!ready) return null;
  if (pathname === "/admin/login") return <>{children}</>;
  if (!user) return null;

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/customers", label: "Customers", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111111] border-r border-[#222] flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-[#222]">
          <p className="text-[#b8972e] font-serif text-xl tracking-[0.3em] uppercase">Chain&Straps</p>
          <p className="text-[#666] text-xs tracking-widest uppercase mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm tracking-wide transition-all duration-200 group ${
                  isActive
                    ? "bg-[#b8972e]/10 text-[#b8972e] border border-[#b8972e]/20"
                    : "text-[#888] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#222]">
          <div className="px-4 py-3 mb-2">
            <p className="text-white text-sm font-medium">{user.name}</p>
            <p className="text-[#666] text-xs">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#888] hover:text-red-400 hover:bg-red-500/5 rounded text-sm tracking-wide transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
