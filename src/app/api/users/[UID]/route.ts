// src/app/api/users/[UID]/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb, verifyAdmin } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { UID: string } } // 👈 match folder name
) {
  try {
    await verifyAdmin(req);

    const { UID } = params;
    if (!UID) {
      return NextResponse.json({ error: "Missing UID" }, { status: 400 });
    }

    // ✅ Delete from Auth & Firestore
    await adminAuth.deleteUser(UID);
    await adminDb.collection("users").doc(UID).delete();

    return NextResponse.json({ ok: true, uid: UID });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete user" },
      { status: 403 }
    );
  }
}
