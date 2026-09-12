"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Upload, Sparkles, AlertCircle, RefreshCw, X } from "lucide-react";

interface QrCameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({
  onScanSuccess,
  onScanError,
  isOpen,
  onClose,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "file">("camera");

  const scannerRef = useRef<any>(null);
  const readerElementId = "interactive-qr-reader";
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const initScanner = async () => {
      try {
        setIsInitializing(true);
        setCameraError(null);

        const { Html5Qrcode } = await import("html5-qrcode");

        if (!isMounted) return;

        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setCameras(devices);
            const backCam = devices.find((d) =>
              d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("rear") || d.label.toLowerCase().includes("environment")
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          } else {
            setCameraError("No camera devices detected on this system.");
          }
        } catch (camErr: any) {
          setCameraError("Camera access permission was denied or is unavailable.");
        }
      } catch (err: any) {
        setCameraError("Failed to initialize QR scanner module.");
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen]);

  // Start live camera scanning
  const startCamera = async (cameraId?: string) => {
    try {
      setCameraError(null);
      setIsInitializing(true);

      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      const camIdToUse = cameraId || selectedCameraId;
      const cameraConfig = camIdToUse
        ? { deviceId: { exact: camIdToUse } }
        : { facingMode: "environment" };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(100);
          }
          stopCamera();
          onScanSuccess(decodedText);
        },
        (_errorMessage: string) => {
          // Continuous frame parsing error
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err?.message || "Failed to start camera feed. Please ensure camera permissions are allowed.");
      setIsCameraActive(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // Stop camera feed
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        // Ignore stop error on unmount
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Switch active camera
  const handleCameraChange = (newCameraId: string) => {
    setSelectedCameraId(newCameraId);
    if (isCameraActive) {
      startCamera(newCameraId);
    }
  };

  // Scan QR from image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsInitializing(true);
      setCameraError(null);

      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("temp-file-reader");

      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      onScanSuccess(decodedText);
    } catch (err: any) {
      setCameraError("Could not detect or decode a valid QR code from this image. Please try a clearer picture.");
      if (onScanError) onScanError("No QR code found in file");
    } finally {
      setIsInitializing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      <div id="temp-file-reader" className="hidden" />

      {/* Mode Switch Tabs: Live Camera vs Image File */}
      <div className="flex bg-bg-warm p-1 rounded-xl border border-primary-gold/15 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setScanMode("camera");
            setCameraError(null);
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            scanMode === "camera"
              ? "bg-white text-dark-surface shadow-xs font-bold"
              : "text-secondary-bronze/70 hover:text-dark-surface"
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-primary-gold" />
          <span>Live Camera View</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setScanMode("file");
            setCameraError(null);
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            scanMode === "file"
              ? "bg-white text-dark-surface shadow-xs font-bold"
              : "text-secondary-bronze/70 hover:text-dark-surface"
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-primary-gold" />
          <span>Upload QR Image</span>
        </button>
      </div>

      {/* CAMERA SCANNER TAB */}
      {scanMode === "camera" && (
        <div className="space-y-3">
          {/* Camera selector if multiple cameras exist */}
          {cameras.length > 1 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary-bronze font-medium">Select Video Source:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-primary-gold/25 bg-white text-dark-surface text-xs focus:outline-none"
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${cam.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Scanner Viewfinder Box */}
          <div className="relative rounded-2xl overflow-hidden bg-black min-h-[250px] flex items-center justify-center border-2 border-primary-gold/30 shadow-inner">
            <div
              id={readerElementId}
              className="w-full max-w-[280px] aspect-square flex items-center justify-center"
            />

            {/* Inactive overlay when camera is not running */}
            {!isCameraActive && !isInitializing && (
              <div className="absolute inset-0 bg-dark-surface/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-gold/20 flex items-center justify-center text-primary-gold border border-primary-gold/30">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold">Camera Scanner Standby</h4>
                  <p className="text-[11px] text-white/70 max-w-[220px] mt-0.5">
                    Click Start Camera to begin live optical QR pass detection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Live Camera</span>
                </button>
              </div>
            )}

            {/* Initializing Spinner */}
            {isInitializing && (
              <div className="absolute inset-0 bg-dark-surface/85 flex flex-col items-center justify-center text-white space-y-2">
                <RefreshCw className="w-8 h-8 text-primary-gold animate-spin" />
                <p className="text-xs text-white/80 font-medium">Connecting video stream...</p>
              </div>
            )}

            {/* Active scan animated overlay target */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-44 h-44 border-2 border-dashed border-primary-gold/80 rounded-2xl relative shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-gold shadow-[0_0_8px_#D4AF37] animate-pulse" />
                </div>
                <p className="text-[10px] text-white/90 bg-black/60 px-3 py-1 rounded-full mt-2 font-mono">
                  Align QR Code inside the square
                </p>
              </div>
            )}
          </div>

          {/* Camera controls bar */}
          {isCameraActive && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-1.5 rounded-lg border border-error-red/30 bg-error-red/10 text-error-red text-xs font-semibold hover:bg-error-red/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span>Stop Camera</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* IMAGE FILE QR SCANNER TAB */}
      {scanMode === "file" && (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary-gold/30 hover:border-primary-gold bg-bg-warm/30 hover:bg-bg-warm/60 transition-all rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-dark-surface">
                Upload or drop QR pass image file
              </p>
              <p className="text-[11px] text-secondary-bronze/70 mt-0.5">
                Supports PNG, JPG, WEBP, or camera screenshots
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-primary-gold text-white text-[11px] font-medium shadow-xs">
              Browse File
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Error notification */}
      {cameraError && (
        <div className="p-3 rounded-xl bg-error-red/10 border border-error-red/20 text-error-red flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}
    </div>
  );
};
