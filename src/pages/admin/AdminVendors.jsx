import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Store, Check, X, DollarSign, ChevronDown } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import DashboardShell from "../../components/layout/DashboardShell";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  getPendingKYC,
  reviewKYC,
  processAdminPayout,
} from "../../api/admin.api";
import { cn, formatDate } from "../../utils/formatters";
import { toast } from "sonner";

function VendorKYCRow({ vendor, onReview, onPayout }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectMsg, setRejectMsg] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="w-10 h-10 bg-gold/10 border border-gold/15 flex items-center justify-center text-gold font-display shrink-0">
          {vendor.storeName?.[0]?.toUpperCase() || "V"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-cream text-sm font-medium">{vendor.storeName}</p>
          <p className="text-stone/40 text-xs">
            {vendor.user?.name} · {vendor.user?.email || vendor.user?.phone}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-[10px] font-mono border px-2 py-0.5",
              vendor.kycStatus === "approved"
                ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
                : vendor.kycStatus === "pending"
                  ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/5"
                  : vendor.kycStatus === "rejected"
                    ? "text-vermillion border-vermillion/20 bg-vermillion/5"
                    : "text-stone border-white/[0.08]",
            )}
          >
            {vendor.kycStatus}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "text-stone/40 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-t border-white/[0.06] px-4 py-4 space-y-4"
        >
          {/* Documents */}
          {vendor.documents?.length > 0 && (
            <div>
              <p className="eyebrow text-stone/30 text-[10px] mb-2">
                Documents
              </p>
              <div className="flex flex-wrap gap-2">
                {vendor.documents.map((doc) => (
                  <a
                    key={doc._id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-[10px] font-mono border px-2.5 py-1.5 hover:border-gold/30 transition-colors capitalize",
                      doc.status === "approved"
                        ? "text-emerald-400 border-emerald-400/20"
                        : doc.status === "rejected"
                          ? "text-vermillion border-vermillion/20"
                          : "text-stone border-white/[0.1]",
                    )}
                  >
                    {doc.type.replace(/_/g, " ")} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* KYC info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-stone/30 mb-0.5">PAN</p>
              <p className="text-cream font-mono">{vendor.panNumber || "—"}</p>
            </div>
            <div>
              <p className="text-stone/30 mb-0.5">GST</p>
              <p className="text-cream font-mono">{vendor.gstNumber || "—"}</p>
            </div>
            <div>
              <p className="text-stone/30 mb-0.5">Submitted</p>
              <p className="text-cream">
                {vendor.kycSubmittedAt
                  ? formatDate(vendor.kycSubmittedAt)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-stone/30 mb-0.5">Total Earnings</p>
              <p className="text-cream font-mono">
                ₹{vendor.totalEarnings || 0}
              </p>
            </div>
          </div>

          {/* Actions */}
          {vendor.kycStatus === "pending" && (
            <div className="space-y-2">
              {showReject ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rejection reason"
                    value={rejectMsg}
                    onChange={(e) => setRejectMsg(e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-white/[0.07] text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none focus:border-vermillion/30"
                  />
                  <button
                    onClick={() =>
                      onReview(vendor._id, {
                        action: "reject",
                        reason: rejectMsg,
                      })
                    }
                    disabled={!rejectMsg.trim()}
                    className="px-3 py-2 bg-vermillion/10 border border-vermillion/30 text-vermillion text-xs disabled:opacity-40"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowReject(false)}
                    className="px-3 py-2 border border-white/[0.08] text-stone text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => onReview(vendor._id, { action: "approve" })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/15 transition-colors"
                  >
                    <Check size={12} /> Approve KYC
                  </button>
                  <button
                    onClick={() => setShowReject(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-vermillion/10 border border-vermillion/20 text-vermillion text-xs hover:bg-vermillion/15 transition-colors"
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function AdminVendors() {
  const [kycStatus, setKycStatus] = useState("pending");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-kyc", kycStatus],
    queryFn: async () => {
      const res = await getPendingKYC({ status: kycStatus, limit: 30 });
      return res.data; // ← ApiResponse object return karo
    },
    staleTime: 2 * 60 * 1000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ vendorId, data }) => reviewKYC(vendorId, data),
    onSuccess: () => {
      toast.success("KYC reviewed");
      queryClient.invalidateQueries({ queryKey: ["admin-kyc"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const vendors = data?.data?.vendors || [];

  return (
    <PageWrapper>
      <DashboardShell title="Vendor & KYC Management" subtitle="Admin">
        <div className="flex gap-1 mb-5">
          {["pending", "approved", "rejected", "not_submitted"].map((s) => (
            <button
              key={s}
              onClick={() => setKycStatus(s)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-mono border transition-all capitalize whitespace-nowrap",
                kycStatus === s
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-white/[0.07] text-stone/60 hover:text-cream",
              )}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16">
            <Store size={28} className="mx-auto text-stone/20 mb-4" />
            <p className="text-stone text-sm">No vendors in this category</p>
          </div>
        ) : (
          <div className="space-y-2">
            {vendors.map((v) => (
              <VendorKYCRow
                key={v._id}
                vendor={v}
                onReview={(vendorId, data) =>
                  reviewMutation.mutate({ vendorId, data })
                }
                onPayout={() => {}}
              />
            ))}
          </div>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}
