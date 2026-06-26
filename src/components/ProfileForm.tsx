import React, { useState } from "react";
import { User, Heart, Phone, Plus, Trash, Save, HelpCircle, Activity, ShieldAlert } from "lucide-react";
import { User as UserType, EmergencyContact } from "../types.js";

interface ProfileFormProps {
  user: Omit<UserType, "password">;
  onUpdateSuccess: (updatedUser: Omit<UserType, "password">) => void;
  onShowMessage: (text: string, type: "success" | "error") => void;
}

export default function ProfileForm({ user, onUpdateSuccess, onShowMessage }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age);
  const [bloodGroup, setBloodGroup] = useState(user.bloodGroup || "O+");
  const [allergies, setAllergies] = useState(user.allergies || "");
  const [conditions, setConditions] = useState(user.conditions || "");
  const [medications, setMedications] = useState(user.medications || "");
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    user.emergencyContacts && user.emergencyContacts.length > 0
      ? user.emergencyContacts
      : [{ name: "", relationship: "", phone: "" }]
  );
  const [loading, setLoading] = useState(false);

  const handleAddContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: "", relationship: "", phone: "" }]);
  };

  const handleRemoveContact = (index: number) => {
    if (emergencyContacts.length === 1) {
      onShowMessage("At least one emergency contact is required to assure responder communication.", "error");
      return;
    }
    setEmergencyContacts(emergencyContacts.filter((_, idx) => idx !== index));
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, val: string) => {
    const updated = [...emergencyContacts];
    updated[index][field] = val;
    setEmergencyContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("lifeline_token");
    const payload = {
      name,
      age: Number(age) || 0,
      bloodGroup,
      allergies,
      conditions,
      medications,
      emergencyContacts: emergencyContacts.filter((c) => c.name && c.phone),
    };

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      onShowMessage("Emergency medical card updated successfully!", "success");
      onUpdateSuccess(data);
    } catch (err: any) {
      onShowMessage(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      
      {/* Introduction Card */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white shadow-xl shadow-rose-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Manage Your Life-Saving Profile</h2>
            <p className="text-red-50/95 max-w-xl text-sm font-medium">
              Keep this information 100% accurate. Paramedics, doctors, and police responders will rely on this exact record when scanning your Lifeline ID QR code in an emergency.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 self-start md:self-auto">
            <Activity className="h-6 w-6 text-red-100 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold tracking-wider text-red-200">System Status</p>
              <p className="text-xs font-semibold text-white">QR Code Active</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Main Info Card */}
          <div className="md:col-span-2 space-y-6 bento-card">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-rose-50 pb-3">
              <User className="h-5 w-5 text-red-500" />
              Primary Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 py-3 px-4 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                  id="profile-name-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1 block w-full rounded-xl border border-gray-200 py-3 px-4 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                  id="profile-age-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 py-3 px-4 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                  id="profile-blood-select"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100/50 sm:mt-5">
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                  Responders look at Blood Group and Age first for emergency transfusions and drug dosage calculations.
                </p>
              </div>
            </div>

            {/* Medical Data Fields */}
            <div className="space-y-4 border-t border-rose-50 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Severe Allergies (Medication, Food, Environmental)
                </label>
                <textarea
                  rows={2}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., Penicillin, Seafood, Peanuts, Latex, Aspirin"
                  className="mt-1 block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                  id="profile-allergies-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Chronic Medical Conditions (Asthma, Heart Disease, Diabetes, Epilepsy, etc.)
                </label>
                <textarea
                  rows={2}
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g., Type 1 Diabetes, Severe Asthma, Epilepsy, Hypertension"
                  className="mt-1 block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                  id="profile-conditions-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Critical Medications Currently Taking
                </label>
                <textarea
                  rows={2}
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g., Insulin twice daily, Albuterol inhaler, Blood thinners, Blood pressure meds"
                  className="mt-1 block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                  id="profile-medications-input"
                />
              </div>
            </div>

          </div>

          {/* Quick Stats Summary Card */}
          <div className="bento-card h-fit space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-rose-50 pb-3">
              <Activity className="h-5 w-5 text-rose-500" />
              ID Preview
            </h3>
            
            <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100/50 space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase">
                <span>Emergency ID Card</span>
                <span className="text-red-600">LIFELINE</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-medium">NAME</p>
                <p className="text-sm font-extrabold text-gray-800">{name || "Not entered"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-medium">BLOOD TYPE</p>
                  <p className="text-sm font-extrabold text-red-600">{bloodGroup}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-medium">AGE</p>
                  <p className="text-sm font-extrabold text-gray-800">{age} yrs</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 leading-relaxed font-medium">
              Your profile is accessible in two ways:
              <ul className="list-disc pl-4 mt-2 space-y-1 text-gray-500 font-normal">
                <li>Scanning your custom medical QR Code.</li>
                <li>Sharing your secure public Lifeline URL.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Contacts Card */}
        <div className="bento-card space-y-4">
          <div className="flex items-center justify-between border-b border-rose-50 pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-500" />
              Emergency Contacts
            </h3>
            <button
              type="button"
              onClick={handleAddContact}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Contact
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-[11px] text-amber-800 font-semibold leading-relaxed">
            💡 <strong>Pro-Tip:</strong> Always include the country code prefix (e.g. <code className="bg-amber-100 px-1 rounded text-amber-900 font-mono">+917448444826</code> for India) so that emergency cellular SMS buttons work instantly on all responder devices.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex gap-3 items-end md:items-center bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Contact Name"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, "name", e.target.value)}
                        className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-xs focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Relationship"
                        value={contact.relationship}
                        onChange={(e) => handleContactChange(index, "relationship", e.target.value)}
                        className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-xs focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number (e.g., +917448444826)"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                      className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-xs focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(index)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
                  title="Remove Contact"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-150 hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all disabled:opacity-50"
            id="profile-save-btn"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Emergency Medical Card
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
