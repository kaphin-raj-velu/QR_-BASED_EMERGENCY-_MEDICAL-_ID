import React from "react";
import { createPortal } from "react-dom";
import { Heart, ShieldCheck } from "lucide-react";
import { EmergencyContact } from "../types.js";

interface PrintableCardProps {
  name: string;
  age: number;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  emergencyContacts: EmergencyContact[];
  qrCodeUrl: string;
  id: string;
}

export default function PrintableCard({
  name,
  age,
  bloodGroup,
  allergies,
  conditions,
  emergencyContacts,
  qrCodeUrl,
  id,
}: PrintableCardProps) {
  const qrSrc = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + "/emergency/" + id)}`;

  return createPortal(
    <div className="hidden print:block print:p-8 print:bg-white print:text-black min-h-screen animate-none" id="print-card-layout">
      {/* Print Instructions Header */}
      <div className="text-center mb-8 border-b border-dashed border-gray-300 pb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Heart className="h-5 w-5 text-red-600 fill-red-600" />
          LifelineID Emergency Medical Card Sheet
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Standard Wallet Size Card. Cut along the outer solid borders, fold along the center dashed line, and laminate.
        </p>
      </div>

      <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
        {/* FRONT SIDE (Visual Card Mockup for Print) */}
        <div className="w-[85.6mm] h-[53.98mm] border-2 border-black rounded-xl p-3 bg-white text-black flex flex-col justify-between select-none relative box-border shadow-sm">
          {/* Top Logo and Title */}
          <div className="flex items-start justify-between border-b border-gray-300 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-red-600 fill-red-600 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] font-black tracking-wider block leading-none">LIFELINE ID</span>
                <span className="text-[6px] text-gray-500 font-extrabold uppercase tracking-widest mt-0.5 block">Emergency Medical ID</span>
              </div>
            </div>
            <div className="border border-black px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-wider text-center">
              FIRST RESPONDER ACCESS
            </div>
          </div>

          {/* Patient Details */}
          <div className="my-1 text-left space-y-1 flex-1">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-[5px] text-gray-400 font-black uppercase block">PATIENT NAME</span>
                <span className="text-xs font-black leading-tight text-gray-900 block truncate max-w-[180px]">{name}</span>
              </div>
              <div className="text-right">
                <span className="text-[5px] text-gray-400 font-black uppercase block">BLOOD GROUP</span>
                <span className="text-xs font-black text-red-600 leading-tight block uppercase">{bloodGroup || "NOT LISTED"}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1.5">
              <div>
                <span className="text-[5px] text-gray-400 font-black uppercase block">AGE</span>
                <span className="text-[9px] font-black text-gray-900 block">{age} Yrs</span>
              </div>
              <div className="col-span-2">
                <span className="text-[5px] text-gray-400 font-black uppercase block">SEVERE ALLERGIES</span>
                <span className="text-[8px] font-black text-red-600 block truncate">{allergies || "NONE REPORTED"}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[5px] text-gray-400 font-black uppercase block font-sans">CHRONIC CONDITIONS</span>
              <span className="text-[8px] font-bold text-gray-700 block truncate">{conditions || "NONE REPORTED"}</span>
            </div>
          </div>

          {/* Card footer */}
          <div className="flex items-center justify-between text-[6px] text-gray-500 font-bold border-t border-gray-200 pt-1.5">
            <span>ID: {id.toUpperCase()}</span>
            <span className="flex items-center gap-0.5 text-green-600">
              <ShieldCheck className="h-2 w-2 animate-pulse" />
              VERIFIED LIFELINE PROFILE
            </span>
          </div>
        </div>

        {/* BACK SIDE (with QR code) */}
        <div className="w-[85.6mm] h-[53.98mm] border-2 border-black rounded-xl p-3 bg-white text-black flex flex-col justify-between select-none relative box-border shadow-sm">
          <div className="flex justify-between items-start border-b border-gray-200 pb-1.5">
            <div className="text-left">
              <h4 className="text-[8px] font-extrabold text-red-600 uppercase tracking-wider">In Emergency</h4>
              <p className="text-[6px] text-gray-400 font-bold uppercase">Scan QR Code below for details</p>
            </div>
            <span className="text-[5px] text-gray-400 font-black uppercase text-right">BACK SIDE</span>
          </div>

          <div className="flex items-center gap-3 py-1 flex-1">
            {/* QR Code */}
            <div className="h-16 w-16 bg-white border border-gray-300 rounded p-0.5 shrink-0 flex items-center justify-center">
              <img src={qrSrc} alt="Emergency QR Code" className="h-full w-full object-contain" />
            </div>

            {/* Contacts list */}
            <div className="flex-1 min-w-0 text-left space-y-1">
              <span className="text-[5px] font-extrabold text-gray-400 uppercase tracking-wider block">EMERGENCY CONTACTS</span>
              {emergencyContacts && emergencyContacts.length > 0 ? (
                emergencyContacts.slice(0, 2).map((contact, idx) => (
                  <div key={idx} className="text-[8px] font-bold text-gray-800 leading-tight truncate">
                    • {contact.name} ({contact.relationship}): <span className="font-extrabold text-black">{contact.phone}</span>
                  </div>
                ))
              ) : (
                <p className="text-[7px] text-gray-400 font-medium italic">No emergency contacts listed.</p>
              )}
            </div>
          </div>

          {/* Instruction */}
          <div className="text-[5px] text-center text-gray-500 font-semibold border-t border-gray-200 pt-1.5 leading-tight">
            SCAN QR FOR CRITICAL VITALS, ACTIVE MEDICATIONS, AND CLINICAL DECISION SUPPORT.
          </div>
        </div>
      </div>

      {/* Printing Cut Lines Helper */}
      <div className="mt-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider max-w-md mx-auto border border-dashed border-gray-300 p-3 rounded-xl">
        ✂️ CUTTING & FOLDING GUIDE <br />
        <span className="text-[9px] font-medium text-gray-500 normal-case mt-1 block leading-relaxed">
          Use heavy cardstock paper if possible. Cut carefully around both card frames, apply adhesive to their back sides, fold them together to form a premium double-sided wallet card, and laminate.
        </span>
      </div>
    </div>,
    document.body
  );
}
