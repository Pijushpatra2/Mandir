"use client";

import React, { useState, useRef } from "react";
import { StoreRequisition } from "@/types/requisition.types";
import {
  useUploadRequisitionReceipt,
  useDeleteRequisitionReceipt,
} from "@/lib/api/requisitions";
import {
  Receipt,
  Upload,
  Download,
  Eye,
  Trash2,
  FileText,
  ImageIcon,
  ExternalLink,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Calendar,
  User,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RequisitionReceiptModalProps {
  requisition: StoreRequisition;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: string;
  currentUserName?: string;
  onSuccess?: () => void;
}

export default function RequisitionReceiptModal({
  requisition,
  isOpen,
  onClose,
  currentUserRole = "STAFF",
  currentUserName = "Canteen Manager",
  onSuccess,
}: RequisitionReceiptModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [receiptNotes, setReceiptNotes] = useState(requisition.receipt_notes || "");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useUploadRequisitionReceipt();
  const deleteMutation = useDeleteRequisitionReceipt();

  if (!isOpen) return null;

  const hasExistingReceipt = Boolean(requisition.receipt_url);
  const isPdf =
    (requisition.receipt_filename?.toLowerCase().endsWith(".pdf")) ||
    (requisition.receipt_url?.toLowerCase().includes(".pdf")) ||
    (selectedFile?.type === "application/pdf") ||
    (selectedFile?.name.toLowerCase().endsWith(".pdf"));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedFile && !hasExistingReceipt) {
      setFeedback({ type: "error", message: "Please select an image or PDF receipt to upload." });
      return;
    }

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("receipt", selectedFile);
      }
      formData.append("receipt_uploaded_by", currentUserName || currentUserRole);
      formData.append("receipt_notes", receiptNotes.trim());

      await uploadMutation.mutateAsync({
        id: requisition.id,
        formData,
      });

      setFeedback({ type: "success", message: "Receipt saved successfully!" });
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || err.message || "Failed to upload receipt.",
      });
    }
  };

  const handleDeleteReceipt = async () => {
    if (!confirm("Are you sure you want to delete this receipt? This action cannot be undone.")) {
      return;
    }

    try {
      setFeedback(null);
      await deleteMutation.mutateAsync(requisition.id);
      setFeedback({ type: "success", message: "Receipt removed successfully." });
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setReceiptNotes("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || err.message || "Failed to delete receipt.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-dark-surface">
                Requisition Receipt: {requisition.requisition_number}
              </h3>
              <p className="text-xs text-secondary-bronze/70">
                Department: <strong>{requisition.department}</strong> | Requester:{" "}
                <strong>{requisition.requested_by_name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Feedback alerts */}
          {feedback && (
            <div
              className={cn(
                "p-3 rounded-xl flex items-center space-x-2 border text-xs font-semibold",
                feedback.type === "success"
                  ? "bg-success-green/10 border-success-green/30 text-success-green"
                  : "bg-error-red/10 border-error-red/30 text-error-red"
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Mode 1: Edit / Upload Form */}
          {isEditing || !hasExistingReceipt ? (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary-gold/5 border border-primary-gold/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-dark-surface text-sm flex items-center space-x-1.5">
                    <Upload className="w-4 h-4 text-primary-gold" />
                    <span>{hasExistingReceipt ? "Update / Replace Receipt" : "Upload Requisition Receipt"}</span>
                  </span>
                  <span className="text-[10px] text-secondary-bronze/70">Images (JPG, PNG, WEBP) or PDF</span>
                </div>

                {/* Dropzone / File Picker */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary-gold/30 hover:border-primary-gold rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-white transition-colors space-y-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="max-h-48 rounded-xl object-contain border border-primary-gold/20 shadow-xs"
                      />
                      <p className="text-[11px] font-bold text-dark-surface">{selectedFile?.name}</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-dark-surface">{selectedFile.name}</p>
                      <p className="text-[10px] text-secondary-bronze/70">
                        {(selectedFile.size / 1024).toFixed(1)} KB (Ready to upload)
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-primary-gold/10 text-primary-gold flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-dark-surface text-xs">
                          Click or drag receipt file here
                        </p>
                        <p className="text-[10px] text-secondary-bronze/60 mt-0.5">
                          Support bill scans, delivery slips, vendor invoices & receipts (up to 15MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Notes Input */}
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">
                    Receipt Notes / Invoice Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vendor Invoice #8841 - Paid cash upon store delivery"
                    value={receiptNotes}
                    onChange={(e) => setReceiptNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-between pt-2">
                {hasExistingReceipt ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={uploadMutation.isPending || (!selectedFile && !hasExistingReceipt)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadMutation.isPending ? "Uploading..." : "Save Receipt"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Mode 2: View Existing Receipt */
            <div className="space-y-5">
              {/* Receipt Info Card */}
              <div className="p-4 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-success-green" />
                    <span className="font-bold text-dark-surface text-sm">
                      {requisition.receipt_filename || "Requisition Receipt"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 rounded-xl border border-primary-gold/30 bg-white hover:bg-primary-gold/10 text-xs font-semibold text-secondary-bronze flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Replace or update this receipt"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-primary-gold" />
                      <span>Edit Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteReceipt}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1.5 rounded-xl border border-error-red/30 bg-white hover:bg-error-red/10 text-xs font-semibold text-error-red flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Delete this receipt"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Metadata tags */}
                <div className="flex flex-wrap gap-4 text-[11px] text-secondary-bronze/80 pt-1 border-t border-primary-gold/10">
                  {requisition.receipt_uploaded_by && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-primary-gold" />
                      <span>Uploaded by: <strong>{requisition.receipt_uploaded_by}</strong></span>
                    </div>
                  )}
                  {requisition.receipt_uploaded_at && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-gold" />
                      <span>
                        Date: <strong>{new Date(requisition.receipt_uploaded_at).toLocaleString()}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {requisition.receipt_notes && (
                  <div className="p-2.5 rounded-xl bg-white border border-primary-gold/15 text-xs text-dark-surface italic">
                    &ldquo;{requisition.receipt_notes}&rdquo;
                  </div>
                )}
              </div>

              {/* Receipt Preview Window */}
              <div className="border border-primary-gold/20 rounded-2xl p-4 bg-white flex flex-col items-center justify-center space-y-3">
                {isPdf ? (
                  <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-error-red/10 text-error-red flex items-center justify-center">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-dark-surface text-sm">PDF Document Receipt</p>
                      <p className="text-[11px] text-secondary-bronze/70">
                        {requisition.receipt_filename || "Receipt.pdf"}
                      </p>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <a
                        href={requisition.receipt_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open PDF in New Tab</span>
                      </a>
                      <a
                        href={requisition.receipt_url!}
                        download={requisition.receipt_filename || "receipt.pdf"}
                        className="px-4 py-2 rounded-xl border border-secondary-bronze/30 hover:bg-bg-warm text-secondary-bronze font-bold text-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="w-full max-h-[360px] overflow-auto rounded-xl border border-primary-gold/15 bg-bg-warm/20 p-2 flex items-center justify-center">
                      <img
                        src={requisition.receipt_url!}
                        alt="Requisition receipt"
                        className="max-h-[340px] w-auto object-contain rounded-lg shadow-xs hover:scale-102 transition-transform cursor-pointer"
                        onClick={() => window.open(requisition.receipt_url!, "_blank")}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={requisition.receipt_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-primary-gold hover:brightness-105 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Full Screen</span>
                      </a>
                      <a
                        href={requisition.receipt_url!}
                        download={requisition.receipt_filename || "receipt.jpg"}
                        className="px-4 py-2 rounded-xl border border-secondary-bronze/30 hover:bg-bg-warm text-secondary-bronze font-bold text-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-primary-gold/15 bg-bg-warm/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
