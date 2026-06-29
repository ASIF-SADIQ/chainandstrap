"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FilterSidebar from "./FilterSidebar";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { Filter } from "lucide-react";
import { API_BASE } from "@/lib/config";

export default function ProductGrid({ title, initialCategory, initialBrand, hideSidebar = false }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [gotoPageInput, setGotoPageInput] = useState("");
  const isFirstRender = useRef(true);

  // Initialize page from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pageFromQuery = parseInt(params.get("page") || "1", 10);
      if (pageFromQuery >= 1) {
        setPage(pageFromQuery);
      }
    }
  }, []);

  // Listen to browser back/forward buttons (history popstate)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pageFromQuery = parseInt(params.get("page") || "1", 10);
      setPage(pageFromQuery >= 1 ? pageFromQuery : 1);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const limit = 12;

  const [filters, setFilters] = useState({
    brands: initialBrand ? [initialBrand] : [],
    categories: initialCategory ? [initialCategory] : [],
    price: [0, 5000000],
  });
  const [sort, setSort] = useState("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Dynamic Title Logic — reflects both category and brand selections
  const buildDisplayTitle = () => {
    const parts = [];

    // Brand part
    if (filters.brands.length === 1) {
      parts.push(filters.brands[0].toUpperCase());
    } else if (filters.brands.length > 1) {
      parts.push("SELECTED BRANDS");
    }

    // Category part
    if (filters.categories.length === 1) {
      parts.push(filters.categories[0].toUpperCase());
    } else if (filters.categories.length > 1) {
      parts.push("MIXED CATEGORIES");
    }

    if (parts.length > 0) return parts.join(" · ");
    return title || "ALL PRODUCTS";
  };
  const displayTitle = buildDisplayTitle();

  const buildQueryString = useCallback(
    (pageNum) => {
      const params = new URLSearchParams();
      params.set("limit", limit);
      params.set("skip", (pageNum - 1) * limit);

      if (filters.brands.length > 0) params.set("brand", filters.brands[0]);
      if (filters.categories && filters.categories.length > 0) {
        params.set("category", filters.categories.join(","));
      }
      if (sort === "price-low") params.set("sort", "price_asc");
      else if (sort === "price-high") params.set("sort", "price_desc");

      return params.toString();
    },
    [filters, sort]
  );

  const fetchProducts = useCallback(
    async (pageNum) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/products?${buildQueryString(pageNum)}`);
        const data = await res.json();
        setProducts(data.data || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryString]
  );

  // Trigger fetch when filters, sort, or page changes
  useEffect(() => {
    fetchProducts(page);
  }, [filters, sort, page, fetchProducts]);

  // Reset to page 1 when filters or sort change, but skip on initial mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("page")) {
        params.delete("page");
        window.history.pushState(null, '', `?${params.toString()}`);
      }
    }
  }, [filters, sort]);

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      
      // Update URL query parameters so page number is preserved
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage);
        window.history.pushState(null, '', `?${params.toString()}`);
      }
    }
  };

  const handleGotoPageSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(gotoPageInput, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setGotoPageInput("");
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar - Desktop */}
        {!hideSidebar && (
          <div className="hidden md:block w-72 flex-shrink-0">
            <FilterSidebar onFilterChange={setFilters} currentFilters={filters} />
          </div>
        )}

        {/* Right Main Content */}
        <div className="flex-1">
          {/* Sorting & View Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-border-color">
            <h1 className="font-serif text-white text-3xl mb-4 md:mb-0">{displayTitle}</h1>
            <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
              <span className="text-text-muted text-sm tracking-widest uppercase">
                {total.toLocaleString()} PIECES
              </span>
              <select
                className="bg-bg-secondary border border-border-color text-text-primary px-4 py-2 text-xs tracking-widest uppercase focus:outline-none focus:border-gold"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">NEWEST</option>
                <option value="price-low">PRICE: LOW TO HIGH</option>
                <option value="price-high">PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0) 100%)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '2px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✦</div>
              <h2 style={{
                fontFamily: 'serif',
                fontSize: '28px',
                letterSpacing: '0.3em',
                color: '#d4af37',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                New Collection Arriving Soon
              </h2>
              <p style={{
                fontSize: '14px',
                letterSpacing: '0.15em',
                color: '#999',
                textTransform: 'uppercase',
                marginBottom: '32px',
              }}>
                We are restocking our premium luxury catalog. Stay tuned.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                {['Louis Vuitton', 'Gucci', 'Prada', 'Chanel', 'Dior'].map(brand => (
                  <span key={brand} style={{
                    fontSize: '11px',
                    letterSpacing: '0.3em',
                    color: 'rgba(212,175,55,0.6)',
                    textTransform: 'uppercase',
                  }}>{brand}</span>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Numbered Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-4">
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="w-10 h-10 flex items-center justify-center border border-border-color text-text-secondary hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:text-text-secondary disabled:hover:border-border-color transition-all duration-300"
                    >
                      &larr;
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                          page === pageNum
                            ? "bg-gold border-gold text-black"
                            : "border-border-color text-text-secondary hover:border-gold hover:text-gold"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="w-10 h-10 flex items-center justify-center border border-border-color text-text-secondary hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:text-text-secondary disabled:hover:border-border-color transition-all duration-300"
                    >
                      &rarr;
                    </button>
                  </div>

                  {/* Go to Page Form */}
                  <form onSubmit={handleGotoPageSubmit} className="flex items-center space-x-2 border border-border-color px-3 py-1 bg-bg-secondary rounded-sm">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Go to Page:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={gotoPageInput}
                      onChange={(e) => setGotoPageInput(e.target.value)}
                      placeholder={page}
                      className="w-12 bg-transparent text-center text-xs font-bold text-white focus:outline-none focus:text-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="submit"
                      className="bg-gold text-black text-[10px] font-bold px-2 py-1 rounded-sm hover:bg-white transition-colors uppercase tracking-wider"
                    >
                      Go
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Fixed Filter Button */}
      {!hideSidebar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-bg-primary/95 backdrop-blur border-t border-border-color z-40">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="bg-gold text-black w-full py-4 text-sm font-bold tracking-widest uppercase flex justify-center items-center"
          >
            <Filter size={18} className="mr-2" /> FILTER & SORT
          </button>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && !hideSidebar && (
        <div className="md:hidden fixed inset-0 z-50 bg-bg-primary flex flex-col">
          <FilterSidebar
            onFilterChange={setFilters}
            currentFilters={filters}
            isMobile
            onClose={() => setIsMobileFilterOpen(false)}
          />
        </div>
      )}
    </>
  );
}
