import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendVerificationCodeEmail } from "@/lib/emails/sendgrid";
import {
  checkVerificationSendRateLimit,
  checkVerificationIPRateLimit,
  generateVerificationCode,
  getCodeExpiration,
  hashIP,
  getClientIP,
} from "@/lib/rate-limit";
import type { EmailVerificationPurpose } from "@/lib/database-types";

interface VerificationSendRequest {
  email: string;
  purpose: EmailVerificationPurpose;
  locale?: string;
}

interface VerificationSendResponse {
  success: boolean;
  message: string;
  expiresInMinutes: number;
}

/**
 * POST /api/verification/send
 * Generate and send a verification code to the email
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerificationSendRequest = await request.json();
    const { email, purpose, locale = "en" } = body;

    // Validate inputs
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!purpose || !["email_lookup", "my_configs"].includes(purpose)) {
      return NextResponse.json(
        { error: "Invalid purpose" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check rate limits
    const emailRateLimit = await checkVerificationSendRateLimit(normalizedEmail);
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many verification requests. Please try again later.",
          retryAfter: Math.ceil((emailRateLimit.resetAt.getTime() - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    const ipRateLimit = await checkVerificationIPRateLimit(ipHash);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests from this location. Please try again later.",
          retryAfter: Math.ceil((ipRateLimit.resetAt.getTime() - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = getCodeExpiration();

    const supabase = createServerSupabaseClient();

    // Insert verification code into database
    const { error: insertError } = await supabase
      .from("email_verification_codes")
      .insert({
        email: normalizedEmail,
        code,
        purpose,
        expires_at: expiresAt,
        ip_hash: ipHash,
      });

    if (insertError) {
      console.error("Failed to insert verification code:", insertError);
      return NextResponse.json(
        { error: "Failed to generate verification code" },
        { status: 500 }
      );
    }

    // Send verification email
    const emailSent = await sendVerificationCodeEmail(normalizedEmail, code, locale);

    if (!emailSent) {
      console.error("Failed to send verification email");
      // Still return success since the code was created
      // User might not receive email due to their spam filter
    }

    const response: VerificationSendResponse = {
      success: true,
      message: "Verification code sent",
      expiresInMinutes: 10,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Verification send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
