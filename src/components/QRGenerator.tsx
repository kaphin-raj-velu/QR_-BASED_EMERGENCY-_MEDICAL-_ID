import React, { useRef } from "react";
import { Download, QrCode, Heart, Copy, Check, ShieldAlert, Printer } from "lucide-react";
import { User } from "../types.js";
import PrintableCard from "./PrintableCard.js";

interface QRGeneratorProps {
  user: Omit<User, "password">;
  onShowMessage: (text: string, type: "success" | "error") => void;
}

export default function QRGenerator({ user, onShowMessage }: QRGeneratorProps) {
  const [copied, setCopied] = React.useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getPublicProfileUrl = () => {
    return `${window.location.origin}/emergency/${user.id}`;
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getPublicProfileUrl());
    setCopied(true);
    onShowMessage("Public Emergency URL copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQROnly = () => {
    // Generate a downloadable link for the QR image
    const link = document.createElement("a");
    link.href = user.qrCodeUrl;
    link.download = `LifelineID_${user.name.replace(/\s+/g, "_")}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowMessage("QR Code PNG downloaded successfully!", "success");
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl py-4 space-y-8">
      
      {/* Intro Block */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 mb-2">
          <QrCode className="h-6 w-6 animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Your Emergency QR ID Card</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Below is your custom digital medical card. Responders can scan this QR code with any standard smartphone camera to access your vitals instantly. Keep it with you, print it, or save it to your phone lock screen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Physical Card mockup */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Wallet Card Mock-up</h3>
            <span className="text-xs bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-full border border-red-100">
              Wallet Size (85mm x 54mm)
            </span>
          </div>

          {/* Visual wallet card */}
          <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-2 gap-4" id="printable-medical-card">
            
            {/* Front Side */}
            <div className="relative aspect-[1.58/1] w-full rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 p-4 text-white shadow-xl shadow-red-100 flex flex-col justify-between overflow-hidden border border-red-500/20">
              {/* Background Accent */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-red-600 shadow-md">
                    <Heart className="h-4.5 w-4.5 fill-red-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wider leading-none">LIFELINE<span className="text-red-200">ID</span></h4>
                    <p className="text-[7px] font-bold text-red-200 uppercase tracking-widest mt-0.5">Emergency ID</p>
                  </div>
                </div>
                <div className="rounded-md bg-white/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-white/10">
                  Responders Scan QR
                </div>
              </div>

              {/* Patient Core Info */}
              <div className="space-y-1 z-10">
                <p className="text-[7px] font-bold text-red-200 uppercase tracking-widest leading-none">PATIENT NAME</p>
                <h3 className="text-sm font-extrabold tracking-tight leading-none truncate">{user.name}</h3>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div>
                    <p className="text-[6px] text-red-200 font-semibold uppercase leading-none">BLOOD GROUP</p>
                    <p className="text-xs font-black tracking-tight mt-0.5">{user.bloodGroup || "O+"}</p>
                  </div>
                  <div>
                    <p className="text-[6px] text-red-200 font-semibold uppercase leading-none">AGE</p>
                    <p className="text-xs font-black tracking-tight mt-0.5">{user.age} Yrs</p>
                  </div>
                  <div>
                    <p className="text-[6px] text-red-200 font-semibold uppercase leading-none">ALLERGIES</p>
                    <p className="text-[8px] font-bold mt-1 line-clamp-1 truncate">
                      {user.allergies ? "⚠️ YES" : "NONE"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Public Verification Footer */}
              <div className="flex items-center justify-between text-[7px] text-red-100/90 font-bold border-t border-white/10 pt-1.5 z-10">
                <span>Verification No: {user.id.toUpperCase()}</span>
                <span>SECURE ID SYSTEM</span>
              </div>
            </div>

            {/* Back Side - featuring QR and Contacts */}
            <div className="relative aspect-[1.58/1] w-full rounded-2xl bg-white p-4 text-gray-800 shadow-xl shadow-rose-50/50 flex flex-col justify-between overflow-hidden border border-rose-100">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-[8px] font-extrabold text-red-600 uppercase tracking-wider">In Emergency</h4>
                  <p className="text-[7px] text-gray-400 font-bold uppercase">Scan Code or Call Contacts</p>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Heart className="h-3 w-3" />
                </div>
              </div>

              <div className="flex items-center gap-3 py-1.5">
                {/* QR Code thumbnail */}
                <div className="h-16 w-16 bg-gray-50 border border-gray-100 rounded-lg p-1 shrink-0 flex items-center justify-center shadow-inner">
                  <img src={user.qrCodeUrl} alt="Emergency QR Code" className="h-full w-full object-contain" />
                </div>

                {/* Contacts Summary */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[6px] font-extrabold text-gray-400 uppercase tracking-wider leading-none">EMERGENCY CONTACTS</p>
                  {user.emergencyContacts && user.emergencyContacts.length > 0 ? (
                    user.emergencyContacts.slice(0, 2).map((contact, idx) => (
                      <div key={idx} className="text-[8px] font-bold text-gray-700 leading-tight truncate">
                        {contact.name} ({contact.relationship}): <span className="text-red-600">{contact.phone}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[8px] text-gray-400 font-medium italic">No emergency contacts saved.</p>
                  )}
                </div>
              </div>

              {/* Instruction banner */}
              <div className="text-[6px] text-center text-gray-400 font-semibold border-t border-gray-100 pt-1.5">
                Scan QR to view medical history, allergies, medications, and advice.
              </div>
            </div>

          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleDownloadQROnly}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 px-4 text-xs font-extrabold text-white shadow-lg hover:from-red-700 hover:to-rose-700 transition-all active:scale-95"
              id="qr-download-btn"
            >
              <Download className="h-4 w-4" />
              Download High-Res QR (PNG)
            </button>
            <button
              onClick={handlePrintCard}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 px-4 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 shadow-sm animate-pulse"
              id="qr-print-btn"
            >
              <Printer className="h-4 w-4 text-red-500" />
              Print Wallet Card
            </button>
          </div>

        </div>

        {/* Right column: Actions and guides */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bento-card space-y-5">
            <h3 className="text-base font-bold text-gray-900">Digital ID Card Sharing</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Your Public Emergency Profile Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getPublicProfileUrl()}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs font-medium text-gray-500 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                    id="qr-copy-url-btn"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Information Alert */}
              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 flex gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-red-900">
                  <p className="font-bold">Important Privacy Notice</p>
                  <p className="leading-relaxed font-medium">
                    This QR link is <strong>public</strong>. It does not require a login. Responders scanning your physical code will see only critical details (Name, Age, Blood Type, Allergies, Medications, Contacts). It will <strong>never</strong> expose your email, password, or account security credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Practical recommendations */}
            <div className="border-t border-rose-50 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">How to Use Your QR ID:</h4>
              <ul className="text-xs text-gray-500 space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-100 text-red-700 text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>Print this sheet, cut out the card, fold in half, and insert it into your wallet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-100 text-red-700 text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>Save the QR code PNG image and set it as your smartphone's Lock Screen background.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-100 text-red-700 text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span>Sticker prints can be placed on motorcycle helmets, cycling jackets, or cars for immediate roadside rescue.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* Hidden printable card component that only displays on printing */}
      <PrintableCard
        name={user.name}
        age={user.age}
        bloodGroup={user.bloodGroup}
        allergies={user.allergies}
        conditions={user.conditions}
        emergencyContacts={user.emergencyContacts}
        qrCodeUrl={user.qrCodeUrl}
        id={user.id}
      />

    </div>
  );
}
