"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { decodeConfigPageData } from "@/lib/config-page-utils";
import { ConfigPageData, CONFIG_PAGE_VERSION } from "@/lib/config-page-types";
import { ConfigPageContent } from "@/components/config-page/ConfigPageContent";
import { ConfigNotFound } from "@/components/config-page/ConfigNotFound";

function ConfigContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const t = useTranslations("configPage");

  const [configData, setConfigData] = useState<ConfigPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadConfiguration() {
      const reference = params.id as string;
      const encodedParam = searchParams.get("d");

      // First, try to fetch from database using reference code
      if (reference) {
        try {
          const response = await fetch(`/api/configurations/${reference}`);

          if (response.ok) {
            const data = await response.json();

            // Transform API response to ConfigPageData format
            const configPageData: ConfigPageData = {
              version: CONFIG_PAGE_VERSION,
              config: data.config,
              lead: data.lead,
              reference: data.reference,
              createdAt: data.createdAt,
              locale: data.locale,
              viewCount: data.viewCount,
              lastViewedAt: data.lastViewedAt,
            };

            setConfigData(configPageData);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to fetch from API:", err);
          // Fall through to URL param fallback
        }
      }

      // Fallback: Try to decode from URL parameter (backwards compatibility)
      if (encodedParam) {
        try {
          const decoded = decodeConfigPageData(encodedParam);
          if (decoded) {
            setConfigData(decoded);
            setIsLoading(false);
            return;
          }
        } catch {
          // Fall through to error
        }
      }

      // No data found
      setError(encodedParam ? "invalid" : "noData");
      setIsLoading(false);
    }

    loadConfiguration();
  }, [params.id, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !configData) {
    return <ConfigNotFound errorType={error || "invalid"} />;
  }

  return <ConfigPageContent data={configData} />;
}

function ConfigLoadingFallback() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-stone-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default function ConfigRoute() {
  return (
    <Suspense fallback={<ConfigLoadingFallback />}>
      <ConfigContent />
    </Suspense>
  );
}
