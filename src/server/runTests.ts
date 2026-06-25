import { getUserById, readLocalDB, writeLocalDB } from "./db.js";
import { normalizeSearchId } from "../utils/normalize.js";

// Helper to assert conditions and print formatted results
let failed = false;
function assert(testName: string, condition: boolean, message: string = "") {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName} - ${message}`);
    failed = true;
  }
}

async function runAllTests() {
  console.log("==================================================");
  console.log("       RUNNING LIFELINEID AUTOMATED TESTS         ");
  console.log("==================================================");

  // Setup mock user for testing
  const testUserId = "MED-2026-0001";
  const mockUser = {
    id: testUserId,
    name: "Dr. Harish Kumar",
    email: "harish@example.com",
    password: "hashedpassword123",
    age: 35,
    bloodGroup: "O+",
    allergies: "Penicillin",
    conditions: "Asthma",
    medications: "Albuterol Inhaler",
    emergencyContacts: [
      { name: "Priya Kumar", relationship: "Spouse", phone: "+919876543210" }
    ],
    qrCodeUrl: "http://localhost:3000/emergency/MED-2026-0001",
    role: "user" as const,
    createdAt: new Date().toISOString()
  };

  try {
    // Inject the test user into local database fallback securely
    const db = readLocalDB();
    const existingIndex = db.users.findIndex(u => u.id === testUserId);
    if (existingIndex >= 0) {
      db.users[existingIndex] = mockUser;
    } else {
      db.users.push(mockUser);
    }
    writeLocalDB(db);
    console.log(`[Setup] Injected test user with ID: ${testUserId}`);
  } catch (err: any) {
    console.warn("Failed to inject to local JSON database, proceeding with Mongo if available:", err);
  }

  // Define test cases
  const testCases = [
    {
      name: "Uppercase Input Match",
      input: "MED-2026-0001",
      expectedMatch: true
    },
    {
      name: "Lowercase Input Match",
      input: "med-2026-0001",
      expectedMatch: true
    },
    {
      name: "Mixed-Case Input Match",
      input: "mEd-2026-0001",
      expectedMatch: true
    },
    {
      name: "Leading Spaces Match",
      input: "   MED-2026-0001",
      expectedMatch: true
    },
    {
      name: "Trailing Spaces Match",
      input: "MED-2026-0001   ",
      expectedMatch: true
    },
    {
      name: "Accidental Internal Spaces Match",
      input: "MED - 2026 - 0001",
      expectedMatch: true
    },
    {
      name: "Name Search Match (Mixed Case)",
      input: "harish",
      expectedMatch: true
    },
    {
      name: "Email Search Match (Spaces & Mixed Case)",
      input: "  HARISH@example.com ",
      expectedMatch: true
    },
    {
      name: "Invalid ID Lookup (Fails Gracefully)",
      input: "INVALID-ID-999",
      expectedMatch: false
    },
    {
      name: "Empty / Spaces Only Input (Fails Gracefully)",
      input: "     ",
      expectedMatch: false
    }
  ];

  // Execute test cases
  for (const tc of testCases) {
    try {
      const result = await getUserById(tc.input);
      if (tc.expectedMatch) {
        assert(
          tc.name,
          result !== undefined && normalizeSearchId(result.id) === normalizeSearchId(testUserId),
          `Expected to find user for input "${tc.input}", but got ${result ? result.id : "undefined"}`
        );
      } else {
        assert(
          tc.name,
          result === undefined,
          `Expected NOT to find user for input "${tc.input}", but got user with ID ${result?.id}`
        );
      }
    } catch (err: any) {
      assert(tc.name, false, `Threw unexpected error: ${err.message}`);
    }
  }

  console.log("==================================================");
  if (failed) {
    console.error("❌ SOME TESTS FAILED. CHECK LOGS ABOVE.");
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  }
}

// Support exporting helper methods or running directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("runTests.ts")) {
  runAllTests();
}
