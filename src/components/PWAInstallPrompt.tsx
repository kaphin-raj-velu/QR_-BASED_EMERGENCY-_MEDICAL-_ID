import React, { useState, useEffect } from "react";
import { 
  Download, 
  X, 
  Smartphone, 
  ArrowUpFromLine, 
  PlusSquare, 
  HeartPulse, 
  Monitor, 
  Menu, 
  Laptop,
  CheckCircle2,
  Info
} from "lucide-react";

interface PWAInstallPromptProps {
  onShowMessage: (text: string, type: "success" | "error") => void;
}

export default function PWAInstallPrompt({ onShowMessage }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  
  // Platform and browser state
  const [browserInfo, setBrowserInfo] = useState<{
    isIOS: boolean;
    isSafari: boolean;
    isChrome: boolean;
    isEdge: boolean;
    isFirefox: boolean;
    isMac: boolean;
    isMobile: boolean;
  }>({
    isIOS: false,
    isSafari: false,
    isChrome: false,
    isEdge: false,
    isFirefox: false,
    isMac: false,
    isMobile: false,
  });

  useEffect(() => {
    // 1. Detect environment, device, and browser
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    const isMacDevice = /macintosh|mac os x/.test(userAgent) && !isApple;
    const isMobileDevice = /mobile|android|iphone|ipad|ipod/.test(userAgent);
    
    const isSafariBrowser = /safari/.test(userAgent) && !/chrome|crios|crmo|firefox|fxios|opera|opr|edge|edg/.test(userAgent);
    const isChromeBrowser = /chrome|crios/.test(userAgent) && !/edge|edg/.test(userAgent);
    const isEdgeBrowser = /edge|edg/.test(userAgent);
    const isFirefoxBrowser = /firefox|fxios/.test(userAgent);

    setBrowserInfo({
      isIOS: isApple,
      isSafari: isSafariBrowser,
      isChrome: isChromeBrowser,
      isEdge: isEdgeBrowser,
      isFirefox: isFirefoxBrowser,
      isMac: isMacDevice,
      isMobile: isMobileDevice,
    });

    // 2. Check if already running in standalone (PWA) mode
    const isStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // 3. Show prompt on every fresh page visit (no localStorage block)
    // We add a short delay to let the app load elegantly first
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1500);

    // 4. Handle native install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      onShowMessage("Native installation not triggered. Please follow the custom instructions below.", "error");
      return;
    }

    setShowPrompt(false);
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Installation outcome: ${outcome}`);

    if (outcome === "accepted") {
      onShowMessage("Thank you for installing LifelineID! It is now on your Home Screen.", "success");
    }

    setDeferredPrompt(null);
  };

  const handleCancelClick = () => {
    setShowPrompt(false);
  };

  // If already installed, do not show
  if (isStandalone || !showPrompt) {
    return null;
  }

  // Determine what helper guide to show based on browser/platform
  const renderInstructions = () => {
    if (deferredPrompt) {
      return (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Click <strong className="text-gray-900">Install Now</strong> below to instantly add LifelineID to your home screen for quick offline access.
          </p>
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black py-3 px-4 transition-all shadow-md shadow-red-150 active:scale-95"
              id="pwa-install-confirm-btn"
            >
              <Download className="h-4 w-4" />
              Install Now
            </button>
            <button
              onClick={handleCancelClick}
              className="flex-1 inline-flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 text-gray-700 text-xs font-bold py-3 px-4 transition-all border border-gray-200 active:scale-95"
              id="pwa-install-cancel-btn"
            >
              Maybe Later
            </button>
          </div>
        </div>
      );
    }

    // 1. iOS Safari
    if (browserInfo.isIOS && browserInfo.isSafari) {
      return (
        <div className="mt-4 bg-rose-50/60 border border-rose-100/50 rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-red-600" />
            iOS Safari Installation:
          </p>
          <div className="space-y-2 text-xs text-gray-700 font-medium leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">1</span>
              <span>Tap the <strong className="text-gray-900">Share</strong> button <ArrowUpFromLine className="h-4 w-4 text-blue-500 inline mx-0.5 shrink-0" /> in Safari's bottom toolbar.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">2</span>
              <span>Scroll down the share sheet and select <strong className="text-gray-900">"Add to Home Screen"</strong> <PlusSquare className="h-4 w-4 text-gray-700 inline mx-0.5 shrink-0" />.</span>
            </p>
          </div>
          <button
            onClick={handleCancelClick}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-rose-200 text-red-700 text-xs font-bold py-2 px-4 hover:bg-rose-50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Got It, Thanks!
          </button>
        </div>
      );
    }

    // 2. macOS Safari
    if (browserInfo.isMac && browserInfo.isSafari) {
      return (
        <div className="mt-4 bg-rose-50/60 border border-rose-100/50 rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-2">
            <Laptop className="h-4 w-4 text-red-600" />
            Mac Safari Installation:
          </p>
          <div className="space-y-2 text-xs text-gray-700 font-medium leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">1</span>
              <span>Click <strong className="text-gray-900">File</strong> in the top menu bar.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">2</span>
              <span>Select <strong className="text-gray-900">"Add to Dock..."</strong> to create an app icon in your Dock.</span>
            </p>
          </div>
          <button
            onClick={handleCancelClick}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-rose-200 text-red-700 text-xs font-bold py-2 px-4 hover:bg-rose-50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Got It!
          </button>
        </div>
      );
    }

    // 3. Desktop Chrome / Edge
    if (!browserInfo.isMobile && (browserInfo.isChrome || browserInfo.isEdge)) {
      return (
        <div className="mt-4 bg-rose-50/60 border border-rose-100/50 rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-red-600" />
            Browser Address Bar Installation:
          </p>
          <div className="space-y-2 text-xs text-gray-700 font-medium leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">1</span>
              <span>Look at the right-hand side of your browser's <strong className="text-gray-900">address bar</strong> at the top.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">2</span>
              <span>Click the <strong className="text-gray-900">Install icon</strong> (a computer monitor with a down-arrow, or a plus sign <strong className="text-red-600">+</strong>).</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">3</span>
              <span>Alternatively, open the menu <Menu className="h-3.5 w-3.5 inline mx-0.5 text-gray-600" /> and select <strong className="text-gray-900">"Install LifelineID..."</strong> or <strong className="text-gray-900">"Save and Share"</strong>.</span>
            </p>
          </div>
          <button
            onClick={handleCancelClick}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-rose-200 text-red-700 text-xs font-bold py-2 px-4 hover:bg-rose-50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            I Understand
          </button>
        </div>
      );
    }

    // 4. Firefox (either desktop or mobile)
    if (browserInfo.isFirefox) {
      return (
        <div className="mt-4 bg-rose-50/60 border border-rose-100/50 rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-2">
            <Info className="h-4 w-4 text-red-600" />
            Firefox Installation Guide:
          </p>
          <div className="space-y-2 text-xs text-gray-700 font-medium leading-relaxed">
            {browserInfo.isMobile ? (
              <>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">1</span>
                  <span>Tap the menu button (three vertical dots) near the address bar.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">2</span>
                  <span>Select <strong className="text-gray-900">"Install"</strong> or <strong className="text-gray-900">"Add to Home Screen"</strong>.</span>
                </p>
              </>
            ) : (
              <>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">1</span>
                  <span>Click the menu icon (three lines) in the top-right corner.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">2</span>
                  <span>Select <strong className="text-gray-900">"More Tools"</strong> and click <strong className="text-gray-900">"Install..."</strong> or <strong className="text-gray-900">"Add to Desktop..."</strong>.</span>
                </p>
              </>
            )}
          </div>
          <button
            onClick={handleCancelClick}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-rose-200 text-red-700 text-xs font-bold py-2 px-4 hover:bg-rose-50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Got It!
          </button>
        </div>
      );
    }

    // 5. Generic / Fallback Mobile & Tablet
    if (browserInfo.isMobile) {
      return (
        <div className="mt-4 bg-rose-50/60 border border-rose-100/50 rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-red-600" />
            Mobile Browser Installation:
          </p>
          <div className="space-y-2 text-xs text-gray-700 font-medium leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">1</span>
              <span>Tap your browser's menu (usually three vertical dots <strong className="text-gray-900">⋮</strong> or horizontal lines <strong className="text-gray-900">☰</strong>).</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">2</span>
              <span>Select <strong className="text-gray-900">"Add to Home Screen"</strong> or <strong className="text-gray-900">"Install App"</strong>.</span>
            </p>
          </div>
          <button
            onClick={handleCancelClick}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-rose-200 text-red-700 text-xs font-bold py-2 px-4 hover:bg-rose-50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Okay, Got It!
          </button>
        </div>
      );
    }

    // 6. Generic Desktop Fallback
    return (
      <div className="mt-4 bg-rose-50/60 border border-rose-100/50 rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-red-600" />
            Browser Settings Installation:
          </p>
          <div className="space-y-2 text-xs text-gray-700 font-medium leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">1</span>
              <span>Open your browser's settings menu (usually in the top-right corner).</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">2</span>
              <span>Select <strong className="text-gray-900">"Install App"</strong>, <strong className="text-gray-900">"Add to Applications"</strong> or similar.</span>
            </p>
          </div>
          <button
            onClick={handleCancelClick}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-rose-200 text-red-700 text-xs font-bold py-2 px-4 hover:bg-rose-50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Got It!
          </button>
        </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 bg-slate-900/45 backdrop-blur-xs animate-fadeIn"
      id="pwa-install-backdrop"
    >
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-rose-100/80 animate-slideUp relative max-h-[90vh] overflow-y-auto"
        id="pwa-install-overlay"
      >
        <div className="flex gap-4 items-start relative">
          {/* Close Button */}
          <button 
            onClick={handleCancelClick}
            className="absolute -right-1 -top-1 h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors border border-gray-100"
            id="pwa-close-btn"
            title="Dismiss prompt"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Brand App Icon (Red Cross Pulsing Icon) */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white shrink-0 shadow-lg shadow-red-100">
            <HeartPulse className="h-6 w-6 animate-pulse" />
          </div>

          {/* Content Details */}
          <div className="flex-1 text-left pr-6">
            <span className="text-[10px] font-black uppercase text-red-600 tracking-wider block">
              PWA Application Ready
            </span>
            <h3 className="text-base font-black text-gray-900 mt-1 leading-tight">
              Install LifelineID App
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1.5">
              Add LifelineID to your home screen, desktop, or dock. Access your medical emergency QR card instantly, even when offline!
            </p>

            {/* Dynamic Interactive Installation Steps */}
            {renderInstructions()}
          </div>
        </div>
      </div>
    </div>
  );
}
