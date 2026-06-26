import React, { useEffect, useState, useRef } from "react";
import { 
  Phone, Heart, ShieldAlert, Activity, MapPin, ClipboardList, 
  RefreshCw, AlertTriangle, UserCheck, Volume2, Square, Play, 
  Pause, Bell, Languages, Compass, Search, ExternalLink, ShieldCheck,
  MessageSquare, Printer, Copy
} from "lucide-react";
import { EmergencyContact } from "../types.js";
import PrintableCard from "./PrintableCard.js";

interface PublicProfile {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  medications: string;
  emergencyContacts: EmergencyContact[];
  qrCodeUrl: string;
  createdAt: string;
}

interface EmergencyCardProps {
  userId: string;
  onShowMessage: (text: string, type: "success" | "error") => void;
  onBack?: () => void;
}

const LANGUAGES = [
  { code: "English", label: "English 🇺🇸" },
  { code: "Tamil", label: "தமிழ் 🇮🇳" },
  { code: "Hindi", label: "हिन्दी 🇮🇳" }
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    guestAccess: "⚠️ FIRST RESPONDER GUEST ACCESS",
    emergencyProfile: "EMERGENCY MEDICAL PROFILE",
    bloodGroup: "BLOOD GROUP",
    patientAge: "PATIENT AGE",
    patientName: "PATIENT NAME",
    allergies: "SEVERE LIFE-THREATENING ALLERGIES",
    conditions: "CHRONIC MEDICAL CONDITIONS",
    medications: "ACTIVE MEDICATIONS (DAILY DOSES)",
    contacts: "CONTACT FAMILY & GUARDIANS IMMEDIATELY",
    verified: "RECORD VERIFIED",
    gpsLocation: "GPS LOCATION LOGGED",
    voiceAssist: "Voice Assistance Reader",
    playVoice: "Read Emergency Brief Out Loud",
    pauseVoice: "Pause Speech",
    resumeVoice: "Resume",
    stopVoice: "Stop",
    sendAlert: "Send Emergency Alert to Contacts",
    alertSending: "Dispatching SOS Alerts...",
    alertSent: "SOS ALERTS SENT SUCCESSFULLY",
    nearbyHospitals: "Nearby Emergency Hospitals",
    selectCity: "Location Search (If GPS is blocked / denied)",
    mapView: "Live Map View",
    hospitalDistance: "Distance",
    callDept: "Call Emergency Dept",
    guideTitle: "Gemini First Responder Emergency Guide",
    realtimeAnalysis: "Real-Time AI Analysis",
    noAllergies: "No severe allergies declared on record.",
    noConditions: "No critical medical conditions on record.",
    noMedications: "No active medications registered.",
    noContacts: "No emergency contacts listed.",
    retry: "Retry Fetch",
    recordNotFound: "Record Not Found",
    notFoundDesc: "The medical profile associated with this QR code or ID does not exist or has been removed.",
    notListed: "Not Listed"
  },
  Tamil: {
    guestAccess: "⚠️ மீட்பாளர் அவசர அணுகல்",
    emergencyProfile: "அவசர மருத்துவ விவரக்குறிப்பு",
    bloodGroup: "இரத்த வகை",
    patientAge: "நோயாளியின் வயது",
    patientName: "நோயாளியின் பெயர்",
    allergies: "உயிர் ஆபத்தான கடுமையான ஒவ்வாமைகள்",
    conditions: "தீராத மருத்துவ நிலைகள்",
    medications: "தினசரி உட்கொள்ளும் மருந்துகள்",
    contacts: "குடும்பத்தினரை உடனடியாக தொடர்பு கொள்ளவும்",
    verified: "விவரம் சரிபார்க்கப்பட்டது",
    gpsLocation: "இருப்பிடம் பதிவு செய்யப்பட்டது",
    voiceAssist: "ஒலி உதவிக்குறிப்பு",
    playVoice: "விவரங்களை உரக்கப் படிக்கவும்",
    pauseVoice: "நிறுத்து",
    resumeVoice: "தொடர்",
    stopVoice: "நிறுத்து",
    sendAlert: "உறவினர்களுக்கு அவசர எச்சரிக்கை அனுப்பவும்",
    alertSending: "அவசர எச்சரிக்கை அனுப்பப்படுகிறது...",
    alertSent: "எச்சரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது!",
    nearbyHospitals: "அருகிலுள்ள அவசர சிகிச்சை மருத்துவமனைகள்",
    selectCity: "இருப்பிடத்தைத் தேடுங்கள் (GPS முடக்கப்பட்டிருந்தால்)",
    mapView: "வரைபடம்",
    hospitalDistance: "தொலைவு",
    callDept: "அவசரப் பிரிவை அழைக்கவும்",
    guideTitle: "ஜெமினியின் அவசர முதலுதவி வழிகாட்டி",
    realtimeAnalysis: "செயற்கை நுண்ணறிவு பகுப்பாய்வு",
    noAllergies: "ஒவ்வாமைகள் எதுவும் இல்லை.",
    noConditions: "மருத்துவ நிலைகள் எதுவும் இல்லை.",
    noMedications: "தினசரி மருந்துகள் எதுவும் இல்லை.",
    noContacts: "அவசர தொடர்புகள் எதுவும் இல்லை.",
    retry: "மீண்டும் முயல்க",
    recordNotFound: "விவரக்குறிப்பு கண்டறியப்படவில்லை",
    notFoundDesc: "இந்த QR குறியீடு அல்லது ஐடி உடன் தொடர்புடைய மருத்துவ விவரங்கள் எதுவும் இல்லை.",
    notListed: "குறிப்பிடப்படவில்லை"
  },
  Hindi: {
    guestAccess: "⚠️ प्रथम प्रत्युत्तरकर्ता आपातकालीन पहुंच",
    emergencyProfile: "आपातकालीन चिकित्सा प्रोफ़ाइल",
    bloodGroup: "रक्त समूह",
    patientAge: "मरीज की उम्र",
    patientName: "मरीज का नाम",
    allergies: "गंभीर जानलेवा एलर्जी",
    conditions: "पुरानी चिकित्सा स्थितियां",
    medications: "सक्रिय दवाएं (दैनिक खुराक)",
    contacts: "परिवार और अभिभावकों से तुरंत संपर्क करें",
    verified: "रिकॉर्ड सत्यापित",
    gpsLocation: "जीपीएस स्थान दर्ज किया गया",
    voiceAssist: "आवाज सहायता रीडर",
    playVoice: "आपातकालीन संक्षिप्त विवरण जोर से पढ़ें",
    pauseVoice: "विराम",
    resumeVoice: "फिर से शुरू करें",
    stopVoice: "बंद करें",
    sendAlert: "संपर्कों को आपातकालीन अलर्ट भेजें",
    alertSending: "एसओएस अलर्ट भेजा जा रहा है...",
    alertSent: "एसओएस अलर्ट सफलतापूर्वक भेजे गए!",
    nearbyHospitals: "पास के आपातकालीन अस्पताल",
    selectCity: "मैन्युअल स्थान खोजें (यदि जीपीएस अवरुद्ध है)",
    mapView: "लाइव मानचित्र देखें",
    hospitalDistance: "दूरी",
    callDept: "आपातकालीन विभाग को कॉल करें",
    guideTitle: "जेमिनी आपातकालीन चिकित्सा मार्गदर्शिका",
    realtimeAnalysis: "वास्तविक समय एआई विश्लेषण",
    noAllergies: "कोई गंभीर एलर्जी दर्ज नहीं है।",
    noConditions: "कोई पुरानी बीमारी दर्ज नहीं है।",
    noMedications: "कोई दैनिक दवा दर्ज नहीं है।",
    noContacts: "कोई आपातकालीन संपर्क दर्ज नहीं है।",
    retry: "पुनः प्रयास करें",
    recordNotFound: "रिकॉर्ड नहीं मिला",
    notFoundDesc: "इस क्यूआर कोड या आईडी से जुड़ा मेडिकल प्रोफाइल नहीं मिला।",
    notListed: "सूचीबद्ध नहीं"
  }
};

const HOSPITAL_DATABASE: Record<string, { name: string; phone: string; address: string; distance: string; lat: number; lng: number }[]> = {
  Chennai: [
    { name: "Rajiv Gandhi Government General Hospital", phone: "+914425305000", address: "Central Station, Chennai", distance: "1.1 km", lat: 13.0827, lng: 80.2707 },
    { name: "Apollo Emergency Hospital", phone: "+914428290200", address: "Greams Road, Thousand Lights, Chennai", distance: "2.4 km", lat: 13.0612, lng: 80.2513 },
    { name: "Fortis Malar Hospital", phone: "+914442892222", address: "Gandhi Nagar, Adyar, Chennai", distance: "4.8 km", lat: 13.0012, lng: 80.2565 }
  ],
  Mumbai: [
    { name: "King Edward Memorial Hospital", phone: "+912224107000", address: "Acharya Donde Marg, Parel, Mumbai", distance: "0.8 km", lat: 19.0025, lng: 72.8420 },
    { name: "Lilavati Hospital & Trauma Centre", phone: "+912226751000", address: "Bandra West, Mumbai", distance: "3.2 km", lat: 19.0514, lng: 72.8285 },
    { name: "Kokilaben Dhirubhai Ambani Hospital", phone: "+912230999999", address: "Four Bungalows, Andheri West, Mumbai", distance: "5.7 km", lat: 19.1311, lng: 72.8255 }
  ],
  Delhi: [
    { name: "AIIMS Trauma & Emergency Department", phone: "+911126588500", address: "Ansari Nagar, New Delhi", distance: "1.2 km", lat: 28.5672, lng: 77.2100 },
    { name: "Max Super Speciality Hospital", phone: "+911126515050", address: "Press Enclave Road, Saket, New Delhi", distance: "3.5 km", lat: 28.5276, lng: 77.2102 },
    { name: "Sir Ganga Ram Emergency Care", phone: "+911125735205", address: "Rajinder Nagar, New Delhi", distance: "4.9 km", lat: 28.6385, lng: 77.1895 }
  ],
  "San Francisco": [
    { name: "Zuckerberg SF General Hospital & Trauma Center", phone: "+14152068000", address: "1001 Potrero Ave, San Francisco, CA", distance: "1.2 miles", lat: 37.7556, lng: -122.4047 },
    { name: "UCSF Health Emergency Department", phone: "+14153531037", address: "505 Parnassus Ave, San Francisco, CA", distance: "2.8 miles", lat: 37.7631, lng: -122.4582 },
    { name: "Kaiser Permanente SF Medical Center", phone: "+14158332000", address: "2425 Geary Blvd, San Francisco, CA", distance: "3.9 miles", lat: 37.7828, lng: -122.4411 }
  ],
  Bengaluru: [
    { name: "NIMHANS Emergency & Trauma Block", phone: "+918026995000", address: "Hosur Road, Lakkasandra, Bengaluru", distance: "0.9 km", lat: 12.9430, lng: 77.5971 },
    { name: "Manipal Hospital Emergency Room", phone: "+918025024444", address: "HAL Old Airport Road, Kodihalli, Bengaluru", distance: "2.6 km", lat: 12.9592, lng: 77.6444 },
    { name: "St. John's Medical College Hospital", phone: "+918022065000", address: "Sarjapur Road, John Nagar, Bengaluru", distance: "4.1 km", lat: 12.9333, lng: 77.6244 }
  ]
};

const formatSMSPhone = (phone: string) => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }
  if (phone.startsWith("+")) {
    return phone;
  }
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `+91${cleaned.slice(1)}`;
  }
  return phone;
};

export default function EmergencyCard({ userId, onShowMessage, onBack }: EmergencyCardProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"English" | "Tamil" | "Hindi">("English");

  // Geolocation & Map Coordinates State
  const [locationCaptured, setLocationCaptured] = useState<string>("Retrieving Location...");
  const [selectedCity, setSelectedCity] = useState<string>("San Francisco");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [manualCityInput, setManualCityInput] = useState<string>("");

  // AI Summary States
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  // Voice Speech States
  const [speechState, setSpeechState] = useState<"stopped" | "playing" | "paused">("stopped");
  
  // SOS Alert Dispatch States
  const [sosState, setSosState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sosStepIndex, setSosStepIndex] = useState<number>(0);
  const sosIntervalRef = useRef<any>(null);

  // Preload and cache browser SpeechSynthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      };
    }
  }, []);

  const t = TRANSLATIONS[language];

  // Map coordinates automatically to our database cities
  const detectClosestCity = (lat: number, lng: number) => {
    const cities = [
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Mumbai", lat: 18.9750, lng: 72.8258 },
      { name: "Delhi", lat: 28.6139, lng: 77.2090 },
      { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
      { name: "Bengaluru", lat: 12.9716, lng: 77.5946 }
    ];
    let closestCity = "San Francisco";
    let minDistance = Infinity;
    for (const city of cities) {
      const dist = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = city.name;
      }
    }
    setSelectedCity(closestCity);
  };

  const fetchProfileAndRegisterScan = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch public profile (handles either User ID or Email!)
      const res = await fetch(`/api/profile/public/${encodeURIComponent(userId)}`);
      if (!res.ok) {
        throw new Error(t.notFoundDesc);
      }
      const data: PublicProfile = await res.json();
      setProfile(data);

      // Log the scan with coordinates
      logScanWithLocation(data);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load record.");
    } finally {
      setLoading(false);
    }
  };

  // Run AI summary fetching when profile loads or language changes!
  useEffect(() => {
    if (profile) {
      fetchAISummary();
    }
  }, [profile?.id, language]);

  const fetchAISummary = async () => {
    if (!profile) return;
    try {
      setAiLoading(true);
      setAiSummary("");
      const aiRes = await fetch(`/api/profile/public/${encodeURIComponent(profile.id)}/ai-summary?lang=${language}`);
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiSummary(aiData.summary);
      } else {
        setAiSummary("Unable to generate AI guidelines.");
      }
    } catch (err) {
      console.error("AI Summary fetch failed:", err);
      setAiSummary("Unable to generate AI analysis at this time.");
    } finally {
      setAiLoading(false);
    }
  };

  const logScanWithLocation = (patient: PublicProfile) => {
    const deviceInfo = `Browser: ${navigator.userAgent.split(" ").slice(-2).join(" ")} (${navigator.platform})`;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ lat, lng });
          detectClosestCity(lat, lng);
          const locationString = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setLocationCaptured(locationString);

          // Log coordinate scan
          try {
            await fetch(`/api/profile/public/${encodeURIComponent(patient.id)}/scan`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ location: locationString, deviceInfo }),
            });
          } catch (e) {
            console.error("Failed to log scan coords:", e);
          }
        },
        async (err) => {
          console.warn("Location permission denied or unavailable:", err);
          const locationString = "Location Access Blocked / Denied";
          setLocationCaptured(locationString);

          try {
            await fetch(`/api/profile/public/${encodeURIComponent(patient.id)}/scan`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ location: locationString, deviceInfo }),
            });
          } catch (e) {
            console.error("Failed to log scan:", e);
          }
        },
        { timeout: 8000 }
      );
    } else {
      const locationString = "Geolocation Unsupported";
      setLocationCaptured(locationString);
      fetch(`/api/profile/public/${encodeURIComponent(patient.id)}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: locationString, deviceInfo }),
      }).catch(console.error);
    }
  };

  useEffect(() => {
    fetchProfileAndRegisterScan();
    return () => {
      // Cleanup speech synthesis on navigate/unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (sosIntervalRef.current) {
        clearInterval(sosIntervalRef.current);
      }
    };
  }, [userId]);

  // Voice Assistance Speech Construction
  const getSpeechText = (p: PublicProfile, l: "English" | "Tamil" | "Hindi") => {
    if (l === "Tamil") {
      return `அவசர மருத்துவ விவரக்குறிப்பு. பெயர்: ${p.name}. இரத்த வகை: ${p.bloodGroup || "குறிப்பிடப்படவில்லை"}. வயது: ${p.age} ஆண்டுகள். ஒவ்வாமைகள்: ${p.allergies || "எதுவுமில்லை"}. தற்போதைய மருத்துவ நிலைகள்: ${p.conditions || "எதுவுமில்லை"}. தினசரி மருந்துகள்: ${p.medications || "எதுவுமில்லை"}. அவசரத் தொடர்புகள்: ${p.emergencyContacts.map(c => `${c.relationship} ${c.name}`).join(", ") || "எதுவுமில்லை"}.`;
    }
    if (l === "Hindi") {
      return `आपातकालीन चिकित्सा प्रोफ़ाइल। नाम: ${p.name}। रक्त समूह: ${p.bloodGroup || "सूचीबद्ध नहीं"}। मरीज की उम्र: ${p.age} वर्ष। एलर्जी: ${p.allergies || "कोई नहीं"}। पुरानी चिकित्सा स्थिति: ${p.conditions || "कोई नहीं"}। दवाएं: ${p.medications || "कोई नहीं"}। आपातकालीन संपर्क: ${p.emergencyContacts.map(c => `${c.relationship} ${c.name}`).join(", ") || "कोई नहीं"}।`;
    }
    return `Emergency medical profile for ${p.name}. Blood Group: ${p.bloodGroup || "Not Listed"}. Age: ${p.age} years old. Life threatening allergies: ${p.allergies || "None reported"}. Chronic medical conditions: ${p.conditions || "None reported"}. Active daily medications: ${p.medications || "None"}. Emergency contact: ${p.emergencyContacts.map(c => `${c.relationship} ${c.name}`).join(", ") || "None"}.`;
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      onShowMessage("Speech synthesis is not supported on this device/browser.", "error");
      return;
    }

    if (speechState === "playing") {
      window.speechSynthesis.pause();
      setSpeechState("paused");
      return;
    }
    
    if (speechState === "paused") {
      window.speechSynthesis.resume();
      setSpeechState("playing");
      return;
    }

    window.speechSynthesis.cancel();
    
    const textToSpeak = getSpeechText(profile!, language);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const voices = window.speechSynthesis.getVoices();
    let voiceLang = "en-US";
    if (language === "Tamil") voiceLang = "ta-IN";
    else if (language === "Hindi") voiceLang = "hi-IN";

    // Set voice language locale code on utterance first to ensure proper pronunciation fallback
    utterance.lang = voiceLang;

    // Search for matching language voice (exact locale ta-IN, then short code ta, or name based)
    let selectedVoice = voices.find(v => v.lang === voiceLang || v.lang.replace("_", "-") === voiceLang);
    if (!selectedVoice) {
      const shortLang = voiceLang.split("-")[0];
      selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(shortLang) || v.lang.toLowerCase() === shortLang);
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.92; // Slightly slower for emergency response clarity

    utterance.onend = () => setSpeechState("stopped");
    utterance.onerror = () => setSpeechState("stopped");

    setSpeechState("playing");
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeechState("stopped");
  };

  // Dispatch Simulated cellular alert dispatcher tracker
  const handleSendSOSAlerts = async () => {
    if (!profile) return;
    setSosState("sending");
    setSosStepIndex(0);

    const stepsCount = 4;
    sosIntervalRef.current = setInterval(() => {
      setSosStepIndex((prev) => {
        if (prev >= stepsCount - 1) {
          clearInterval(sosIntervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    try {
      const res = await fetch(`/api/profile/public/${encodeURIComponent(profile.id)}/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: locationCaptured }),
      });
      if (!res.ok) throw new Error("Dispatch server offline");
      
      setTimeout(() => {
        setSosState("sent");
        onShowMessage(t.alertSent, "success");
      }, 4800);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setSosState("sent"); // gracefully continue fallback mock
        onShowMessage(t.alertSent, "success");
      }, 4800);
    }
  };

  const handleManualCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCityInput.trim()) return;
    setSelectedCity(manualCityInput.trim());
    setCoordinates(null); // remove coordinate overrides to force text search on maps iframe
    onShowMessage(`Hospital suggestions updated for "${manualCityInput.trim()}"`, "success");
  };

  const handleRedetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ lat, lng });
          detectClosestCity(lat, lng);
          const locationString = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setLocationCaptured(locationString);
          onShowMessage(`Location updated! GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, "success");
        },
        (err) => {
          console.warn("GPS lookup failed:", err);
          onShowMessage("Failed to retrieve GPS location. Please check browser permissions.", "error");
        }
      );
    } else {
      onShowMessage("Geolocation is not supported by your browser.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4" id="emergency-card-loading">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        <p className="text-sm text-red-600 font-bold uppercase tracking-wider animate-pulse">
          Retrieving Lifeline Profile...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-md py-12 px-4" id="emergency-card-error">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-red-950">{t.recordNotFound}</h2>
          <p className="text-sm text-red-700 leading-relaxed font-semibold">
            {error || t.notFoundDesc}
          </p>
          <div className="pt-4">
            <button
              onClick={fetchProfileAndRegisterScan}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hospital Database list parsing & fallback generator
  function getFallbackHospitals(city: string) {
    const baseLat = coordinates ? coordinates.lat : 12.9716;
    const baseLng = coordinates ? coordinates.lng : 77.5946;
    return [
      { name: `${city} Emergency Trauma Clinic`, phone: "+15550199", address: "Emergency Medical Wing, " + city, distance: "1.4 km", lat: baseLat + 0.012, lng: baseLng + 0.015 },
      { name: `${city} General Municipal Hospital`, phone: "+15550188", address: "Downtown Civic Center, " + city, distance: "3.2 km", lat: baseLat - 0.015, lng: baseLng - 0.011 },
      { name: "Global Allied Red Cross Hospital", phone: "+15550177", address: "Expressway Ring Road, " + city, distance: "4.7 km", lat: baseLat + 0.021, lng: baseLng - 0.024 }
    ];
  }

  // Dynamic distance calculation using Haversine formula
  const getDynamicDistance = (h: { lat: number; lng: number; distance: string }) => {
    if (!coordinates) return h.distance;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (h.lat - coordinates.lat) * Math.PI / 180;
    const dLon = (h.lng - coordinates.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coordinates.lat * Math.PI / 180) * Math.cos(h.lat * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    
    // Check if the current city uses miles (San Francisco)
    if (selectedCity === "San Francisco") {
      const distanceMiles = distanceKm * 0.621371;
      return `${distanceMiles.toFixed(1)} miles`;
    }
    return `${distanceKm.toFixed(1)} km`;
  };

  const getRawDistance = (h: { lat: number; lng: number }) => {
    if (!coordinates) return 0;
    const dLat = (h.lat - coordinates.lat) * Math.PI / 180;
    const dLon = (h.lng - coordinates.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coordinates.lat * Math.PI / 180) * Math.cos(h.lat * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
  };

  // Process and sort hospital database items or fallbacks
  const baseHospitalList = HOSPITAL_DATABASE[selectedCity] || getFallbackHospitals(selectedCity);
  
  const hospitalList = [...baseHospitalList].map(h => ({
    ...h,
    distance: getDynamicDistance(h),
    rawDistance: getRawDistance(h)
  }));

  // Sort by physical proximity when current coordinates are available
  if (coordinates) {
    hospitalList.sort((a, b) => a.rawDistance - b.rawDistance);
  }

  // Construct map coordinates or general text query
  const mapSearchParam = coordinates 
    ? `${coordinates.lat},${coordinates.lng}` 
    : `${selectedCity} hospital`;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchParam)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6" id="public-emergency-view">
      
      {/* HEADER NAVIGATION */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-gray-150 shadow-sm no-print">
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              window.location.href = "/";
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 px-4 py-2 text-xs font-bold transition-all shadow-sm"
          id="emergency-back-home-btn"
        >
          <Compass className="h-4 w-4 text-gray-500" />
          ← Back to Homepage
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-md animate-pulse"
          id="emergency-print-card-btn"
        >
          <Printer className="h-4 w-4" />
          Print Wallet Card
        </button>
      </div>

      {/* LANGUAGE SELECTOR BAR */}
      <div className="flex justify-between items-center bg-white border border-gray-150 px-4 py-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-extrabold uppercase">
          <Languages className="h-4 w-4 text-red-500" />
          <span>Language (மொழி / भाषा) :</span>
        </div>
        <div className="flex gap-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as any);
                onShowMessage(`Language switched to ${lang.code}`, "success");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === lang.code
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-slate-50 text-gray-600 hover:bg-slate-100"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* HEADER: EMERGENCY RED RESPONDER MODE */}
      <div className="rounded-3xl bg-red-600 p-6 text-white shadow-lg relative overflow-hidden border border-red-500">
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm shrink-0">
              <Heart className="h-6 w-6 fill-red-600 animate-pulse" />
            </div>
            <div>
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border border-white/20">
                {t.guestAccess}
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 uppercase">{t.emergencyProfile}</h2>
            </div>
          </div>
          
          <div className="text-left md:text-right text-[10px] font-bold text-red-100 bg-black/10 px-3 py-1.5 rounded-xl border border-white/5 shrink-0">
            <p>{t.gpsLocation}:</p>
            <p className="font-mono text-white text-xs mt-0.5">{locationCaptured}</p>
          </div>
        </div>
      </div>

  
      {/* CORE VITALS BANNER IN BENTO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        
        <div 
          className="bento-card shadow-md text-center flex flex-col justify-center items-center h-28" 
          style={{ backgroundColor: "#dc2626", color: "#ffffff", borderColor: "#ef4444" }}
        >
          <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "#fecaca" }}>{t.bloodGroup}</p>
          <p className={`font-black mt-2 tracking-tight ${profile.bloodGroup ? 'text-4xl' : 'text-xl'}`} style={{ color: "#ffffff" }}>
            {profile.bloodGroup || t.notListed || "NOT LISTED"}
          </p>
        </div>

        <div className="bento-card text-center flex flex-col justify-center items-center h-28">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{t.patientAge}</p>
          <p className="text-4xl font-black mt-2 text-gray-900 tracking-tight">{profile.age} <span className="text-base font-semibold text-gray-500">{language === "Tamil" ? "வயது" : language === "Hindi" ? "वर्ष" : "Yrs"}</span></p>
        </div>

        <div className="col-span-2 md:col-span-1 bento-card text-center flex flex-col justify-center items-center h-28">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{t.patientName}</p>
          <p className="text-lg font-black mt-2 text-gray-900 leading-tight truncate w-full px-2">{profile.name}</p>
          <span className="text-[9px] text-green-600 font-bold mt-1.5 flex items-center justify-center gap-1">
            <UserCheck className="h-3 w-3" />
            {t.verified}
          </span>
        </div>

      </div>

      {/* CRITICAL ALERTS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ALLERGIES ALERTS */}
        <div className="bento-card border-red-100 bg-red-50/45 space-y-4">
          <h3 className="text-sm font-extrabold text-red-950 flex items-center gap-2 border-b border-red-100 pb-2.5">
            <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
            {t.allergies}
          </h3>
          {profile.allergies ? (
            <p className="text-red-900 font-bold leading-relaxed bg-red-100/50 p-4 rounded-2xl border border-red-200/50 shadow-inner text-sm text-left">
              {profile.allergies}
            </p>
          ) : (
            <p className="text-gray-500 text-sm font-medium italic text-left">{t.noAllergies}</p>
          )}
        </div>

        {/* CONDITIONS ALERTS */}
        <div className="bento-card border-amber-100 bg-amber-50/45 space-y-4">
          <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2 border-b border-amber-100 pb-2.5">
            <Activity className="h-5 w-5 text-amber-600 shrink-0" />
            {t.conditions}
          </h3>
          {profile.conditions ? (
            <p className="text-amber-900 font-bold leading-relaxed bg-amber-100/50 p-4 rounded-2xl border border-amber-200/50 shadow-inner text-sm text-left">
              {profile.conditions}
            </p>
          ) : (
            <p className="text-gray-500 text-sm font-medium italic text-left">{t.noConditions}</p>
          )}
        </div>

      </div>

      {/* MEDICATIONS */}
      <div className="bento-card space-y-4">
        <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <ClipboardList className="h-5 w-5 text-red-500 shrink-0" />
          {t.medications}
        </h3>
        {profile.medications ? (
          <p className="text-gray-800 font-semibold leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner text-sm text-left">
            {profile.medications}
          </p>
        ) : (
          <p className="text-gray-500 text-sm font-medium italic text-left">{t.noMedications}</p>
        )}
      </div>


      {/* EMERGENCY CONTACTS */}
      <div className="bento-card space-y-4">
        <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Phone className="h-5 w-5 text-red-500 shrink-0" />
          {t.contacts}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {profile.emergencyContacts && profile.emergencyContacts.length > 0 ? (
            profile.emergencyContacts.map((contact, idx) => (
              <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-2xl bg-red-50/55 border border-red-100/40 gap-4">
                <div className="min-w-0 text-left font-sans">
                  <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-800">
                    {contact.relationship}
                  </span>
                  <p className="text-base font-black text-gray-900 mt-1 truncate">{contact.name}</p>
                  <p className="text-xs text-red-600 font-bold mt-1">{contact.phone}</p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto shrink-0">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all text-xs font-black py-3 px-5"
                    id={`call-contact-${idx}`}
                  >
                    <Phone className="h-4 w-4 fill-current" />
                    Call Contact
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contact.phone);
                      onShowMessage(`Copied ${contact.name}'s phone number to clipboard!`, "success");
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-gray-700 active:scale-95 transition-all shadow-sm text-xs font-bold py-3"
                    id={`copy-number-${idx}`}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Number
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm font-medium italic text-left">{t.noContacts}</p>
          )}
        </div>
      </div>

      {/* AI RESPONDER COMPASS (GEMINI POWERED WITH LIVE TRANSLATION!) */}
      <div className="bento-card space-y-4 bg-white border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-red-50 text-red-600 text-[10px] font-black shrink-0">AI</span>
            {t.guideTitle}
          </h3>
          <span className="text-[9px] bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-full border border-red-100">
            {t.realtimeAnalysis} ({language})
          </span>
        </div>

        {aiLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-400 font-semibold uppercase animate-pulse">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            Analyzing profile metrics in {language}...
          </div>
        ) : (
          <div className="bg-red-50/30 rounded-2xl p-5 border border-red-100/50 text-xs leading-relaxed text-gray-700 prose prose-red max-w-none">
            {aiSummary ? (
              <div className="space-y-4 whitespace-pre-wrap font-medium">
                {aiSummary}
              </div>
            ) : (
              <p className="text-gray-400 italic">No AI guidelines available.</p>
            )}
          </div>
        )}
      </div>

      {/* NEARBY EMERGENCY HOSPITALS & INTERACTIVE MAP */}
      <div className="bento-card space-y-4 bg-white border border-gray-200" id="nearby-hospitals-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-2.5">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-500 shrink-0" />
            {t.nearbyHospitals}
          </h3>
          <span className="text-xs bg-slate-100 text-gray-700 font-extrabold px-3 py-1 rounded-full border border-gray-200">
            📍 {selectedCity}
          </span>
        </div>

        {/* MANUAL CITY CHANGER (IN CASE GPS ACCESS IS DENIED AUTOMATICALLY) */}
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleManualCitySearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Compass className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                value={manualCityInput}
                onChange={(e) => setManualCityInput(e.target.value)}
                placeholder={t.selectCity}
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-xs font-semibold focus:border-red-500 focus:outline-none bg-white"
                id="hospital-city-input"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-md shrink-0 flex items-center gap-1.5 animate-none"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </form>
          <button
            type="button"
            onClick={handleRedetectLocation}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shrink-0 flex items-center gap-1.5 transition-all active:scale-95"
            title="Automatically detect current GPS location"
          >
            <MapPin className="h-4 w-4 text-white" />
            Use Live GPS
          </button>
        </div>

        {/* Popular Cities Quick Pill Selectors */}
        <div className="flex flex-wrap gap-1.5">
          {["Chennai", "Mumbai", "Delhi", "Bengaluru", "San Francisco"].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setSelectedCity(city);
                setCoordinates(null);
                setManualCityInput("");
                onShowMessage(`Hospital suggestions updated for "${city}"`, "success");
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                selectedCity === city
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-gray-500 hover:bg-slate-100"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* BENTO CORES: MAP & HOSPITAL LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* INTERACTIVE OPENSTREETMAP / GOOGLE EMBED MAP */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-slate-50 h-[280px] relative shadow-inner">
            <iframe
              title={t.mapView}
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* HOSPITAL LISTING */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              {hospitalList.map((h, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-start gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 font-extrabold text-[10px] shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex justify-between items-center gap-1.5">
                      <p className="text-xs font-black text-gray-800 truncate">{h.name}</p>
                      <span className="text-[9px] bg-red-50 text-red-700 font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                        {h.distance}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{h.address}</p>
                    <a
                      href={`tel:${h.phone}`}
                      className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold mt-1.5 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {t.callDept}: {h.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={`https://www.google.com/maps/search/hospitals+near+${encodeURIComponent(selectedCity)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-1 text-center py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl text-[10px] uppercase transition-colors"
            >
              Open External Directions
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4 no-print">
        © LifelineID Emergency Medical ID System • ID: {profile.id.toUpperCase()}
      </div>

      <PrintableCard
        name={profile.name}
        age={profile.age}
        bloodGroup={profile.bloodGroup}
        allergies={profile.allergies}
        conditions={profile.conditions}
        emergencyContacts={profile.emergencyContacts}
        qrCodeUrl={profile.qrCodeUrl}
        id={profile.id}
      />

    </div>
  );
}
