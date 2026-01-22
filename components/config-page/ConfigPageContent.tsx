"use client";

import { ConfigPageData } from "@/lib/config-page-types";
import { HeroSection } from "./HeroSection";
import { ConfigurationCard } from "./ConfigurationCard";
import { InvestmentCard } from "./InvestmentCard";
import { ConfigVisualization } from "./ConfigVisualization";
import { FarmFitSection } from "./FarmFitSection";
import { CapacityGraphWidget } from "./CapacityGraphWidget";
import { NextStepsSection } from "./NextStepsSection";
import { ReconfigureSection } from "./ReconfigureSection";
import { OtherConfigurationsWidget } from "./OtherConfigurationsWidget";

interface ConfigPageContentProps {
  data: ConfigPageData;
}

export function ConfigPageContent({ data }: ConfigPageContentProps) {
  return (
    <div className="min-h-screen bg-stone-50 print:bg-white">
      {/* Hero Section with Share Actions */}
      <HeroSection data={data} />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Two Column Layout - Row 1: Configuration and Investment/Capacity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration (stretch to fill) */}
          <div className="flex flex-col">
            <ConfigurationCard data={data} className="flex-1" />
          </div>

          {/* Right Column - Investment and Capacity stacked (stretch to match) */}
          <div className="flex flex-col gap-6">
            <InvestmentCard data={data} />
            <CapacityGraphWidget data={data} className="flex-1" />
          </div>
        </div>

        {/* Full Width Visualization */}
        <div className="mt-6">
          <ConfigVisualization data={data} />
        </div>

        {/* Two Column Layout - Row 2: Farm Fit and Next Steps (stretch to match) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FarmFitSection data={data} className="h-full" />
          <NextStepsSection data={data} className="h-full" />
        </div>

        {/* Reconfigure Section - Full Width */}
        <div className="mt-6">
          <ReconfigureSection data={data} />
        </div>

        {/* Other Configurations Widget - shows if user has other configs */}
        <div className="mt-6">
          <OtherConfigurationsWidget data={data} />
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-8 text-center text-sm text-stone-500">
        <p>Generated on {new Date().toLocaleDateString()}</p>
        <p>FarmDroid ApS | www.farmdroid.dk</p>
      </div>
    </div>
  );
}
