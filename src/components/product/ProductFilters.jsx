import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { getCategoryTree } from "../../api/category.api";
import { cn } from "../../utils/formatters";

// ── Price range slider ────────────────────────────────────────────────────────
function PriceRange({ min, max, onChange }) {
  const [local, setLocal] = useState([min || 0, max || 100000]);

  useEffect(() => {
    setLocal([min || 0, max || 100000]);
  }, [min, max]);

  const handleMin = (e) => {
    const val = Math.min(Number(e.target.value), local[1] - 100);
    setLocal([val, local[1]]);
  };

  const handleMax = (e) => {
    const val = Math.max(Number(e.target.value), local[0] + 100);
    setLocal([local[0], val]);
  };

  const apply = () =>
    onChange(local[0] || null, local[1] === 100000 ? null : local[1]);

  const pct = (v) => (v / 100000) * 100;

  return (
    <div className="space-y-4">
      {/* Visual track */}
      <div className="relative h-1 bg-white/[0.06] mx-1">
        <div
          className="absolute h-full bg-gold"
          style={{
            left: `${pct(local[0])}%`,
            right: `${100 - pct(local[1])}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={100000}
          step={100}
          value={local[0]}
          onChange={handleMin}
          onMouseUp={apply}
          onTouchEnd={apply}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
        />
        <input
          type="range"
          min={0}
          max={100000}
          step={100}
          value={local[1]}
          onChange={handleMax}
          onMouseUp={apply}
          onTouchEnd={apply}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
        />
        {/* Thumbs */}
        <div
          className="absolute w-3 h-3 bg-gold border border-obsidian rounded-full -translate-y-1 -translate-x-1.5 pointer-events-none"
          style={{ left: `${pct(local[0])}%` }}
        />
        <div
          className="absolute w-3 h-3 bg-gold border border-obsidian rounded-full -translate-y-1 -translate-x-1.5 pointer-events-none"
          style={{ left: `${pct(local[1])}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs font-mono text-stone">
        <span>₹{local[0].toLocaleString()}</span>
        <span>
          ₹{local[1] === 100000 ? "1,00,000+" : local[1].toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ── Accordion section ─────────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.06] py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left mb-0 group"
      >
        <span className="eyebrow text-stone/60 text-[10px] group-hover:text-stone transition-colors">
          {title}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "text-stone/40 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Rating filter ─────────────────────────────────────────────────────────────
function RatingFilter({ value, onChange }) {
  return (
    <div className="space-y-2">
      {[4, 3, 2, 1].map((r) => (
        <button
          key={r}
          onClick={() => onChange(value === r ? null : r)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-left transition-all duration-200",
            value === r
              ? "bg-gold/10 border border-gold/30"
              : "hover:bg-white/[0.03] border border-transparent",
          )}
        >
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={cn("text-xs", i < r ? "text-gold" : "text-stone/20")}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-stone">{r}+ Stars</span>
        </button>
      ))}
    </div>
  );
}

// ── Main Filters component ────────────────────────────────────────────────────
const BRANDS = [
  "Apple",
  "Samsung",
  "Sony",
  "Nike",
  "Adidas",
  "Puma",
  "Levi's",
  "Zara",
  "H&M",
  "boAt",
];

export default function ProductFilters({
  filters,
  onFilter,
  onClear,
  activeCount,
}) {
  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoryTree,
    staleTime: 10 * 60 * 1000,
  });

  const rawCats = Array.isArray(catData?.data?.categories)
    ? catData.data.categories
    : Array.isArray(catData?.data)
      ? catData.data
      : [];
  const categories = rawCats.filter((c) => !c.parent);

  console.log("catData", catData);

  return (
    <div className="w-full">
      {/* Filter header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-stone/50" />
          <span className="eyebrow text-stone/50 text-[10px]">Filters</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 bg-gold text-obsidian text-[9px] font-mono font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] text-stone/50 hover:text-vermillion transition-colors flex items-center gap-1"
          >
            <X size={10} /> Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Category">
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() =>
                onFilter({
                  category: filters.category === cat.slug ? null : cat.slug,
                })
              }
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-all duration-200",
                filters.category === cat.slug
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "text-stone hover:text-cream hover:bg-white/[0.03] border border-transparent",
              )}
            >
              <span className="truncate">{cat.name}</span>
              {cat.children?.length > 0 && (
                <span className="text-[10px] text-stone/30 ml-2 shrink-0">
                  {cat.children.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <PriceRange
          min={filters.minPrice}
          max={filters.maxPrice}
          onChange={(mn, mx) => onFilter({ minPrice: mn, maxPrice: mx })}
        />
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1 custom-scroll">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() =>
                onFilter({ brand: filters.brand === b ? null : b })
              }
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-all duration-200",
                filters.brand === b
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "text-stone hover:text-cream hover:bg-white/[0.03] border border-transparent",
              )}
            >
              {/* Checkbox */}
              <span
                className={cn(
                  "w-3.5 h-3.5 border shrink-0 flex items-center justify-center transition-colors",
                  filters.brand === b
                    ? "border-gold bg-gold"
                    : "border-white/[0.15]",
                )}
              >
                {filters.brand === b && (
                  <span className="text-obsidian text-[9px]">✓</span>
                )}
              </span>
              {b}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Customer Rating">
        <RatingFilter
          value={filters.rating}
          onChange={(r) => onFilter({ rating: r })}
        />
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <button
          onClick={() => onFilter({ inStock: !filters.inStock })}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full text-left text-sm transition-all duration-200",
            filters.inStock
              ? "bg-gold/10 text-gold border border-gold/30"
              : "text-stone hover:text-cream hover:bg-white/[0.03] border border-transparent",
          )}
        >
          <span
            className={cn(
              "w-4 h-4 border flex items-center justify-center shrink-0 transition-colors relative",
              filters.inStock ? "border-gold bg-gold" : "border-white/[0.15]",
            )}
          >
            {filters.inStock && (
              <span className="text-obsidian text-[9px]">✓</span>
            )}
          </span>
          In Stock Only
        </button>
      </FilterSection>

      {/* Special */}
      <FilterSection title="Special" defaultOpen={false}>
        <div className="space-y-1">
          {[
            { key: "isNewArrival", label: "New Arrivals" },
            { key: "isBestSeller", label: "Best Sellers" },
            { key: "isFeatured", label: "Featured" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onFilter({ [key]: !filters[key] })}
              className={cn(
                "flex items-center gap-3 px-3 py-2 w-full text-left text-sm transition-all duration-200",
                filters[key]
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "text-stone hover:text-cream hover:bg-white/[0.03] border border-transparent",
              )}
            >
              <span
                className={cn(
                  "w-4 h-4 border flex items-center justify-center shrink-0",
                  filters[key] ? "border-gold bg-gold" : "border-white/[0.15]",
                )}
              >
                {filters[key] && (
                  <span className="text-obsidian text-[9px]">✓</span>
                )}
              </span>
              {label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
