import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, ArrowUpFromLine, PlusSquare, HeartPulse } from "lucide-react";

interface PWAInstallPromptProps {
  onShowMessage: (text: string, type: "success" | "error") => void;
}

export default function PWAInstallPrompt({ onShowMessage }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    // 2. Detect iOS environment
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isApple);
      return isApple;
    };

    const standalone = checkStandalone();
    const apple = checkIOS();

    // If already running standalone, no need to do anything
    if (standalone) return;

    // Check if dismissed recently (e.g. within 2 days)
    const lastDismissed = localStorage.getItem("pwa-prompt-dismissed");
    const dismissedTime = lastDismissed ? parseInt(lastDismissed, 10) : 0;
    const now = Date.now();
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    const isRecentlyDismissed = (now - dismissedTime) < twoDaysInMs;

    // 3. Listen to beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default mini-infobar prompt
      e.preventDefault();
      // Save event so it can be triggered later
      setDeferredPrompt(e);
      
      if (!isRecentlyDismissed) {
        // Show our custom installer popup
        setShowPrompt(true);
      }
    };

    // Bind custom install prompt listener
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If it's iOS and not standalone and not recently dismissed, we can show iOS custom prompt
    if (apple && !standalone && !isRecentlyDismissed) {
      // Small delay to make it feel natural
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      onShowMessage("Installation is not supported on this browser or device. Please try a modern browser like Chrome.", "error");
      return;
    }

    // Hide our custom banner
    setShowPrompt(false);

    // Show native installer prompt
    deferredPrompt.prompt();

    // Wait for user choices
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Installation outcome: ${outcome}`);

    if (outcome === "accepted") {
      onShowMessage("Thank you for installing LifelineID! App is now available on your Home Screen.", "success");
    } else {
      // User declined, save dismissal timestamp
      localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
    }

    // Reset prompt state
    setDeferredPrompt(null);
  };

  const handleCancelClick = () => {
    setShowPrompt(false);
    // Persist dismissal so we don't annoy the user immediately
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  // If already installed or shouldn't show, render nothing
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[99] bg-white rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-rose-100/80 animate-slideUp"
      id="pwa-install-overlay"
    >
      <div className="flex gap-4 items-start relative">
        {/* Close Button */}
        <button 
          onClick={handleCancelClick}
          className="absolute right-0 top-0 h-7 w-7 flex items-center justify-center rounded-full bg-slate-50 text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors"
          id="pwa-close-btn"
          title="Dismiss prompt"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand App Icon (SVG representation) */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shrink-0 shadow-md shadow-red-100">
          <HeartPulse className="h-6 w-6 animate-pulse" />
        </div>

        {/* Content Details */}
        <div className="flex-1 text-left pr-8">
          <span className="text-[9px] font-black uppercase text-red-600 tracking-widest block">
            Offline App Ready
          </span>
          <h3 className="text-sm font-black text-gray-900 mt-0.5 leading-tight">
            Install LifelineID App
          </h3>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1">
            Add LifelineID to your home screen for quick, one-tap access to your emergency QR card, even without internet.
          </p>

          {/* iOS-specific guidance */}
          {isIOS ? (
            <div className="mt-3.5 bg-rose-50/50 border border-rose-100/50 rounded-2xl p-3 space-y-2">
              <p className="text-[10px] font-bold text-rose-900 flex items-center gap-1.5 leading-normal">
                <Smartphone className="h-3.5 w-3.5 text-red-500 shrink-0" />
                iOS Safari Installation Guide:
              </p>
              <div className="space-y-1.5 text-[10px] text-gray-600 font-semibold">
                <p className="flex items-center gap-1.5">
                  1. Tap the Share button <ArrowUpFromLine className="h-3.5 w-3.5 text-blue-500 inline shrink-0" /> in the browser bar.
                </p>
                <p className="flex items-center gap-1.5">
                  2. Scroll down and select <PlusSquare className="h-3.5 w-3.5 text-gray-700 inline shrink-0" /> <span className="font-bold text-gray-900">"Add to Home Screen"</span>.
                </p>
              </div>
            </div>
          ) : (
            /* Android / Desktop default actions */
            <div className="mt-4 flex gap-2.5">
              <button
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black py-2.5 px-4 transition-all shadow-md shadow-red-100 active:scale-95"
                id="pwa-install-confirm-btn"
              >
                <Download className="h-3.5 w-3.5" />
                Install Now
              </button>
              <button
                onClick={handleCancelClick}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-700 text-xs font-bold py-2.5 px-4 transition-all border border-gray-150 active:scale-95"
                id="pwa-install-cancel-btn"
              >
                Maybe Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
