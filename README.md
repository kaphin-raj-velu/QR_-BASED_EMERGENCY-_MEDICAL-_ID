# LifelineID QR — Emergency Medical QR Code & Responder Platform

**LifelineID QR** is a full-stack, responsive web application designed to act as a crucial life-saving medical identity platform. It allows users to register, log their medical details, and generate a customized digital emergency card with a unique QR Code. 

First responders can scan this QR code or enter the Patient Medical ID manually to instantly access critical vitals, chronic illnesses, severe allergies, daily medications, emergency contacts, and an AI-generated responder guide.

---

## 🌟 Key Features

### 👤 Patient Profile & QR Generation
- **Primary Information**: Full name, age, profile email, and role.
- **Critical Medical Vitals**: Blood type selection, chronic conditions, life-threatening allergies, and daily medications.
- **Emergency Contacts**: Multiple family or guardian contact details with relationships.
- **Dynamic QR Code Card**: Instantly compiles your medical file, generates a custom QR code card, and allows downloading or copying the image.

### 🔍 Triple-Method QR Medical Card Lookup
- **Live Camera Scanner**: Scans physical medical cards on mobile or desktop via WebRTC.
- **Interactive QR Image Upload**: Drag-and-drop or select a file of the QR card image to read it locally.
- **Manual ID Entry (Fallback)**: Type or paste the Patient Medical ID (`usr_xxxxxxxx`) directly if browser permissions block the camera or when scanning a physical image is not viable.

### 🚨 Emergency Public Responder View
- **High-Visibility Bento Layout**: Clean, high-contrast visual display designed to make critical medical data immediately scannable by paramedics.
- **Direct Family Contact Calling**: Initiates native cellular calling immediately via one-click emergency triggers.
- **AI First Responder Guide (Gemini-Powered)**: Sends the patient's critical vitals to Gemini server-side to generate instant, safe, non-diagnostic immediate first-aid guidance.

### 🛡️ Secure Administrator Dashboard
- **Patient Registries**: Manage all active medical profiles registered in the system.
- **Interactive Analytics**: Data charts mapping blood type distributions across the database (rendered via Recharts).
- **Incident & Scan Logging**: Tracks responder scans with details on location, time, and device analytics.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18 with Vite, styled with Tailwind CSS, using Lucide-React icons and Framer Motion layout transitions.
- **Backend**: Express.js server on Node.js running seamlessly on port `3000`.
- **Primary Database**: **MongoDB (via Mongoose)** for persistent user details and scan event logs.
- **Flexible Offline/Local Fallback**: Features an automated local JSON-file database engine (`local_db.json`) that safely triggers if MongoDB is unreachable, ensuring full operation in sandboxed environments without setup hurdles.
- **AI Orchestration**: Google Gemini API powered by `@google/genai` TypeScript SDK on server-side API routes to secure all backend API keys and avoid browser exposure.

---

## 🚀 Installation & Setup Guide

This guide details how to configure your environment, run your MongoDB database, and start the full-stack Node.js backend.

### 1. Prerequisites
- **Node.js** (v18.x or higher installed)
- **MongoDB Database**: You can use either a **Local database (with Compass)** or a **Cloud-hosted database (MongoDB Atlas)**. Detailed instructions for both are below.

---

### 2. Database Setup: Local vs. Cloud (Atlas)

#### Option A: Local MongoDB (using MongoDB Community Server & MongoDB Compass)
**MongoDB Compass** is a visual tool (GUI) used to query and view your data, while **MongoDB Community Server** is the actual database service running on your machine.

1. **Download and Install**:
   - Download and install **MongoDB Community Server** from the [MongoDB Download Center](https://www.mongodb.com/try/download/community).
   - Download and install **MongoDB Compass** (the GUI client) from the [Compass Download Center](https://www.mongodb.com/try/download/compass).
2. **Start the Database Service**:
   - On **macOS** (via Homebrew):
     ```bash
     brew services start mongodb-community
     ```
   - On **Windows**:
     - The installer configures MongoDB as a Windows Service that starts automatically.
     - Alternatively, open **Services** (services.msc), find `MongoDB Server (MongoDB)`, and click **Start**.
   - On **Linux** (systemd):
     ```bash
     sudo systemctl start mongod
     ```
3. **Get Your Connection String**:
   - Open **MongoDB Compass**.
   - The default local connection URI is prefilled: `mongodb://localhost:27017`
   - Paste this local URI in your `.env` file (detailed in Step 4).

---

#### Option B: Cloud Database (using MongoDB Atlas)
**MongoDB Atlas** is a fully managed cloud database. This is recommended if you want your database to be accessible from any machine or deploy your application online.

1. **Sign Up**: Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a Cluster**: Choose the free **M0 Shared Sandbox** tier.
3. **Database User**: Under **Database Access**, create a user with a secure password (avoid special characters like `@` or `/` in the password, or URL-encode them).
4. **Network Access**: Under **Network Access**, add IP address `0.0.0.0/24` or click **Allow Access from Anywhere** to ensure the database can be connected to from your sandbox environment.
5. **Get Your Connection String**:
   - In your Atlas Console, go to **Database Clusters** and click **Connect**.
   - Select **Connect your application** (Drivers).
   - Copy the provided SRV connection string. It will look like this:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/emergency_qr?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with the credentials you created in Database Access.
   - Paste this Cloud URI in your `.env` file.

---

### 3. Clone the Project & Install Dependencies
Navigate to your project directory and run:
```bash
npm install
```

---

### 4. Environment Variables Configuration
Create a `.env` file in the root directory by copying the `.env.example` file:
```bash
cp .env.example .env
```
Open `.env` and fill out your configuration parameters.

Choose **one** of the two database setups:

```env
# Server Port (Must remain 3000)
PORT=3000

# Server-Side Gemini API Key (Secret for AI paramedic support)
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# OPTION A: If using Local MongoDB Compass Community Server:
MONGODB_URI="mongodb://localhost:27017/emergency_qr"

# OPTION B: If using Cloud MongoDB Atlas:
# MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/emergency_qr?retryWrites=true&w=majority"

# App Deployment Domain URL
APP_URL="http://localhost:3000"
```

---

### 5. Running the Backend & Frontend

With your database started (or using MongoDB Atlas) and your `.env` file configured, boot the application:

#### A. Development Mode (Hot-Reloading concurrent compiler)
To boot the Node backend Express server and the Vite client compiler together:
```bash
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your web browser.
- Any edits made to the frontend React code or server-side API endpoints will instantly update without requiring manual restarts.

#### B. Production Compilation & Launch
To bundle files and run an optimized production build:
```bash
# Compile and package client and server TS files
npm run build

# Start the Node.js production service
npm run start
```

---

## 👥 Seeding / Root Admin Access
For administrative debugging, the application includes a preconfigured root administrator trigger:
- **Email**: `kaphinraj@gmail.com`
- **Role Elevation**: Any account registering with this email address is automatically promoted to the **Root System Administrator**, providing absolute clearance to the administrator analytics page and the global patient registry table.
