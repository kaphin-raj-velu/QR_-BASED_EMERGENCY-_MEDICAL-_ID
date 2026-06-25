import React, { useState } from "react";
import { User, Key, Mail, Heart, Phone, Plus, Trash, Eye, EyeOff, ShieldAlert } from "lucide-react";

interface AuthFormProps {
  onAuthSuccess: (token: string, user: any) => void;
  onShowMessage: (text: string, type: "success" | "error") => void;
}

export default function AuthForm({ onAuthSuccess, onShowMessage }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auth fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState<number>(30);
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; relationship: string; phone: string }>>([
    { name: "", relationship: "", phone: "" },
  ]);

  const handleAddContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: "", relationship: "", phone: "" }]);
  };

  const handleRemoveContact = (index: number) => {
    if (emergencyContacts.length === 1) {
      onShowMessage("At least one emergency contact is highly recommended.", "error");
      return;
    }
    setEmergencyContacts(emergencyContacts.filter((_, idx) => idx !== index));
  };

  const handleContactChange = (index: number, field: "name" | "relationship" | "phone", val: string) => {
    const updated = [...emergencyContacts];
    updated[index][field] = val;
    setEmergencyContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = isLogin
      ? { email, password }
      : {
          name,
          email,
          password,
          age,
          bloodGroup,
          allergies,
          conditions,
          medications,
          emergencyContacts: emergencyContacts.filter((c) => c.name && c.phone),
        };

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onShowMessage(isLogin ? "Sign In Successful" : "Medical Profile Registered Successfully!", "success");
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      onShowMessage(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`w-full ${isLogin ? "max-w-md" : "max-w-3xl"} space-y-8 bento-card p-8 transition-all duration-300`}>
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
            <Heart className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            {isLogin ? "Access your Medical ID" : "Create Emergency ID Profile"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isLogin ? "View, edit, and download your emergency digital medical card" : "Fill out details to generate your unique, lifesaving QR code"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Main Account Details */}
          <div className="space-y-4">
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm transition-all"
                    placeholder="John Doe"
                    id="auth-name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm transition-all"
                  placeholder="name@example.com"
                  id="auth-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Key className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                  id="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

          </div>

          {/* Expanded Registration-Only Medical Form */}
          {!isLogin && (
            <div className="border-t border-rose-100 pt-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" />
                Emergency Medical Card Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-gray-200 py-3 px-3 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm"
                    id="auth-age-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 py-3 px-3 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm"
                    id="auth-blood-input"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Allergies (Severe / Life Threatening)</label>
                  <textarea
                    rows={2}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g., Penicillin, Peanuts, Sulfa drugs, Latex (Leave blank if none)"
                    className="mt-1 block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm"
                    id="auth-allergies-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Medical Conditions (Chronic / Critical)</label>
                  <textarea
                    rows={2}
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="e.g., Type 1 Diabetes, Epilepsy, Hemophilia, Cardiac Arrhythmia"
                    className="mt-1 block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm"
                    id="auth-conditions-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Current Vital Medications</label>
                  <textarea
                    rows={2}
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="e.g., Insulin, Warfarin (blood thinners), EpiPen holder"
                    className="mt-1 block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm"
                    id="auth-medications-input"
                  />
                </div>
              </div>

              {/* Emergency Contacts Block */}
              <div className="border-t border-rose-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-red-600" />
                    Emergency Contacts (Min. 1 Required)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>

                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="w-full md:flex-1">
                      <input
                        type="text"
                        required
                        placeholder="Contact Name"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, "name", e.target.value)}
                        className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-xs focus:border-red-500"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <input
                        type="text"
                        required
                        placeholder="Relationship (e.g. Spouse)"
                        value={contact.relationship}
                        onChange={(e) => handleContactChange(index, "relationship", e.target.value)}
                        className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-xs focus:border-red-500"
                      />
                    </div>
                    <div className="w-full md:flex-1 flex gap-2 items-center">
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                        className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-xs focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(index)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-red-150 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all active:scale-95"
              id="auth-submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign In to LifelineID"
              ) : (
                "Generate Lifesaving QR Medical ID"
              )}
            </button>
          </div>
        </form>

        {/* Toggle Form */}
        <div className="text-center pt-2 border-t border-rose-50/50">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            id="auth-toggle-btn"
          >
            {isLogin ? "Need a medical ID QR? Register here" : "Already have a medical ID? Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}
