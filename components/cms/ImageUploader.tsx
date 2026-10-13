"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, X, Check, Image as ImageIcon, Loader2, ExternalLink } from "lucide-react";
import { useApp } from "@/lib/context";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  recommendedSize?: string;
}

export function ImageUploader({
  label,
  value,
  onChange,
  folder = "cms",
  recommendedSize = "1920x1080 or 800x600"
}: ImageUploaderProps) {
  const { showToast } = useApp();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      const errText = "Please select a valid image file (PNG, JPG, WEBP)";
      setError(errText);
      showToast(errText, "error");
      return;
    }

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      const errText = "Image size must be under 15MB";
      setError(errText);
      showToast(errText, "error");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      // Post to backend CMS upload route
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.post(`${apiUrl}/cms/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.data?.success && res.data?.url) {
        onChange(res.data.url);
        showToast("Image uploaded to S3 successfully!", "success");
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to upload image to S3";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    showToast("Image S3 URL copied to clipboard!", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#2B132C]">
          {label}
        </label>
        {recommendedSize && (
          <span className="text-[11px] text-[#8B5E34]/80">
            Recommended: {recommendedSize}
          </span>
        )}
      </div>

      {value ? (
        <div className="relative group rounded-2xl border border-[#B47F35]/25 overflow-hidden bg-[#FAF7F2] p-2">
          <div className="relative aspect-video w-full max-h-56 rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover transition-transform group-hover:scale-102"
            />
            
            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-white/95 text-xs font-semibold text-[#2B132C] hover:bg-white shadow transition-transform hover:scale-105 cursor-pointer"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  showToast("Image removed", "info");
                }}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-red-600/90 text-xs font-semibold text-white hover:bg-red-600 shadow transition-transform hover:scale-105 cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>

          {/* S3 URL details footer */}
          <div className="flex items-center justify-between mt-2 px-1 text-xs text-stone-600">
            <span className="truncate max-w-[280px] font-mono text-[11px]" title={value}>
              {value}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="text-[11px] text-[#B47F35] hover:underline font-medium cursor-pointer"
              >
                {copied ? "Copied!" : "Copy S3 URL"}
              </button>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-[#B47F35] hover:text-[#8B5E34]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
            uploading
              ? "border-[#B47F35] bg-[#B47F35]/5"
              : "border-[#B47F35]/30 hover:border-[#B47F35] bg-white hover:bg-[#FAF7F2]"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2 py-4">
              <Loader2 className="w-8 h-8 text-[#B47F35] animate-spin" />
              <p className="text-xs font-semibold text-[#2B132C]">
                Uploading directly to AWS S3...
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35]">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#2B132C]">
                Click or drag image to upload to S3
              </p>
              <p className="text-[11px] text-[#8B5E34]/70">
                Supports PNG, JPG, WEBP (Max 15MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-600 font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
