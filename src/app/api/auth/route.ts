import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { db, adminEmails, otpCodes } from "@/lib/db";
import { eq, and, gt } from "drizzle-orm";
import { OtpEmail } from "@/lib/email/otp-email";

const COOKIE_NAME = "dashboard_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const OTP_EXPIRY_MINUTES = 10;

// Lazy initialization to avoid build-time errors
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth - Request OTP or verify OTP
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Step 1: Request OTP
    if (email && !otp) {
      // Check if email is whitelisted
      const adminEmail = await db
        .select()
        .from(adminEmails)
        .where(eq(adminEmails.email, email.toLowerCase().trim()))
        .limit(1);

      if (adminEmail.length === 0) {
        return NextResponse.json(
          { error: "This email is not authorized to access the dashboard" },
          { status: 403 }
        );
      }

      // Generate OTP
      const code = generateOTP();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP in database
      await db.insert(otpCodes).values({
        email: email.toLowerCase().trim(),
        code,
        expiresAt,
      });

      // Send OTP via email
      try {
        const resend = getResend();
        const emailHtml = await render(
          OtpEmail({ code, expiryMinutes: OTP_EXPIRY_MINUTES })
        );

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "DPS Poll <onboarding@resend.dev>",
          to: email.toLowerCase().trim(),
          subject: "DPS Login",
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        return NextResponse.json(
          { error: "Failed to send OTP email" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Code sent to your email"
      });
    }

    // Step 2: Verify OTP
    if (email && otp) {
      const now = new Date();

      // Find valid OTP
      const validOtp = await db
        .select()
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.email, email.toLowerCase().trim()),
            eq(otpCodes.code, otp),
            eq(otpCodes.used, false),
            gt(otpCodes.expiresAt, now)
          )
        )
        .limit(1);

      if (validOtp.length === 0) {
        return NextResponse.json(
          { error: "Invalid or expired code" },
          { status: 401 }
        );
      }

      // Mark OTP as used
      await db
        .update(otpCodes)
        .set({ used: true })
        .where(eq(otpCodes.id, validOtp[0].id));

      // Set auth cookie
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// DELETE /api/auth - Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
