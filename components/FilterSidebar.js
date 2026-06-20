"use client";

import { X } from "lucide-react";
import Link from "next/link";

const BRANDS = ["LV", "GUCCI", "PRADA", "CHANEL", "DIOR", "BALENCIAGA", "HERMES", "CARTIER", "ROLEX", "GIVENCHY"];
const CATEGORIES = ["Bags", "Shoes", "Watches", "Jewellery", "Accessories"];

export default function FilterSidebar({ onFilterChange, currentFilters, isMobile = false, onClose }) {
  
  const handleCheckboxChange = (type, value) => {
    const list = currentFilters[type];
    let newList;
    if (list.includes(value)) {
      newList = list.filter((item) => item !== value);
    } else {
      newList = [...list, value];
    }
    onFilterChange({ ...currentFilters, [type]: newList });
  };

  const clearFilters = () => {
    onFilterChange({ brands: [], categories: [], price: [0, 5000000] });
  };

  const sidebarContent = (
    <div className={`p-6 ${isMobile ? 'h-full overflow-y-auto pb-24' : ''}`}>
      {isMobile && (
        <div className="flex justify-between items-center mb-8 border-b border-border-color pb-4">
          <h3 className="font-serif text-gold text-xl tracking-widest uppercase">Filters</h3>
          <button onClick={onClose} className="text-white hover:text-gold"><X size={24} /></button>
        </div>
      )}

      {/* Categories */}
      <div className="mb-10">
        <h4 className="text-white text-xs tracking-[0.2em] uppercase mb-4 border-b border-border-color pb-2">Categories</h4>
        <div className="space-y-4 pt-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center space-x-4 cursor-pointer group">
              <input 
                type="checkbox" 
                className="form-checkbox bg-transparent border-border-color text-gold focus:ring-gold focus:ring-offset-0 focus:ring-1 accent-gold h-4 w-4 appearance-none checked:bg-gold checked:border-gold relative before:content-[''] checked:before:absolute checked:before:inset-0 checked:before:m-auto checked:before:w-2 checked:before:h-2 checked:before:bg-bg-primary"
                checked={currentFilters.categories.includes(cat)}
                onChange={() => handleCheckboxChange('categories', cat)}
              />
              <span className={`text-sm tracking-wide transition-colors ${currentFilters.categories.includes(cat) ? 'text-gold' : 'text-text-secondary group-hover:text-white'}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-10">
        <h4 className="text-white text-xs tracking-[0.2em] uppercase mb-4 border-b border-border-color pb-2">Brands</h4>
        <div className="space-y-4 pt-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center space-x-4 cursor-pointer group">
              <input 
                type="checkbox" 
                className="form-checkbox bg-transparent border-border-color text-gold focus:ring-gold focus:ring-offset-0 focus:ring-1 accent-gold h-4 w-4 appearance-none checked:bg-gold checked:border-gold relative before:content-[''] checked:before:absolute checked:before:inset-0 checked:before:m-auto checked:before:w-2 checked:before:h-2 checked:before:bg-bg-primary"
                checked={currentFilters.brands.includes(brand)}
                onChange={() => handleCheckboxChange('brands', brand)}
              />
              <span className={`text-sm tracking-widest uppercase transition-colors ${currentFilters.brands.includes(brand) ? 'text-gold' : 'text-text-secondary group-hover:text-white'}`}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={clearFilters}
        className="w-full py-4 bg-transparent border border-gold text-gold text-xs font-bold tracking-widest uppercase hover:bg-gold/10 transition-colors mt-4"
      >
        Clear All
      </button>

      {isMobile && (
        <button 
          onClick={onClose}
          className="w-full py-4 bg-gold text-black text-xs font-bold tracking-widest uppercase mt-4"
        >
          View Results
        </button>
      )}
    </div>
  );

  return sidebarContent;
}
