export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  age: number;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  medications: string;
  emergencyContacts: EmergencyContact[];
  qrCodeUrl: string;
  role: "user" | "admin" | "responder";
  createdAt: string;
}

export interface ScanLog {
  id: string;
  userId: string;
  userName?: string; // resolved for convenience in admin dashboard
  scannedAt: string;
  location: string;
  deviceInfo: string;
}

export interface AuthState {
  token: string | null;
  user: Omit<User, "password"> | null;
}

export interface AdminStats {
  totalUsers: number;
  totalScans: number;
  recentScans: ScanLog[];
  bloodGroupCounts: { [bloodGroup: string]: number };
  roleCounts: { [role: string]: number };
}
