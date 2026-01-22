import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";
import { hubspotRequest } from "@/lib/hubspot/client";

interface HubSpotPipeline {
  id: string;
  label: string;
  stages: Array<{
    id: string;
    label: string;
  }>;
}

interface HubSpotPipelinesResponse {
  results: HubSpotPipeline[];
}

// Simple in-memory cache (5 minutes)
let cache: { data: { pipelines: Array<{ value: string; label: string }>; stages: Array<{ value: string; label: string }> }; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// GET /api/admin/hubspot/pipelines
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify current user is authenticated and is an admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email!)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    // Fetch pipelines from HubSpot
    const response = await hubspotRequest<HubSpotPipelinesResponse>(
      "/crm/v3/pipelines/deals"
    );

    // Transform pipelines
    const pipelines = response.results.map((p) => ({
      value: p.id,
      label: p.label,
    }));

    // Collect all stages from all pipelines
    const stages: Array<{ value: string; label: string }> = [];
    for (const pipeline of response.results) {
      for (const stage of pipeline.stages) {
        stages.push({
          value: stage.id,
          label: `${pipeline.label} > ${stage.label}`,
        });
      }
    }

    const data = { pipelines, stages };

    console.log("Pipelines API returning:", {
      pipelinesCount: pipelines.length,
      stagesCount: stages.length,
      pipelines: pipelines.slice(0, 5),
      stages: stages.slice(0, 5)
    });

    // Update cache
    cache = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    console.error("HubSpot pipelines API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot pipelines" },
      { status: 500 }
    );
  }
}
