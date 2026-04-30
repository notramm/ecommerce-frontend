import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Tag,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import DashboardShell from "../../components/layout/DashboardShell";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  getVendorCoupons,
  createVendorCoupon,
  updateVendorCoupon,
  deleteVendorCoupon,
  getVendorProducts,
} from "../../api/vendor.api";
import { cn, formatDate } from "../../utils/formatters";
import { toast } from "sonner";

const schema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().max(200).optional(),
  discountType: z.enum(["flat", "percent"]),
  discountValue: z.coerce.number().min(1),
  maxDiscount: z.coerce.number().optional(),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxUses: z.coerce.number().optional(),
  maxUsesPerUser: z.coerce.number().default(1),
  expiresAt: z.string().min(1, "Expiry required"),
  applicableTo: z
    .enum(["all_vendor_products", "specific_products"])
    .default("all_vendor_products"),
  allowedProducts: z.array(z.string()).optional(),
});

function CreateCouponDrawer({ open, onClose, queryClient }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      discountType: "flat",
      minOrderValue: 0,
      maxUsesPerUser: 1,
      applicableTo: "all_vendor_products",
    },
  });
  const discountType = watch("discountType");
  const applicableTo = watch("applicableTo");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const { data: productsData } = useQuery({
    queryKey: ["vendor-products-picker"],
    queryFn: async () => {
      const { data } = await getVendorProducts({
        limit: 100,
        status: "active",
      });
      return data?.data?.products || [];
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const vendorProducts = productsData || [];

  const toggleProduct = (id) =>
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const mutation = useMutation({
    mutationFn: (d) =>
      createVendorCoupon({
        ...d,
        code: d.code.toUpperCase(),
        expiresAt: new Date(d.expiresAt).toISOString(),
        applicableTo:
          d.applicableTo === "all_vendor_products"
            ? "specific_products"
            : "specific_products",
        allowedProducts:
          d.applicableTo === "all_vendor_products"
            ? vendorProducts.map((p) => p._id)
            : selectedProducts,
      }),
    onSuccess: () => {
      toast.success("Coupon created");
      queryClient.invalidateQueries({ queryKey: ["vendor-coupons"] });
      reset();
      setSelectedProducts([]);
      onClose();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to create"),
  });

  const Field = ({ name, label, placeholder, type = "text", required }) => (
    <div>
      <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
        {label}
        {required && <span className="text-vermillion ml-1">*</span>}
      </label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className={cn(
          "w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none transition-all",
          "focus:border-gold/40",
          errors[name] ? "border-vermillion/40" : "border-white/[0.07]",
        )}
      />
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
          <motion.div
            className="fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[440px] bg-[#0d0d0d] border-l border-white/[0.07] flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
              <p className="eyebrow text-stone/50 text-[10px]">Create Coupon</p>
              <button
                onClick={onClose}
                className="p-1.5 text-stone hover:text-cream transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <Field
                name="code"
                label="Coupon Code"
                placeholder="SAVE20"
                required
              />
              <Field
                name="description"
                label="Description"
                placeholder="20% off on all items"
              />

              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-2">
                  Discount Type
                </label>
                <div className="flex gap-2">
                  {["flat", "percent"].map((t) => (
                    <label
                      key={t}
                      className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <input
                        {...register("discountType")}
                        type="radio"
                        value={t}
                        className="hidden peer"
                      />
                      <span className="flex-1 text-center py-2.5 border border-white/[0.07] text-sm text-stone peer-checked:border-gold/40 peer-checked:text-gold peer-checked:bg-gold/5 transition-all cursor-pointer capitalize">
                        {t === "flat" ? "₹ Flat" : "% Percent"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  name="discountValue"
                  label={
                    discountType === "flat" ? "Amount (₹)" : "Percentage (%)"
                  }
                  placeholder={discountType === "flat" ? "100" : "20"}
                  type="number"
                  required
                />
                {discountType === "percent" && (
                  <Field
                    name="maxDiscount"
                    label="Max Discount (₹)"
                    placeholder="500"
                    type="number"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  name="minOrderValue"
                  label="Min Order (₹)"
                  placeholder="499"
                  type="number"
                />
                <Field
                  name="maxUsesPerUser"
                  label="Per User Limit"
                  placeholder="1"
                  type="number"
                />
              </div>

              <Field
                name="maxUses"
                label="Total Max Uses"
                placeholder="Leave empty for unlimited"
                type="number"
              />
              <Field
                name="expiresAt"
                label="Expiry Date"
                placeholder=""
                type="datetime-local"
                required
              />

              {/* Applicable To */}
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-2">
                  Applies To
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "all_vendor_products", label: "All My Products" },
                    { value: "specific_products", label: "Specific Products" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex-1 cursor-pointer">
                      <input
                        {...register("applicableTo")}
                        type="radio"
                        value={opt.value}
                        className="hidden peer"
                      />
                      <span className="flex-1 block text-center py-2.5 border border-white/[0.07] text-sm text-stone peer-checked:border-gold/40 peer-checked:text-gold peer-checked:bg-gold/5 transition-all">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {applicableTo === "specific_products" && (
                <div>
                  <label className="eyebrow text-stone/40 text-[10px] block mb-2">
                    Select Products{" "}
                    <span className="text-vermillion ml-1">*</span>
                  </label>
                  {vendorProducts.length === 0 ? (
                    <p className="text-stone/40 text-xs py-3">
                      No active products found
                    </p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1 border border-white/[0.07] p-2">
                      {vendorProducts.map((p) => {
                        const checked = selectedProducts.includes(p._id);
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => toggleProduct(p._id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 text-left transition-all",
                              checked
                                ? "bg-gold/10 border border-gold/30"
                                : "hover:bg-white/[0.03] border border-transparent",
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 border shrink-0 flex items-center justify-center",
                                checked
                                  ? "border-gold bg-gold"
                                  : "border-white/20",
                              )}
                            >
                              {checked && (
                                <span className="text-obsidian text-[10px] font-bold">
                                  &#10003;
                                </span>
                              )}
                            </div>
                            <span className="text-cream text-xs line-clamp-1">
                              {p.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedProducts.length === 0 && (
                    <p className="text-[10px] text-vermillion/80 mt-1">
                      Select at least one product
                    </p>
                  )}
                </div>
              )}
            </div>

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
                Create Coupon
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function VendorCoupons() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-coupons"],
    queryFn: async () => {
      const { data } = await getVendorCoupons();
      return data.data.coupons;
    },
    staleTime: 2 * 60 * 1000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateVendorCoupon(id, { isActive }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["vendor-coupons"] }),
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendorCoupon,
    onSuccess: () => {
      toast.success("Coupon deleted");
      queryClient.invalidateQueries({ queryKey: ["vendor-coupons"] });
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Cannot delete used coupon"),
  });

  const coupons = data || [];

  return (
    <PageWrapper>
      <DashboardShell title="Coupons" subtitle="Vendor">
        <div className="flex justify-end mb-5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-primary text-xs flex items-center gap-2 py-2.5 px-5"
          >
            <Plus size={13} /> Create Coupon
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={28} className="mx-auto text-stone/20 mb-4" />
            <p className="font-display text-xl text-cream mb-2">
              No coupons yet
            </p>
            <p className="text-stone text-sm mb-6">
              Create discount coupons to attract more customers
            </p>
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn-primary text-sm flex items-center gap-2 mx-auto"
            >
              <Plus size={14} /> Create First Coupon
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d0d0d] border border-white/[0.07] p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                      <Tag size={15} className="text-gold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-sm text-gold font-medium">
                          {c.code}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-mono border px-2 py-0.5",
                            c.isActive
                              ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
                              : "text-stone/50 border-white/[0.08]",
                          )}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-stone/60 text-xs mb-1">
                        {c.discountType === "flat"
                          ? `₹${c.discountValue} off`
                          : `${c.discountValue}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`}
                        {c.minOrderValue > 0
                          ? ` · Min ₹${c.minOrderValue}`
                          : ""}
                      </p>
                      <p className="text-stone/30 text-[10px] font-mono">
                        Used: {c.usedCount}
                        {c.maxUses ? `/${c.maxUses}` : ""} · Expires:{" "}
                        {formatDate(c.expiresAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({
                          id: c._id,
                          isActive: !c.isActive,
                        })
                      }
                      className="p-2 text-stone hover:text-cream transition-colors"
                      title={c.isActive ? "Deactivate" : "Activate"}
                    >
                      {c.isActive ? (
                        <ToggleRight size={20} className="text-emerald-400" />
                      ) : (
                        <ToggleLeft size={20} className="text-stone/40" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(c._id)}
                      className="p-2 text-stone/40 hover:text-vermillion transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </DashboardShell>

      <CreateCouponDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        queryClient={queryClient}
      />
    </PageWrapper>
  );
}