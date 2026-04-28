import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Building,
  CreditCard,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import DashboardShell from "../../components/layout/DashboardShell";
import {
  getVendorProfile,
  submitKYC,
  updateBankDetails,
} from "../../api/vendor.api";
import { cn } from "../../utils/formatters";
import { toast } from "sonner";

const bankSchema = z.object({
  accountHolderName: z.string().min(2),
  accountNumber: z.string().min(9).max(18),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC"),
  bankName: z.string().min(2),
  branchName: z.string().optional(),
});

const DOC_TYPES = [
  { key: "pan", label: "PAN Card", required: true },
  { key: "aadhar", label: "Aadhar Card", required: true },
  { key: "gst", label: "GST Certificate", required: false },
  { key: "cancelled_cheque", label: "Cancelled Cheque", required: false },
];

// ── Status badge ──────────────────────────────────────────────────────────────
function KYCStatusBadge({ status }) {
  const map = {
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      className: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
    },
    pending: {
      label: "Under Review",
      icon: Clock,
      className: "text-yellow-500 border-yellow-500/20 bg-yellow-500/5",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "text-vermillion border-vermillion/20 bg-vermillion/5",
    },
    not_submitted: {
      label: "Not Submitted",
      icon: Upload,
      className: "text-stone border-white/[0.1] bg-white/[0.02]",
    },
  };
  const { label, icon: Icon, className } = map[status] || map.not_submitted;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-mono border px-3 py-1.5",
        className,
      )}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

// ── Doc upload tile ───────────────────────────────────────────────────────────
function DocUploadTile({ doc, uploaded, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size 5MB");
      return;
    }
    setPreview(URL.createObjectURL(file));
    onChange(doc.key, file);
  };

  const existing = uploaded?.find((d) => d.type === doc.key);

  return (
    <div
      className={cn(
        "border p-4 transition-all duration-300",
        preview || existing?.status === "approved"
          ? "border-gold/30 bg-gold/3"
          : existing?.status === "pending"
            ? "border-yellow-500/20 bg-yellow-500/3"
            : "border-white/[0.07] bg-[#0f0f0f]",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-cream text-sm font-medium">{doc.label}</p>
          {doc.required && (
            <span className="text-[10px] text-vermillion/60 font-mono">
              Required
            </span>
          )}
        </div>
        {existing && (
          <span
            className={cn(
              "text-[10px] font-mono border px-2 py-0.5",
              existing.status === "approved"
                ? "text-emerald-400 border-emerald-400/20"
                : existing.status === "pending"
                  ? "text-yellow-500 border-yellow-500/20"
                  : existing.status === "rejected"
                    ? "text-vermillion border-vermillion/20"
                    : "text-stone border-white/[0.1]",
            )}
          >
            {existing.status}
          </span>
        )}
      </div>

      {preview ? (
        <div className="relative w-full h-24 mb-3 overflow-hidden bg-[#111] border border-white/[0.06]">
          <img
            src={preview}
            alt={doc.label}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => {
              setPreview(null);
              onChange(doc.key, null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-vermillion/80 flex items-center justify-center text-cream text-xs"
          >
            ×
          </button>
        </div>
      ) : existing?.url ? (
        <div className="w-full h-16 mb-3 overflow-hidden bg-[#111] border border-white/[0.06] flex items-center justify-center">
          <img
            src={existing.url}
            alt={doc.label}
            className="h-full object-contain"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/[0.1] text-stone/50 hover:text-cream hover:border-gold/30 transition-all text-xs"
      >
        <Upload size={13} />
        {preview || existing ? "Replace" : "Upload"} {doc.label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFile}
      />
      <p className="text-[10px] text-stone/25 mt-1.5 text-center">
        JPG, PNG or PDF • Max 5MB
      </p>
    </div>
  );
}

export default function VendorKYC() {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: async () => {
      const { data } = await getVendorProfile();
      return data.data.vendor;
    },
    staleTime: 2 * 60 * 1000,
  });

  const vendor = data;

  const {
    register: bankReg,
    handleSubmit: bankSubmit,
    formState: { errors: bankErrors },
  } = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: vendor?.bankDetails || {},
  });

  const kycMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });
      return submitKYC(fd);
    },
    onSuccess: () => {
      toast.success("KYC submitted for review");
      queryClient.invalidateQueries({ queryKey: ["vendor-profile"] });
      setFiles({});
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "KYC submission failed"),
  });

  const bankMutation = useMutation({
    mutationFn: (d) => {
      // Empty strings ko remove karo before sending
      const cleaned = Object.fromEntries(
        Object.entries(d).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined,
        ),
      );
      return updateBankDetails(cleaned);
    },
    onSuccess: () => {
      toast.success("Bank details saved");
      queryClient.invalidateQueries({ queryKey: ["vendor-profile"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to save"),
  });

  const handleFileChange = (key, file) =>
    setFiles((p) => ({ ...p, [key]: file }));

  const hasFiles = Object.values(files).some(Boolean);

  return (
    <PageWrapper>
      <DashboardShell title="KYC Verification" subtitle="Vendor">
        {/* Status banner */}
        {!isLoading && vendor && (
          <div className="flex items-start sm:items-center justify-between gap-4 bg-[#0d0d0d] border border-white/[0.07] p-4 sm:p-5 mb-6 flex-col sm:flex-row">
            <div>
              <p className="text-cream text-sm font-medium mb-1">
                Verification Status
              </p>
              <p className="text-stone/50 text-xs">
                {vendor.kycStatus === "approved"
                  ? "Your KYC is verified. You can list products and receive payouts."
                  : vendor.kycStatus === "pending"
                    ? "Documents under review. Usually takes 1-2 business days."
                    : vendor.kycStatus === "rejected"
                      ? `Rejected: ${vendor.kycRejectionReason || "Please re-submit corrected documents"}`
                      : "Submit your KYC documents to start selling."}
              </p>
            </div>
            <KYCStatusBadge status={vendor.kycStatus} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Upload size={14} className="text-gold" />
              <p className="eyebrow text-stone/40 text-[10px]">
                Identity Documents
              </p>
            </div>

            <div className="space-y-4 mb-5">
              {DOC_TYPES.map((doc) => (
                <DocUploadTile
                  key={doc.key}
                  doc={doc}
                  uploaded={vendor?.documents || []}
                  onChange={handleFileChange}
                />
              ))}
            </div>

            <motion.button
              onClick={() => kycMutation.mutate()}
              disabled={
                !hasFiles ||
                kycMutation.isPending ||
                vendor?.kycStatus === "pending"
              }
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {kycMutation.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {vendor?.kycStatus === "pending"
                ? "Pending Review"
                : vendor?.kycStatus === "approved"
                  ? "Re-submit Documents"
                  : "Submit for Verification"}
            </motion.button>
          </div>

          {/* Bank details */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Building size={14} className="text-gold" />
              <p className="eyebrow text-stone/40 text-[10px]">
                Bank Details (for payouts)
              </p>
            </div>

            <form
              onSubmit={bankSubmit((d) => bankMutation.mutate(d))}
              className="space-y-4"
            >
              {[
                {
                  name: "accountHolderName",
                  label: "Account Holder Name",
                  placeholder: "Full name as on bank account",
                },
                {
                  name: "accountNumber",
                  label: "Account Number",
                  placeholder: "1234567890123",
                },
                {
                  name: "ifscCode",
                  label: "IFSC Code",
                  placeholder: "SBIN0001234",
                },
                {
                  name: "bankName",
                  label: "Bank Name",
                  placeholder: "State Bank of India",
                },
                {
                  name: "branchName",
                  label: "Branch Name",
                  placeholder: "Fort Branch (optional)",
                },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
                    {label}
                  </label>
                  <input
                    {...bankReg(name)}
                    placeholder={placeholder}
                    className={cn(
                      "w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none transition-all",
                      "focus:border-gold/40",
                      bankErrors[name]
                        ? "border-vermillion/40"
                        : "border-white/[0.07]",
                    )}
                  />
                  {bankErrors[name] && (
                    <p className="text-[10px] text-vermillion/80 mt-1">
                      {bankErrors[name].message}
                    </p>
                  )}
                </div>
              ))}

              {vendor?.bankDetails?.accountNumber && (
                <div className="flex items-center gap-2 text-xs text-stone/50 font-mono">
                  <CreditCard size={12} />
                  Current: ****{vendor.bankDetails.accountNumber.slice(-4)}
                  {vendor.bankDetails.isVerified && (
                    <span className="text-emerald-400">✓ Verified</span>
                  )}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={bankMutation.isPending}
                whileTap={{ scale: 0.97 }}
                className="w-full btn-outline py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {bankMutation.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Save Bank Details
              </motion.button>
            </form>
          </div>
        </div>
      </DashboardShell>
    </PageWrapper>
  );
}
