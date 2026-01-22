"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InlineMappingEditor } from "@/components/admin/InlineMappingEditor";
import { AlertCircle, Loader2, User, Building, Handshake } from "lucide-react";
import type { HubSpotFieldMappingRow, HubSpotObject, SourceCategory, TransformType } from "@/lib/admin/types";

export default function MappingsPage() {
  const [mappings, setMappings] = useState<HubSpotFieldMappingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<HubSpotObject>("contact");

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      const response = await fetch("/api/admin/mappings");
      if (!response.ok) {
        throw new Error("Failed to fetch mappings");
      }
      const data = await response.json();
      setMappings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMapping = async (data: {
    source_field: string;
    source_category: SourceCategory;
    hubspot_object: HubSpotObject;
    hubspot_property: string;
    hubspot_property_label: string;
    transform_type: TransformType;
    transform_config?: Record<string, unknown>;
  }) => {
    const response = await fetch("/api/admin/mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create mapping");
    }

    const newMapping = await response.json();
    setMappings((prev) => [...prev, newMapping]);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const response = await fetch(`/api/admin/mappings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    });

    if (!response.ok) {
      throw new Error("Failed to update mapping");
    }

    const updatedMapping = await response.json();
    setMappings((prev) =>
      prev.map((m) => (m.id === id ? updatedMapping : m))
    );
  };

  const handleDeleteMapping = async (id: string) => {
    const response = await fetch(`/api/admin/mappings/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete mapping");
    }

    setMappings((prev) => prev.filter((m) => m.id !== id));
  };

  const getMappingsForObject = (objectType: HubSpotObject) =>
    mappings.filter((m) => m.hubspot_object === objectType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Field Mappings</h1>
        <p className="text-stone-600 mt-1">
          Map configurator fields to HubSpot properties
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>HubSpot Field Mappings</CardTitle>
          <CardDescription>
            Map fields from the lead form and robot configuration to HubSpot.
            You can also set default values for properties like pipeline and deal stage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as HubSpotObject)}
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Contact
                <span className="bg-stone-200 text-stone-600 px-2 py-0.5 rounded text-xs">
                  {getMappingsForObject("contact").length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company
                <span className="bg-stone-200 text-stone-600 px-2 py-0.5 rounded text-xs">
                  {getMappingsForObject("company").length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="deal" className="flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Deal
                <span className="bg-stone-200 text-stone-600 px-2 py-0.5 rounded text-xs">
                  {getMappingsForObject("deal").length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contact">
              <InlineMappingEditor
                hubspotObject="contact"
                mappings={getMappingsForObject("contact")}
                onCreateMapping={handleCreateMapping}
                onToggleActive={handleToggleActive}
                onDeleteMapping={handleDeleteMapping}
              />
            </TabsContent>

            <TabsContent value="company">
              <InlineMappingEditor
                hubspotObject="company"
                mappings={getMappingsForObject("company")}
                onCreateMapping={handleCreateMapping}
                onToggleActive={handleToggleActive}
                onDeleteMapping={handleDeleteMapping}
              />
            </TabsContent>

            <TabsContent value="deal">
              <InlineMappingEditor
                hubspotObject="deal"
                mappings={getMappingsForObject("deal")}
                onCreateMapping={handleCreateMapping}
                onToggleActive={handleToggleActive}
                onDeleteMapping={handleDeleteMapping}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Field Mapping Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-stone-600 space-y-3">
          <p>
            <strong>Field Mappings:</strong> Map data from the configurator to HubSpot properties.
            Choose a source field (from Lead, Config, or Derived data) and map it to a HubSpot property.
          </p>
          <p>
            <strong>Default Values:</strong> Set fixed values for HubSpot properties.
            Useful for setting pipeline, deal stage, or lifecycle stage automatically.
            If the property has predefined options (like a dropdown), you'll see those options.
          </p>
          <p>
            <strong>Derived Fields:</strong> Special computed values like the configuration URL,
            reference number, price, and configuration summary.
          </p>
          <p>
            <strong>Transform Types:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Direct:</strong> Value is passed as-is to HubSpot</li>
            <li><strong>Yes/No:</strong> Converts true/false to Yes/No text</li>
            <li><strong>Join:</strong> Joins array values with commas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
