import { NextResponse } from "next/server";
import { adminAuth, adminDb, verifyAdmin } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → List all users with Firestore role + createdAt
export async function GET(req: Request) {
  try {
    await verifyAdmin(req); // ✅ only admins allowed

    const users: any[] = [];
    let nextPageToken: string | undefined;

    do {
      const result = await adminAuth.listUsers(1000, nextPageToken);

      // Fetch Firestore data for each Auth user
      const batch = await Promise.all(
        result.users.map(async (userRecord) => {
          const userDoc = await adminDb
            .collection("users")
            .doc(userRecord.uid)
            .get();

          const firestoreData = userDoc.exists ? userDoc.data() : {};

          return {
            uid: userRecord.uid,
            email: userRecord.email,
            disabled: userRecord.disabled,
            role: firestoreData?.role || "CLUB_MEMBER", // fallback
            createdAt: firestoreData?.createdAt?.toDate?.().toISOString() || null,
          };
        })
      );

      users.push(...batch);
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Error listing users:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list users" },
      { status: 403 }
    );
  }
}
