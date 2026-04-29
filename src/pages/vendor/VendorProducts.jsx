import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Package,
  Eye,
  TrendingDown,
  Loader2,
  X,
  AlertCircle,
  Type,
  AlignLeft,
  Hash,
  List,
  Calendar,
  ToggleRight as Toggle,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import DashboardShell from "../../components/layout/DashboardShell";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  getVendorProducts,
  createProduct,
  adjustStock,
} from "../../api/vendor.api";
import { getCategories } from "../../api/category.api";
import { getCategoryFields } from "../../api/admin.api";
import { cn, formatPrice } from "../../utils/formatters";
import { toast } from "sonner";

const STATUS_STYLE = {
  active: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
  pending_approval: "text-yellow-500 border-yellow-500/20 bg-yellow-500/5",
  draft: "text-stone/60 border-white/[0.08] bg-white/[0.02]",
  rejected: "text-vermillion border-vermillion/20 bg-vermillion/5",
  archived: "text-stone/40 border-white/[0.06]",
};

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending_approval", label: "Pending" },
  { value: "draft", label: "Drafts" },
  { value: "rejected", label: "Rejected" },
];

const productSchema = z.object({
  name: z.string().min(3, "Min 3 chars").max(200),
  description: z.string().min(20, "Min 20 chars"),
  shortDesc: z.string().max(300).optional(),
  categoryId: z.string().min(1, "Select a category"),
  brand: z.string().optional(),
  sku: z.string().min(2, "SKU required"),
  price: z.coerce.number().min(1, "Price required"),
  mrp: z.coerce.number().min(1, "MRP required"),
  stock: z.coerce.number().min(0).default(0),
});

// ── Dynamic field renderer ─────────────────────────────────────────────────────
function DynamicField({ field, register, errors }) {
  const name = `customFields.${field.key}`;
  const base =
    "w-full bg-[#111] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2.5 text-xs outline-none transition-all";

  return (
    <div>
      <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
        {field.label}
        {field.isRequired && <span className="text-vermillion ml-1">*</span>}
        {field.unit && (
          <span className="text-stone/30 ml-1.5">({field.unit})</span>
        )}
      </label>
      {field.description && (
        <p className="text-stone/30 text-[10px] mb-1.5">{field.description}</p>
      )}

      {field.fieldType === "textarea" && (
        <textarea
          {...register(name)}
          placeholder={field.placeholder}
          rows={2}
          className={`${base} resize-none`}
        />
      )}
      {field.fieldType === "text" && (
        <input
          type="text"
          {...register(name)}
          placeholder={field.placeholder || ""}
          className={base}
        />
      )}
      {field.fieldType === "number" && (
        <input
          type="number"
          {...register(name)}
          placeholder={field.placeholder || "0"}
          className={base}
        />
      )}
      {field.fieldType === "date" && (
        <input type="date" {...register(name)} className={base} />
      )}
      {field.fieldType === "boolean" && (
        <select {...register(name)} className={base}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )}
      {(field.fieldType === "dropdown" || field.fieldType === "radio") && (
        <select {...register(name)} className={base}>
          <option value="">Select {field.label}</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0a0a0a]">
              {o.label}
            </option>
          ))}
        </select>
      )}
      {field.fieldType === "checkbox" && (
        <div className="flex flex-wrap gap-3 pt-1">
          {field.options?.map((o) => (
            <label
              key={o.value}
              className="flex items-center gap-1.5 text-xs text-stone cursor-pointer hover:text-cream transition-colors"
            >
              <input
                type="checkbox"
                value={o.value}
                {...register(name)}
                className="accent-gold"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add product modal (centered) ───────────────────────────────────────────────
function AddProductModal({ open, onClose, categories, queryClient }) {
  const fileRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedRootCat, setSelectedRootCat] = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Build root & sub lists
  const rootCats = categories.filter((c) => {
    const parentId = c.parent?._id || c.parent;
    return !parentId && c.level === 0;
  });

  const subCats = selectedRootCat
    ? categories.filter((c) => {
        const parentId = c.parent?._id || c.parent;
        return String(parentId) === String(selectedRootCat);
      })
    : [];

  // Final active category for field fetch
  const activeCategoryId = selectedSubCat || selectedRootCat || "";

  // Fetch category fields
  const { data: fieldsData, isLoading: fieldsLoading } = useQuery({
    queryKey: ["cat-fields-vendor", activeCategoryId],
    queryFn: async () => {
      const { data } = await getCategoryFields(activeCategoryId);
      return data?.data?.fields || [];
    },
    enabled: !!activeCategoryId,
    staleTime: 60 * 1000,
  });
  const catFields = fieldsData || [];

  const mutation = useMutation({
    mutationFn: (d) => {
      const fd = new FormData();
      fd.append("name", d.name);
      fd.append("description", d.description);
      fd.append("shortDesc", d.shortDesc || "");
      fd.append("categoryId", d.categoryId);
      fd.append("brand", d.brand || "");

      // Collect customFields
      const customFieldsData = {};
      catFields.forEach((f) => {
        const val = d.customFields?.[f.key];
        if (val !== undefined && val !== "" && val !== null) {
          customFieldsData[f.key] = Array.isArray(val)
            ? val.filter(Boolean)
            : val;
        }
      });
      if (Object.keys(customFieldsData).length > 0) {
        fd.append("customFields", JSON.stringify(customFieldsData));
      }

      fd.append(
        "variants",
        JSON.stringify([
          {
            sku: d.sku,
            price: Number(d.price),
            mrp: Number(d.mrp),
            stock: Number(d.stock),
            attributes: {},
          },
        ]),
      );
      selectedFiles.forEach((f) => fd.append("images", f));
      return createProduct(fd);
    },
    onSuccess: () => {
      toast.success("Product submitted for approval");
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      handleReset();
      onClose();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to create"),
  });

  const handleReset = () => {
    reset();
    setSelectedFiles([]);
    setPreviews([]);
    setSelectedRootCat("");
    setSelectedSubCat("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((p) => [...p, ...files].slice(0, 5));
    setPreviews((p) =>
      [...p, ...files.map((f) => URL.createObjectURL(f))].slice(0, 5),
    );
  };

  const removeFile = (i) => {
    setSelectedFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const Field = ({
    name,
    label,
    placeholder,
    type = "text",
    required,
    textarea,
  }) => (
    <div>
      <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
        {label}
        {required && <span className="text-vermillion ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          {...register(name)}
          placeholder={placeholder}
          rows={3}
          className={cn(
            "w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none transition-all resize-none focus:border-gold/40",
            errors[name] ? "border-vermillion/40" : "border-white/[0.07]",
          )}
        />
      ) : (
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className={cn(
            "w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none transition-all focus:border-gold/40",
            errors[name] ? "border-vermillion/40" : "border-white/[0.07]",
          )}
        />
      )}
      {errors[name] && (
        <p className="text-[10px] text-vermillion/80 mt-1">
          {errors[name].message}
        </p>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-obsidian/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal — centered, fixed height, internal scroll */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-xl bg-[#0d0d0d] border border-white/[0.08] flex flex-col"
              style={{ maxHeight: "calc(100vh - 48px)" }}
              initial={{ scale: 0.96, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 12, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
                <div>
                  <p className="font-display text-base text-cream">
                    Add New Product
                  </p>
                  <p className="eyebrow text-stone/40 text-[10px] mt-0.5">
                    Fill in details below — submitted for admin review
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 text-stone hover:text-cream transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-4">
                <Field
                  name="name"
                  label="Product Name"
                  placeholder="iPhone 15 Pro 256GB"
                  required
                />
                <Field
                  name="description"
                  label="Description"
                  placeholder="Detailed product description (min 20 chars)"
                  required
                  textarea
                />
                <Field
                  name="shortDesc"
                  label="Short Description"
                  placeholder="Brief summary for listings"
                />

                {/* Category cascade */}
                <div className="space-y-3">
                  <div>
                    <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
                      Category <span className="text-vermillion ml-1">*</span>
                    </label>
                    <select
                      value={selectedRootCat}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedRootCat(val);
                        setSelectedSubCat("");
                        setValue("categoryId", val, { shouldValidate: true });
                      }}
                      className={cn(
                        "w-full bg-[#0a0a0a] border text-cream px-4 py-3 text-sm outline-none transition-all focus:border-gold/40",
                        errors.categoryId
                          ? "border-vermillion/40"
                          : "border-white/[0.07]",
                      )}
                    >
                      <option value="" className="bg-[#0a0a0a]">
                        Select category
                      </option>
                      {rootCats.map((c) => (
                        <option
                          key={c._id}
                          value={c._id}
                          className="bg-[#0a0a0a]"
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory — animate in when root has children */}
                  <AnimatePresence>
                    {subCats.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
                          Subcategory
                          {subCats.length > 0 && (
                            <span className="text-stone/30 ml-1">
                              (optional — narrows category fields)
                            </span>
                          )}
                        </label>
                        <select
                          value={selectedSubCat}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedSubCat(val);
                            setValue("categoryId", val || selectedRootCat, {
                              shouldValidate: true,
                            });
                          }}
                          className="w-full bg-[#0a0a0a] border border-white/[0.07] text-cream px-4 py-3 text-sm outline-none focus:border-gold/40"
                        >
                          <option value="" className="bg-[#0a0a0a]">
                            All of{" "}
                            {
                              rootCats.find((c) => c._id === selectedRootCat)
                                ?.name
                            }
                          </option>
                          {subCats.map((c) => (
                            <option
                              key={c._id}
                              value={c._id}
                              className="bg-[#0a0a0a]"
                            >
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {errors.categoryId && (
                    <p className="text-[10px] text-vermillion/80">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                <Field
                  name="brand"
                  label="Brand"
                  placeholder="Apple, Samsung, etc."
                />

                {/* Dynamic category fields */}
                <AnimatePresence>
                  {activeCategoryId && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#0a0a0a] border border-white/[0.05] p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <p className="eyebrow text-stone/30 text-[10px]">
                          Category Details
                        </p>
                        {fieldsLoading && (
                          <span className="text-[10px] text-stone/30 font-mono">
                            loading fields…
                          </span>
                        )}
                        {!fieldsLoading && catFields.length === 0 && (
                          <span className="text-[10px] text-stone/20 font-mono">
                            no custom fields for this category
                          </span>
                        )}
                      </div>
                      {fieldsLoading ? (
                        <div className="space-y-2">
                          {[...Array(2)].map((_, i) => (
                            <div
                              key={i}
                              className="h-9 bg-white/[0.03] animate-pulse"
                            />
                          ))}
                        </div>
                      ) : (
                        catFields.map((f) => (
                          <DynamicField
                            key={f._id}
                            field={f}
                            register={register}
                            errors={errors}
                          />
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Variant block */}
                <div className="bg-[#0a0a0a] border border-white/[0.05] p-4 space-y-3">
                  <p className="eyebrow text-stone/30 text-[10px]">
                    Default Variant
                  </p>
                  <Field
                    name="sku"
                    label="SKU"
                    placeholder="PROD-001"
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Field
                      name="price"
                      label="Price (₹)"
                      placeholder="999"
                      type="number"
                      required
                    />
                    <Field
                      name="mrp"
                      label="MRP (₹)"
                      placeholder="1499"
                      type="number"
                      required
                    />
                    <Field
                      name="stock"
                      label="Stock"
                      placeholder="50"
                      type="number"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="eyebrow text-stone/40 text-[10px] block mb-2">
                    Product Images (max 5)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {previews.map((p, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-16 border border-white/[0.08] overflow-hidden"
                      >
                        <img
                          src={p}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-vermillion flex items-center justify-center text-cream"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-16 h-16 border border-dashed border-white/[0.1] flex items-center justify-center text-stone/40 hover:text-cream hover:border-gold/30 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                  />
                </div>
              </div>

              {/* Footer CTA */}
              <div className="px-5 py-4 border-t border-white/[0.07] shrink-0">
                <motion.button
                  onClick={handleSubmit((d) => mutation.mutate(d))}
                  disabled={mutation.isPending}
                  whileTap={{ scale: 0.97 }}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {mutation.isPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Submit for Approval
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Product row ────────────────────────────────────────────────────────────────
function ProductRow({ product, onAdjustStock }) {
  const image = product.images?.[0]?.url;
  const status = product.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-3 sm:gap-4 p-4 bg-[#0d0d0d] border border-white/[0.07] hover:border-gold/15 transition-colors group"
    >
      <div className="w-12 h-14 bg-[#111] border border-white/[0.06] shrink-0 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={16} className="text-stone/20" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-cream text-sm font-medium line-clamp-1">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className={cn(
              "text-[10px] font-mono border px-2 py-0.5",
              STATUS_STYLE[status] || STATUS_STYLE.draft,
            )}
          >
            {status?.replace(/_/g, " ")}
          </span>
          {product.rejectionReason && (
            <span className="flex items-center gap-1 text-[10px] text-vermillion/60">
              <AlertCircle size={9} />
              {product.rejectionReason.slice(0, 40)}...
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
        <div>
          <p className="text-cream text-sm font-mono">
            {formatPrice(product.basePrice)}
          </p>
          <p className="text-stone/40 text-[10px]">Price</p>
        </div>
        <div>
          <p
            className={cn(
              "text-sm font-mono",
              product.totalStock === 0
                ? "text-vermillion"
                : product.totalStock <= 5
                  ? "text-yellow-500"
                  : "text-emerald-400",
            )}
          >
            {product.totalStock}
          </p>
          <p className="text-stone/40 text-[10px]">Stock</p>
        </div>
        <div>
          <p className="text-cream text-sm font-mono">
            {product.rating?.count || 0}
          </p>
          <p className="text-stone/40 text-[10px]">Reviews</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onAdjustStock(product)}
          className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-stone/50 hover:text-cream hover:border-gold/30 transition-all"
          title="Adjust Stock"
        >
          <TrendingDown size={13} />
        </button>
        <a
          href={`/products/${product.slug}`}
          rel="noopener noreferrer"
          className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-stone/50 hover:text-cream hover:border-gold/30 transition-all"
          title="View"
        >
          <Eye size={13} />
        </a>
      </div>
    </motion.div>
  );
}

// ── Stock adjust modal ─────────────────────────────────────────────────────────
function StockModal({ product, onClose, queryClient }) {
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      adjustStock({
        productId: product._id,
        variantId: product.variants?.[0]?._id,
        quantity: Number(qty),
        note,
      }),
    onSuccess: () => {
      toast.success("Stock adjusted");
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-obsidian/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] p-6"
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
      >
        <p className="font-display text-xl text-cream mb-1">Adjust Stock</p>
        <p className="text-stone/50 text-xs mb-5">{product.name}</p>

        <div className="mb-4">
          <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
            Quantity Change
            <span className="text-stone/30 ml-2">
              (positive = add, negative = remove)
            </span>
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream px-4 py-3 text-sm outline-none"
            placeholder="e.g. 50 or -10"
          />
        </div>

        <div className="mb-5">
          <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for adjustment"
            className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => mutation.mutate()}
            disabled={!qty || mutation.isPending}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {mutation.isPending && (
              <Loader2 size={13} className="animate-spin" />
            )}
            Adjust
          </button>
          <button onClick={onClose} className="px-5 btn-outline text-sm">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function VendorProducts() {
  const [tab, setTab] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-products", tab],
    queryFn: async () => {
      const { data } = await getVendorProducts({
        status: tab || undefined,
        limit: 50,
      });
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ["categories-flat"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categories = Array.isArray(categoriesRaw)
    ? categoriesRaw
    : Array.isArray(categoriesRaw?.data)
      ? categoriesRaw.data
      : [];

  const products = data?.products || [];

  return (
    <PageWrapper>
      <DashboardShell title="My Products" subtitle="Vendor">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono whitespace-nowrap border transition-all shrink-0",
                  tab === t.value
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-white/[0.07] text-stone/60 hover:text-cream",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-2 py-2.5 px-5 shrink-0"
          >
            <Plus size={13} /> Add Product
          </button>
        </div>

        {/* Products list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package size={28} className="mx-auto text-stone/20 mb-4" />
            <p className="font-display text-xl text-cream mb-2">
              No products yet
            </p>
            <p className="text-stone text-sm mb-6">
              Add your first product to start selling
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-sm flex items-center gap-2 mx-auto"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <ProductRow
                key={p._id}
                product={p}
                onAdjustStock={setStockProduct}
              />
            ))}
          </div>
        )}
      </DashboardShell>

      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        queryClient={queryClient}
      />

      {stockProduct && (
        <StockModal
          product={stockProduct}
          onClose={() => setStockProduct(null)}
          queryClient={queryClient}
        />
      )}
    </PageWrapper>
  );
}
