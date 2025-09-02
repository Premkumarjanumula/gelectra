export const runtime = "nodejs";          // Ensure Node runtime (not edge)
export const dynamic = "force-dynamic";   // Avoid caching

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { sendInviteEmail } from "@/lib/mailer";

type Body = { email?: string; role?: "EXECUTIVE_BOARD_MEMBER" | "CLUB_MEMBER" };

export async function POST(req: Request) {
  try {
    const { email, role } = (await req.json()) as Body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["EXECUTIVE_BOARD_MEMBER", "CLUB_MEMBER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // 1) Create or fetch Firebase user
    let user;
    try {
      user = await adminAuth.getUserByEmail(email);
    } catch (e: any) {
      if (e?.code === "auth/user-not-found") {
        user = await adminAuth.createUser({ email, emailVerified: false, disabled: false });
      } else {
        throw e;
      }
    }

    // 2) ✅ Assign admin claim based on role
    if (role === "EXECUTIVE_BOARD_MEMBER") {
      await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    } else {
      await adminAuth.setCustomUserClaims(user.uid, { admin: false });
    }

    // 3) Store role in Firestore
    await adminDb.collection("users").doc(user.uid).set(
      {
        email,
        role,
        createdAt: new Date(),
      },
      { merge: true }
    );

    // 4) Generate password reset link
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: process.env.INVITE_REDIRECT_URL || "http://localhost:9000/login",
      handleCodeInApp: false,
    });

    // 5) Send invite mail
    await sendInviteEmail(email, resetLink, role);

    return NextResponse.json({
      ok: true,
      inviteLink: resetLink, // also returned in case you want to show it in UI
      uid: user.uid,
    });
  } catch (err: any) {
    console.error("createUser error:", err);
    // Always return JSON to prevent “Unexpected token '<' … not valid JSON”
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
