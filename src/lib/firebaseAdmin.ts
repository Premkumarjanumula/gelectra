import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
const privateKey = process.env.FIREBASE_PRIVATE_KEY!;

if (!getApps().length) {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase admin env vars.");
  }
  // Convert \n -> real newlines if provided that way
  const pk = privateKey.replace(/\\n/g, "\n");

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: pk,
    }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();

/**
 * Helper to verify that a request is from an admin.
 * Expects Authorization: Bearer <ID_TOKEN> header.
 */
export async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const idToken = authHeader.split(" ")[1];
  const decoded = await adminAuth.verifyIdToken(idToken);

  if (!decoded.admin) {
    throw new Error("Not authorized — admin only");
  }

  return decoded; // contains uid, email, admin: true, etc.
}
