import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface EmailLookupRequest {
  email: string;
}

interface EmailLookupResponse {
  hasConfigurations: boolean;
  configurationCount: number;
}

/**
 * POST /api/email-lookup
 * Check if an email address has existing configurations
 * Returns only count (no sensitive data until verified)
 */
export async function POST(request: NextRequest) {
  try {
    const body: EmailLookupRequest = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
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

    const supabase = createServerSupabaseClient();

    // Count configurations for this email (case-insensitive)
    const { count, error } = await supabase
      .from("configurations")
      .select("*", { count: "exact", head: true })
      .ilike("email", email);

    if (error) {
      console.error("Email lookup error:", error);
      return NextResponse.json(
        { error: "Failed to check email" },
        { status: 500 }
      );
    }

    const configurationCount = count || 0;

    const response: EmailLookupResponse = {
      hasConfigurations: configurationCount > 0,
      configurationCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Email lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
