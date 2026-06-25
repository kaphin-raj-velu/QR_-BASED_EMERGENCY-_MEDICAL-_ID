import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { GoogleGenAI } from "@google/genai";
import {
  getUserByEmail,
  createUser,
  getUserById,
  updateUser,
  getScanLogs,
  createScanLog,
  getAdminStats,
  getUsers,
  deleteUser,
} from "./src/server/db.js";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "emergency-qr-medical-id-secret-key";

// Initialize Gemini API client safely (lazy-loaded when needed)
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI summaries will fall back to local rule-based analysis.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY", // fallback to prevent SDK crash
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware: Authenticate JWT
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "user" | "admin" | "responder";
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
}

// Middleware: Admin Only
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  next();
}

// -----------------------------------------------------------------------------
// REST API ENDPOINTS
// -----------------------------------------------------------------------------

// Auth: Register
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, age, bloodGroup, allergies, conditions, medications, emergencyContacts, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Math.random().toString(36).substr(2, 9)}`;

    // Generate QR code pointing to public emergency profile
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const publicUrl = `${appUrl}/emergency/${userId}`;
    const qrCodeUrl = await QRCode.toDataURL(publicUrl, {
      color: {
        dark: "#b91c1c", // Beautiful dark red for medical branding
        light: "#ffffff",
      },
      width: 400,
      margin: 1,
    });

    const newUser = await createUser({
      id: userId,
      email,
      password: hashedPassword,
      name,
      age: Number(age) || 0,
      bloodGroup: bloodGroup || "",
      allergies: allergies || "",
      conditions: conditions || "",
      medications: medications || "",
      emergencyContacts: emergencyContacts || [],
      qrCodeUrl,
      role: role || "user",
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "30d" });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Auth: Get Current User (Me)
app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Profile: Update
app.post("/api/profile/update", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    const updates = req.body;
    // Do not allow updating password or email directly through this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.id;
    delete updates.createdAt;

    const updatedUser = await updateUser(req.user.id, updates);
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});

// Public Profile: Fetch critical emergency info (no login required)
app.get("/api/profile/public/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let user = await getUserById(userId);

    // Support looking up by email as well if user enters email manually
    if (!user && userId && userId.includes("@")) {
      user = await getUserByEmail(userId);
    }

    if (!user) {
      return res.status(404).json({ error: "Medical profile not found" });
    }

    // Return strictly necessary emergency details
    res.json({
      id: user.id,
      name: user.name,
      age: user.age,
      bloodGroup: user.bloodGroup,
      allergies: user.allergies,
      conditions: user.conditions,
      medications: user.medications,
      emergencyContacts: user.emergencyContacts,
      qrCodeUrl: user.qrCodeUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch public emergency profile" });
  }
});

// Public Profile: Log a scan event (no login required)
app.post("/api/profile/public/:userId/scan", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { location, deviceInfo } = req.body;

    let user = await getUserById(userId);
    if (!user && userId && userId.includes("@")) {
      user = await getUserByEmail(userId);
    }

    if (!user) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const log = await createScanLog({
      userId: user.id,
      location: location || "Unknown Location (Responded)",
      deviceInfo: deviceInfo || req.headers["user-agent"] || "Generic Device",
    });

    res.status(201).json(log);
  } catch (error) {
    console.error("Scan logging error:", error);
    res.status(500).json({ error: "Failed to log scan" });
  }
});

// Public Profile: Trigger emergency SOS alert dispatch (simulate SMS/Email and log scan alert)
app.post("/api/profile/public/:userId/alert", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { location } = req.body;

    let user = await getUserById(userId);
    if (!user && userId && userId.includes("@")) {
      user = await getUserByEmail(userId);
    }

    if (!user) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    // Log the SOS Alert Event in database
    const log = await createScanLog({
      userId: user.id,
      location: location || "Unknown Location (SOS Alert Triggered)",
      deviceInfo: "🚨 SOS EMERGENCY ALERT SENT TO CONTACTS",
    });

    // Return notified contacts
    res.status(200).json({
      success: true,
      notifiedContacts: user.emergencyContacts,
      log,
    });
  } catch (error: any) {
    console.error("Emergency Alert logging error:", error);
    res.status(500).json({ error: "Failed to log and dispatch emergency alert" });
  }
});

// AI Medical Emergency Summary & Responder Guide (using server-side Gemini)
app.get("/api/profile/public/:userId/ai-summary", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const lang = (req.query.lang as string) || "English";

    let user = await getUserById(userId);
    if (!user && userId && userId.includes("@")) {
      user = await getUserByEmail(userId);
    }

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Extract crucial medical parameters
    const { bloodGroup, allergies, conditions, medications, name, age } = user;

    // Standard fallbacks in case Gemini API Key is missing or fails
    const fallbackSummaries: Record<string, string> = {
      English: `
### 🚨 Emergency Overview for ${name} (${age} yrs)
- **Blood Type:** ${bloodGroup || "Unknown"}
- **Active Conditions:** ${conditions || "None reported"}
- **Allergies:** ${allergies || "None reported"}
- **Current Medications:** ${medications || "None reported"}

### 🩺 Recommended First Responder Protocols
1. **Airway & Breathing:** Ensure clear airways, especially if allergies are present.
2. **IV/Transfusion:** Cross-match blood type or prepare O-negative if blood group is not confirmed.
3. **Medication Administration:** Check current medications to avoid potential fatal drug interactions.
4. **Allergy Alert:** Refrain from administering generic drugs that conflict with the listed allergies.
      `.trim(),
      Tamil: `
### 🚨 ${name} (${age} வயது) க்கான அவசர மேலோட்டம்
- **இரத்த வகை:** ${bloodGroup || "தெரியவில்லை"}
- **தற்போதைய மருத்துவ நிலைகள்:** ${conditions || "எதுவுமில்லை"}
- **ஒவ்வாமைகள்:** ${allergies || "எதுவுமில்லை"}
- **தினசரி மருந்துகள்:** ${medications || "எதுவுமில்லை"}

### 🩺 பரிந்துரைக்கப்படும் முதலுதவி நெறிமுறைகள்
1. **சுவாசம்:** ஒவ்வாமை இருந்தால் சுவாசப் பாதை தடையின்றி இருப்பதை உறுதி செய்யவும்.
2. **இரத்த உட்செலுத்துதல்:** இரத்த வகை தெரியவில்லை என்றால் O-நெகட்டிவ் தயார் செய்யவும்.
3. **மருந்து எச்சரிக்கை:** ஆபத்தான மருந்து விளைவுகளைத் தவிர்க்க தற்போதைய மருந்துகளைச் சரிபார்க்கவும்.
      `.trim(),
      Hindi: `
### 🚨 ${name} (${age} वर्ष) के लिए आपातकालीन अवलोकन
- **रक्त समूह:** ${bloodGroup || "अज्‍ज्ञात"}
- **सक्रिय बीमारियां:** ${conditions || "कोई रिपोर्ट नहीं"}
- **एलर्जी:** ${allergies || "कोई रिपोर्ट नहीं"}
- **दवाएं:** ${medications || "कोई रिपोर्ट नहीं"}

### 🩺 अनुशंसित प्राथमिक चिकित्सा प्रोटोकॉल
1. **श्वसन क्रिया:** यदि एलर्जी है, तो श्वसन मार्ग को साफ रखें।
2. **रक्त आधान:** यदि रक्त समूह अज्ञात है, तो ओ-नेगेटिव रक्त तैयार रखें।
3. **दवा चेतावनी:** संभावित घातक प्रतिक्रियाओं से बचने के लिए सक्रिय दवाओं की जांच करें।
      `.trim(),
    };

    const fallbackSummary = fallbackSummaries[lang] || fallbackSummaries["English"];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ summary: fallbackSummary, isAiGenerated: false });
    }

    const client = getAiClient();
    const prompt = `
You are an expert emergency medical AI. Analyze the following critical medical profile of a patient and generate a brief, highly action-oriented, professional "First Responder Emergency Brief" to assist paramedics, doctors, or bystanders in saving this patient's life.

**CRITICAL REQUIREMENT**: You MUST generate the entire analysis in the "${lang}" language. Use professional terms appropriate for "${lang}" speakers.

Patient Information:
- Name: ${name}
- Age: ${age}
- Blood Group: ${bloodGroup || "Not Specified"}
- Allergies: ${allergies || "None reported"}
- Medical Conditions: ${conditions || "None reported"}
- Medications: ${medications || "None reported"}

Provide your analysis in clean Markdown format in "${lang}" language with the following exact sections:
1. "🚨 PRIORITY RISK RATING" (Determine if Low, Moderate, High, or Critical, and why in 1 sentence in ${lang})
2. "⚠️ SEVERE HAZARDS & INTERACTIONS" (Highlight potential drug interactions or severe allergic reactions in ${lang})
3. "⚡ IMMEDIATE FIRST-AID STEPS" (Give 3 concrete bullet points for responders in ${lang})
4. "🩺 CLINICAL RECOMMENDATION" (1 professional advice sentence for medical teams in ${lang})

Keep it very concise, clear, and readable on a small mobile screen. Do not include verbose introductory text.
`.trim();

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || fallbackSummary;
    res.json({ summary: text, isAiGenerated: true });
  } catch (error: any) {
    console.error("Gemini AI generation error:", error);
    res.status(500).json({ error: "Failed to generate AI summary" });
  }
});

// Logs: Fetch scan logs for a user
app.get("/api/logs/:userId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    // Check permissions: users can only view their own logs unless they are an admin
    if (req.user?.id !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to access these scan logs" });
    }

    const logs = await getScanLogs(userId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scan logs" });
  }
});

// Admin: Get statistics
app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await getAdminStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to compile admin stats" });
  }
});

// Admin: List all users
app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await getUsers();
    const sanitizedUsers = users.map(({ password, ...u }) => u);
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to list users" });
  }
});

// Admin: Delete a user
app.delete("/api/admin/users/:userId", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const targetUser = await getUserById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (targetUser.email.toLowerCase().trim() === "kaphinraj@gmail.com") {
      return res.status(403).json({ error: "Cannot delete the bootstrapped root administrator" });
    }

    await deleteUser(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// -----------------------------------------------------------------------------
// VITE OR STATIC FILES SERVING MIDDLEWARE
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
