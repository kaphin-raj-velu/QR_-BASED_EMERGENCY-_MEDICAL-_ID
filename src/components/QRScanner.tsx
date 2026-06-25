import React, { useEffect, useRef, useState } from "react";
import { Camera, Upload, AlertCircle, Scan, Sparkles, Image as ImageIcon } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { normalizeSearchId, validateSearchId } from "../utils/normalize.js";

interface QRScannerProps {
  onScanSuccess: (userId: string) => void;
  onShowMessage: (text: string, type: "success" | "error") => void;
}

export default function QRScanner({ onScanSuccess, onShowMessage }: QRScannerProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "manual">("camera");
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualId, setManualId] = useState("");
  
  const qrRegionId = "html5-qrcode-viewfinder";
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  // Parse LifelineID userId from scanned URL (case-insensitive and space-tolerant)
  const handleScannedText = (text: string) => {
    try {
      console.log("Scanned text:", text);
      let userId = text.trim();
      
      // If it's a full URL path
      if (userId.includes("/emergency/")) {
        const parts = userId.split("/emergency/");
        userId = parts[parts.length - 1];
      }
      
      // Remove any query parameters or trailing slashes
      if (userId.includes("?")) {
        userId = userId.split("?")[0];
      }
      if (userId.endsWith("/")) {
        userId = userId.slice(0, -1);
      }
      
      // Run case-insensitive, space-insensitive normalization
      const normalizedUserId = normalizeSearchId(userId);

      // Perform validation check
      const validationError = validateSearchId(normalizedUserId);
      if (validationError) {
        throw new Error(validationError);
      }

      // Cleanup camera before redirecting
      stopCamera();
      onShowMessage("Patient profile located! Loading medical records...", "success");
      onScanSuccess(normalizedUserId);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid Patient ID or QR contents.");
      onShowMessage(err.message || "Search failed", "error");
    }
  };

  const startCamera = async () => {
    setErrorMsg(null);
    setScanning(true);
    
    try {
      // Ensure container is empty before initializing
      const element = document.getElementById(qrRegionId);
      if (element) element.innerHTML = "";

      const html5Qrcode = new Html5Qrcode(qrRegionId);
      html5QrcodeRef.current = html5Qrcode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await html5Qrcode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleScannedText(decodedText);
        },
        (errorMessage) => {
          // Silent scan error: can occur repeatedly while waiting for QR
        }
      );
    } catch (err: any) {
      console.error("Camera scan start error:", err);
      let errorText = "Unable to access camera.";
      if (err.name === "NotAllowedError") {
        errorText = "Camera permission denied. Please allow camera access or try the file upload method.";
      } else if (err.name === "NotFoundError" || err.message?.includes("No video")) {
        errorText = "No video capture devices found on your system.";
      }
      setErrorMsg(errorText);
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        const element = document.getElementById(qrRegionId);
        if (element) element.innerHTML = "";
      } catch (err) {
        console.error("Failed to stop scanner camera:", err);
      }
    }
    setScanning(false);
  };

  // Handle local file selection for QR scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    onShowMessage("Processing uploaded image...", "success");

    try {
      const html5Qrcode = new Html5Qrcode("html5-qrcode-dummy-region");
      const decodedText = await html5Qrcode.scanFile(file, true);
      handleScannedText(decodedText);
    } catch (err: any) {
      console.error("File scanning error:", err);
      setErrorMsg("Failed to decode QR from this image. Please make sure the QR is clear and well-lit.");
      onShowMessage("No readable QR Code found in image.", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center justify-center gap-2">
          <Scan className="h-7 w-7 text-red-600 animate-pulse" />
          Scan Emergency Medical QR
        </h2>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Paramedic, police, or bystander? Use either the camera or upload an image of the patient's card to instantly view their life-saving medical data.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
        <button
          onClick={() => { setActiveTab("camera"); setErrorMsg(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "camera"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          id="scanner-tab-camera"
        >
          <Camera className="h-4 w-4" />
          Live Camera Scan
        </button>
        <button
          onClick={() => { setActiveTab("upload"); setErrorMsg(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "upload"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          id="scanner-tab-upload"
        >
          <Upload className="h-4 w-4" />
          Upload QR Image
        </button>
        <button
          onClick={() => { setActiveTab("manual"); setErrorMsg(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "manual"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          id="scanner-tab-manual"
        >
          <Scan className="h-4 w-4" />
          Manual ID Entry
        </button>
      </div>

      {/* Frame Container */}
      <div className="bento-card min-h-[350px] flex flex-col justify-between">
        
        {/* Camera Scanner Panel */}
        {activeTab === "camera" && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            
            {/* Camera Viewfinder */}
            <div className="relative overflow-hidden rounded-2xl bg-gray-950 aspect-square w-full max-w-[280px] border-4 border-gray-800 shadow-inner flex items-center justify-center">
              {scanning && <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-bounce shadow-[0_0_8px_rgba(239,68,68,1)] z-10" />}
              
              <div id={qrRegionId} className="w-full h-full object-cover text-white flex items-center justify-center font-mono text-[10px]" />
              
              {!scanning && !errorMsg && (
                <div className="absolute text-center p-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-500 border-t-transparent mx-auto" />
                  <p className="mt-3 text-xs text-gray-400 font-semibold uppercase">Waking up lens...</p>
                </div>
              )}

              {errorMsg && (
                <div className="absolute inset-0 p-4 bg-gray-900/95 flex flex-col items-center justify-center text-center space-y-3 z-20">
                  <AlertCircle className="h-8 w-8 text-red-500 animate-pulse" />
                  <p className="text-xs text-red-200 leading-relaxed font-semibold">{errorMsg}</p>
                  <p className="text-[10px] text-gray-400 max-w-xs leading-normal">
                    Camera access blocked by the browser inside this environment? Try using the <strong className="text-white">Manual ID Entry</strong> tab above to type the ID directly.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-transform"
                    >
                      Retry Camera
                    </button>
                    <button
                      onClick={() => setActiveTab("manual")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-850 border border-gray-700 px-3 py-1.5 text-xs font-bold text-gray-200 shadow-sm hover:bg-gray-700 active:scale-95 transition-transform"
                    >
                      Use Manual Input
                    </button>
                  </div>
                </div>
              )}
            </div>

            {scanning && (
              <p className="text-xs text-gray-500 font-bold flex items-center gap-2 animate-pulse bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                Align medical QR inside the finder frame...
              </p>
            )}
          </div>
        )}

        {/* Upload Scanner Panel */}
        {activeTab === "upload" && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-6">
            
            <label className="group flex flex-col items-center justify-center w-full max-w-[320px] aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-red-400 cursor-pointer transition-all p-6 text-center shadow-inner">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 border border-gray-150 group-hover:text-red-500 group-hover:border-red-200 shadow-md transition-colors">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Drop QR Code Here</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse local files</p>
                </div>
                <span className="inline-flex rounded-lg bg-red-50 text-red-700 border border-red-100/55 px-2.5 py-1 text-[10px] font-bold">
                  PNG, JPG, or PDF
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="scanner-file-input"
              />
            </label>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 max-w-sm">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-900 leading-relaxed font-semibold">{errorMsg}</p>
              </div>
            )}

            <p className="text-xs text-gray-400 font-medium max-w-xs text-center">
              Quick test: Download your personal medical QR PNG card, upload it here, and verify that the system fetches your public emergency profile immediately.
            </p>
          </div>
        )}

        {/* Manual ID Entry Panel */}
        {activeTab === "manual" && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-5">
            <div className="text-center space-y-2 max-w-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 mx-auto shadow-sm">
                <Scan className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Direct Medical ID Lookup</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                If the camera scanner is blocked or you don't have a QR image, type or paste the Patient ID below.
              </p>
            </div>

            <div className="w-full max-w-md space-y-3 px-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 text-left">
                  Patient ID, Full Name, or Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => {
                      setManualId(e.target.value);
                      setErrorMsg(null); // Clear error on keystroke
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleScannedText(manualId);
                      }
                    }}
                    placeholder="e.g. harish or usr_abcdefghi"
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    id="manual-id-input"
                  />
                  <button
                    onClick={() => {
                      handleScannedText(manualId);
                    }}
                    className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:from-red-700 hover:to-rose-700 active:scale-95 transition-transform"
                    id="manual-lookup-submit"
                  >
                    Lookup
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex gap-2 text-left">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-900 leading-relaxed font-semibold">{errorMsg}</p>
                </div>
              )}

              <div className="rounded-xl bg-slate-50 border border-slate-150 p-3 text-[11px] text-gray-500 leading-normal text-left">
                <span className="font-bold text-gray-700 block mb-0.5">How to search:</span> Type either the unique patient ID, registered full name, or email address. Press the <strong>Lookup</strong> button or hit the <strong>Enter</strong> key to fetch the emergency medical record instantly.
              </div>
            </div>
          </div>
        )}

        {/* Dummy Region required for html5-qrcode static scan file */}
        <div id="html5-qrcode-dummy-region" className="hidden" />

      </div>

    </div>
  );
}
