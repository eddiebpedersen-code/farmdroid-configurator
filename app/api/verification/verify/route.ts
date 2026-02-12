import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isCodeExpired } from "@/lib/rate-limit";
import type { EmailVerificationPurpose } from "@/lib/database-types";
import type { ConfiguratorState } from "@/lib/configurator-data";

interface VerificationVerifyRequest {
  email: string;
  code: string;
  purpose: EmailVerificationPurpose;
}

interface ConfigurationSummary {
  reference: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  currency: string;
  status: string;
  viewCount: number;
  config: {
    activeRows: number;
    seedSize: string;
    powerSource: string;
    spraySystem: boolean;
    frontWheel: string;
    starterKit: boolean;
  };
}

interface VerificationVerifyResponse {
  success: boolean;
  configurations?: ConfigurationSummary[];
  error?: string;
}

/**
 * POST /api/verification/verify
 * Verify the code and return user's configurations
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerificationVerifyRequest = await request.json();
    const { email, code, purpose } = body;

    // Validate inputs
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (!purpose || !["email_lookup", "my_configs"].includes(purpose)) {
      return NextResponse.json(
        { error: "Invalid purpose" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const supabase = createServerSupabaseClient();

    // Find the most recent matching verification code
    const { data: verificationData, error: findError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", code)
      .eq("purpose", purpose)
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (findError || !verificationData) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (isCodeExpired(verificationData.expires_at)) {
      return NextResponse.json(
        { success: false, error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Check if max attempts exceeded
    if (verificationData.attempts >= verificationData.max_attempts) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please request a new code." },
        { status: 400 }
      );
    }

    // Increment attempts
    await supabase
      .from("email_verification_codes")
      .update({ attempts: verificationData.attempts + 1 })
      .eq("id", verificationData.id);

    // Mark code as verified
    await supabase
      .from("email_verification_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verificationData.id);

    // Fetch user's configurations
    const { data: configurations, error: configError } = await supabase
      .from("configurations")
      .select("reference, config, total_price, currency, status, created_at, updated_at, view_count")
      .ilike("email", normalizedEmail)
      .order("created_at", { ascending: false });

    if (configError) {
      console.error("Failed to fetch configurations:", configError);
      return NextResponse.json(
        { error: "Failed to fetch configurations" },
        { status: 500 }
      );
    }

    // Transform configurations to summary format
    const configurationSummaries: ConfigurationSummary[] = (configurations || []).map(
      (config) => {
        const configData = config.config as ConfiguratorState;
        return {
          reference: config.reference,
          createdAt: config.created_at,
          updatedAt: config.updated_at,
          totalPrice: config.total_price,
          currency: config.currency,
          status: config.status,
          viewCount: config.view_count ?? 0,
          config: {
            activeRows: configData.activeRows,
            seedSize: configData.seedSize,
            powerSource: configData.powerSource,
            spraySystem: configData.spraySystem,
            frontWheel: configData.frontWheel,
            starterKit: configData.starterKit,
          },
        };
      }
    );

    const response: VerificationVerifyResponse = {
      success: true,
      configurations: configurationSummaries,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Verification verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
