import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { User as UserType, ScanLog as ScanLogType, AdminStats } from "../types.js";
import { normalizeSearchId } from "../utils/normalize.js";

// MongoDB URI connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/emergency_qr";

// Establish MongoDB connection (non-blocking)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
    console.warn("MongoDB is not running locally. The server is seamlessly falling back to a persistent JSON-file database.");
  });

// Schema definition for Emergency Contact
const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: false });

// Schema definition for User / Patient Profile
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  age: { type: Number, default: 0 },
  bloodGroup: { type: String, default: "" },
  allergies: { type: String, default: "" },
  conditions: { type: String, default: "" },
  medications: { type: String, default: "" },
  emergencyContacts: { type: [EmergencyContactSchema], default: [] },
  qrCodeUrl: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin", "responder"], default: "user" },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

// Schema definition for Scan Log events
const ScanLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  location: { type: String, default: "Unknown Location" },
  deviceInfo: { type: String, default: "Unknown Device" },
  scannedAt: { type: String, default: () => new Date().toISOString() }
});

// Create mongoose models with explicit Model typings to satisfy the TypeScript compiler
const UserModel: mongoose.Model<any> = (mongoose.models.User as any) || mongoose.model("User", UserSchema);
const ScanLogModel: mongoose.Model<any> = (mongoose.models.ScanLog as any) || mongoose.model("ScanLog", ScanLogSchema);

// -----------------------------------------------------------------------------
// LOCAL FILE DATABASE SYSTEM (FALLBACK WHEN MONGO IS UNREACHABLE)
// -----------------------------------------------------------------------------
const LOCAL_DB_PATH = path.join(process.cwd(), "src/server/local_db.json");

interface LocalDBData {
  users: UserType[];
  scanLogs: ScanLogType[];
}

export function readLocalDB(): LocalDBData {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, "utf8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to read local JSON DB file, using default structure:", err);
  }
  return { users: [], scanLogs: [] };
}

export function writeLocalDB(data: LocalDBData) {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to local JSON DB file:", err);
  }
}

// Check if we should use the MongoDB database or the local JSON file database
function isMongoActive(): boolean {
  return mongoose.connection.readyState === 1;
}

// -----------------------------------------------------------------------------
// DATABASE UTILITY & QUERY METHODS
// -----------------------------------------------------------------------------

/**
 * Get all users registered in the system.
 */
export async function getUsers(): Promise<UserType[]> {
  if (isMongoActive()) {
    try {
      const users = await UserModel.find({}).lean();
      return users.map((u: any) => ({
        ...u,
        _id: undefined,
        __v: undefined
      })) as UserType[];
    } catch (err) {
      console.error("MongoDB getUsers query failed, falling back to local file:", err);
    }
  }

  const db = readLocalDB();
  return db.users;
}

/**
 * Fetch a single user profile by their unique ID string (case-insensitive, space-tolerant).
 */
export async function getUserById(id: string): Promise<UserType | undefined> {
  const normalizedSearch = normalizeSearchId(id);
  if (!normalizedSearch) return undefined;

  if (isMongoActive()) {
    try {
      // Fetch all users to do a robust normalized in-memory comparison
      const users = await UserModel.find({}).lean();
      
      // 1. Try finding by unique ID (exact match normalized)
      let found = users.find((u: any) => normalizeSearchId(u.id) === normalizedSearch);
      
      // 2. Try finding by Name (substring match normalized)
      if (!found) {
        found = users.find((u: any) => normalizeSearchId(u.name).includes(normalizedSearch));
      }
      
      // 3. Try finding by Email (substring match normalized)
      if (!found) {
        found = users.find((u: any) => normalizeSearchId(u.email).includes(normalizedSearch));
      }

      if (!found) return undefined;
      return {
        ...found,
        _id: undefined,
        __v: undefined
      } as UserType;
    } catch (err) {
      console.error(`MongoDB getUserById query failed for ${id}, falling back to local file:`, err);
    }
  }

  const db = readLocalDB();
  
  // 1. Exact ID match normalized
  let found = db.users.find((u) => normalizeSearchId(u.id) === normalizedSearch);
  
  // 2. Partial Name match normalized next
  if (!found) {
    found = db.users.find((u) => normalizeSearchId(u.name).includes(normalizedSearch));
  }
  
  // 3. Partial Email match normalized next
  if (!found) {
    found = db.users.find((u) => normalizeSearchId(u.email).includes(normalizedSearch));
  }
  
  return found;
}

/**
 * Fetch a single user profile by email address (case-insensitive).
 */
export async function getUserByEmail(email: string): Promise<UserType | undefined> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isMongoActive()) {
    try {
      const user = await UserModel.findOne({ email: { $regex: new RegExp("^" + normalizedEmail + "$", "i") } }).lean();
      if (!user) return undefined;
      return {
        ...user,
        _id: undefined,
        __v: undefined
      } as UserType;
    } catch (err) {
      console.error(`MongoDB getUserByEmail query failed for ${email}, falling back to local file:`, err);
    }
  }

  const db = readLocalDB();
  return db.users.find((u) => u.email.toLowerCase().trim() === normalizedEmail);
}

/**
 * Create a new user profile.
 */
export async function createUser(user: Omit<UserType, "id" | "createdAt" | "role"> & { id?: string; role?: string }): Promise<UserType> {
  const newId = user.id || `usr_${Math.random().toString(36).substr(2, 9)}`;
  const isBootstrappedAdmin = user.email.toLowerCase().trim() === "kaphinraj@gmail.com";
  const finalRole = isBootstrappedAdmin ? "admin" : (user.role || "user") as "user" | "admin" | "responder";

  const userData: UserType = {
    ...user,
    id: newId,
    role: finalRole,
    createdAt: new Date().toISOString(),
    age: user.age || 0,
    bloodGroup: user.bloodGroup || "",
    allergies: user.allergies || "",
    conditions: user.conditions || "",
    medications: user.medications || "",
    emergencyContacts: user.emergencyContacts || [],
    qrCodeUrl: user.qrCodeUrl || ""
  };

  if (isMongoActive()) {
    try {
      const newUser = new UserModel(userData);
      await newUser.save();
      const object = newUser.toObject();
      return {
        ...object,
        _id: undefined,
        __v: undefined
      } as UserType;
    } catch (err) {
      console.error("MongoDB createUser failed, falling back to local file:", err);
    }
  }

  const db = readLocalDB();
  db.users.push(userData);
  writeLocalDB(db);
  return userData;
}

/**
 * Update properties of an existing user profile.
 */
export async function updateUser(id: string, updates: Partial<Omit<UserType, "id" | "email" | "createdAt">>): Promise<UserType> {
  if (isMongoActive()) {
    try {
      const existingUser = await UserModel.findOne({ id });
      if (existingUser) {
        const isBootstrappedAdmin = existingUser.email.toLowerCase().trim() === "kaphinraj@gmail.com";
        const finalRole = isBootstrappedAdmin ? "admin" : (updates.role || existingUser.role);

        const updated = await UserModel.findOneAndUpdate(
          { id },
          {
            $set: {
              ...updates,
              role: finalRole,
            }
          },
          { new: true }
        ).lean();

        if (updated) {
          return {
            ...updated,
            _id: undefined,
            __v: undefined
          } as UserType;
        }
      }
    } catch (err) {
      console.error(`MongoDB updateUser failed for ${id}, falling back to local file:`, err);
    }
  }

  const db = readLocalDB();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error(`User with ID ${id} not found`);
  }

  const existing = db.users[index];
  const isBootstrappedAdmin = existing.email.toLowerCase().trim() === "kaphinraj@gmail.com";
  const finalRole = isBootstrappedAdmin ? "admin" : (updates.role || existing.role);

  const updated: UserType = {
    ...existing,
    ...updates,
    role: finalRole as "user" | "admin" | "responder"
  };

  db.users[index] = updated;
  writeLocalDB(db);
  return updated;
}

/**
 * Permanently delete a user and associated scan logs.
 */
export async function deleteUser(id: string): Promise<void> {
  if (isMongoActive()) {
    try {
      await UserModel.deleteOne({ id });
      await ScanLogModel.deleteMany({ userId: id });
      return;
    } catch (err) {
      console.error(`MongoDB deleteUser failed for ${id}, falling back to local file:`, err);
    }
  }

  const db = readLocalDB();
  db.users = db.users.filter((u) => u.id !== id);
  db.scanLogs = db.scanLogs.filter((l) => l.userId !== id);
  writeLocalDB(db);
}

/**
 * Retrieve scan logs, optionally filtered by a specific patient's userID.
 */
export async function getScanLogs(userId?: string): Promise<ScanLogType[]> {
  if (isMongoActive()) {
    try {
      const query = userId ? { userId } : {};
      const logs = await ScanLogModel.find(query).lean();
      const users = await UserModel.find({}).lean();

      return logs.map((log: any) => {
        const user = users.find((u: any) => u.id === log.userId);
        return {
          id: log.id,
          userId: log.userId,
          location: log.location,
          deviceInfo: log.deviceInfo,
          scannedAt: log.scannedAt,
          userName: user ? user.name : "Unknown Patient",
        };
      }) as ScanLogType[];
    } catch (err) {
      console.error("MongoDB getScanLogs failed, falling back to local file:", err);
    }
  }

  const db = readLocalDB();
  let logs = db.scanLogs;
  if (userId) {
    logs = logs.filter((l) => l.userId === userId);
  }

  return logs.map((log) => {
    const user = db.users.find((u) => u.id === log.userId);
    return {
      ...log,
      userName: user ? user.name : "Unknown Patient"
    };
  });
}

/**
 * Insert a new scan log event.
 */
export async function createScanLog(log: Omit<ScanLogType, "id" | "scannedAt">): Promise<ScanLogType> {
  const logId = `log_${Math.random().toString(36).substr(2, 9)}`;
  const scannedAt = new Date().toISOString();

  const logData: ScanLogType = {
    ...log,
    id: logId,
    scannedAt
  };

  if (isMongoActive()) {
    try {
      const newLog = new ScanLogModel(logData);
      await newLog.save();
      const object = newLog.toObject();
      return {
        id: object.id,
        userId: object.userId,
        location: object.location,
        deviceInfo: object.deviceInfo,
        scannedAt: object.scannedAt
      } as ScanLogType;
    } catch (err) {
      console.error("MongoDB createScanLog failed, falling back to local file:", err);
    }
  }

  const db = readLocalDB();
  db.scanLogs.push(logData);
  writeLocalDB(db);
  return logData;
}

/**
 * Compile system aggregated statistics for the administrator dashboard.
 */
export async function getAdminStats(): Promise<AdminStats> {
  let users: UserType[] = [];
  let logs: ScanLogType[] = [];

  if (isMongoActive()) {
    try {
      users = await UserModel.find({}).lean() as any;
      logs = await ScanLogModel.find({}).lean() as any;
    } catch (err) {
      console.error("MongoDB getAdminStats failed, falling back to local file:", err);
      const db = readLocalDB();
      users = db.users;
      logs = db.scanLogs;
    }
  } else {
    const db = readLocalDB();
    users = db.users;
    logs = db.scanLogs;
  }

  const bloodGroupCounts: { [bg: string]: number } = {};
  const roleCounts: { [role: string]: number } = {};

  users.forEach((u: any) => {
    const bg = u.bloodGroup || "Not Specified";
    bloodGroupCounts[bg] = (bloodGroupCounts[bg] || 0) + 1;

    const r = u.role || "user";
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  });

  const recentLogs = await getScanLogs();
  const sortedRecentLogs = recentLogs
    .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
    .slice(0, 10);

  return {
    totalUsers: users.length,
    totalScans: logs.length,
    recentScans: sortedRecentLogs,
    bloodGroupCounts,
    roleCounts,
  };
}
