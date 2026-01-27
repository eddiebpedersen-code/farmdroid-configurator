import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface EmailLookupRequest {
  email: string;
}

interface LeadData {
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  region: string;
  company: string;
  isFarmer: string;
  farmingType: string;
  farmSize: string;
  hectaresForFarmDroid: string;
  crops: string;
  otherCrops: string;
  contactByPartner: boolean;
  marketingConsent: boolean;
  maskedName: string;
  maskedPhone: string;
  maskedCompany: string;
}

interface EmailLookupResponse {
  hasConfigurations: boolean;
  configurationCount: number;
  latestReference?: string;
  leadData?: LeadData;
}

/**
 * Mask a name: "John" → "J***", "Jo" → "J*"
 */
function maskName(name: string): string {
  if (!name || name.length === 0) return "";
  if (name.length === 1) return name;
  return name[0] + "*".repeat(Math.min(name.length - 1, 3));
}

/**
 * Mask a full name: "John Doe" → "J*** D***"
 */
function maskFullName(firstName: string, lastName: string): string {
  const parts = [maskName(firstName), maskName(lastName)].filter(Boolean);
  return parts.join(" ");
}

/**
 * Mask a phone number: "+4512345678" → "+45 ****5678"
 * Shows country code prefix and last 4 digits
 */
function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone || "";
  const digits = phone.replace(/[^0-9+]/g, "");
  if (digits.length <= 4) return "*".repeat(digits.length);
  const last4 = digits.slice(-4);
  const prefix = digits.startsWith("+") ? digits.slice(0, Math.min(3, digits.length - 4)) + " " : "";
  return prefix + "****" + last4;
}

/**
 * Mask company name: "FarmDroid ApS" → "F******** A**"
 */
function maskCompany(company: string): string {
  if (!company) return "";
  return company
    .split(" ")
    .map((word) => maskName(word))
    .join(" ");
}

/**
 * POST /api/email-lookup
 * Check if an email address has existing configurations.
 * Returns count and masked lead data from the most recent configuration.
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
    const { count, error: countError } = await supabase
      .from("configurations")
      .select("*", { count: "exact", head: true })
      .ilike("email", email);

    if (countError) {
      console.error("Email lookup error:", countError);
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

    // If configurations exist, fetch lead data from the most recent one
    if (configurationCount > 0) {
      const { data: latestConfig, error: fetchError } = await supabase
        .from("configurations")
        .select(
          "reference, first_name, last_name, phone, country, region, company, is_farmer, farming_type, farm_size, hectares_for_farmdroid, crops, other_crops, contact_by_partner, marketing_consent"
        )
        .ilike("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!fetchError && latestConfig) {
        response.latestReference = latestConfig.reference || undefined;
        response.leadData = {
          firstName: latestConfig.first_name || "",
          lastName: latestConfig.last_name || "",
          phone: latestConfig.phone || "",
          country: latestConfig.country || "",
          region: latestConfig.region || "",
          company: latestConfig.company || "",
          isFarmer: latestConfig.is_farmer || "",
          farmingType: latestConfig.farming_type || "",
          farmSize: latestConfig.farm_size || "",
          hectaresForFarmDroid: latestConfig.hectares_for_farmdroid || "",
          crops: latestConfig.crops || "",
          otherCrops: latestConfig.other_crops || "",
          contactByPartner: latestConfig.contact_by_partner ?? false,
          marketingConsent: latestConfig.marketing_consent ?? false,
          maskedName: maskFullName(
            latestConfig.first_name || "",
            latestConfig.last_name || ""
          ),
          maskedPhone: maskPhone(latestConfig.phone || ""),
          maskedCompany: maskCompany(latestConfig.company || ""),
        };
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Email lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
