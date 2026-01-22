"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, X } from "lucide-react";
import type {
  HubSpotObject,
  SourceCategory,
  TransformType,
  HubSpotProperty,
} from "@/lib/admin/types";
import { CONFIGURATOR_FIELDS } from "@/lib/admin/types";

interface MappingEditorProps {
  hubspotObject: HubSpotObject;
  existingMappings: string[]; // List of already mapped source fields
  onSubmit: (data: {
    source_field: string;
    source_category: SourceCategory;
    hubspot_object: HubSpotObject;
    hubspot_property: string;
    hubspot_property_label: string;
    transform_type: TransformType;
    transform_config?: Record<string, unknown>;
  }) => Promise<void>;
}

export function MappingEditor({
  hubspotObject,
  existingMappings,
  onSubmit,
}: MappingEditorProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hubspotProperties, setHubspotProperties] = useState<HubSpotProperty[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // HubSpot property selection (first step)
  const [hubspotProperty, setHubspotProperty] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<HubSpotProperty | null>(null);

  // Mapping type
  const [mappingType, setMappingType] = useState<"field" | "static" | "template">("field");

  // Form state for field mapping
  const [sourceCategory, setSourceCategory] = useState<"lead" | "config" | "derived">("lead");
  const [sourceField, setSourceField] = useState("");
  const [transformType, setTransformType] = useState<TransformType>("direct");

  // Form state for static value
  const [staticValue, setStaticValue] = useState("");

  // Form state for template (multiple fields)
  const [templateFields, setTemplateFields] = useState<Array<{ category: "lead" | "config" | "derived"; field: string }>>([]);
  const [templateSeparator, setTemplateSeparator] = useState(" ");

  // Fetch HubSpot properties when dialog opens
  useEffect(() => {
    if (open && hubspotProperties.length === 0) {
      fetchHubspotProperties();
    }
  }, [open]);

  // Update selected property when hubspotProperty changes
  useEffect(() => {
    const prop = hubspotProperties.find((p) => p.name === hubspotProperty);
    setSelectedProperty(prop || null);
    setStaticValue("");
  }, [hubspotProperty, hubspotProperties]);

  const fetchHubspotProperties = async () => {
    setPropertiesLoading(true);
    try {
      const response = await fetch(
        `/api/admin/hubspot/properties?object=${hubspotObject}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch HubSpot properties");
      }
      const data = await response.json();
      setHubspotProperties(data);
    } catch (err) {
      setError("Failed to load HubSpot properties");
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mappingType === "static") {
        // Static value mapping
        await onSubmit({
          source_field: `static_${hubspotProperty}`,
          source_category: "static",
          hubspot_object: hubspotObject,
          hubspot_property: hubspotProperty,
          hubspot_property_label: selectedProperty?.label || hubspotProperty,
          transform_type: "direct",
          transform_config: { value: staticValue },
        });
      } else if (mappingType === "template") {
        // Template mapping (multiple fields combined)
        await onSubmit({
          source_field: `template_${hubspotProperty}`,
          source_category: "static", // We'll handle this specially
          hubspot_object: hubspotObject,
          hubspot_property: hubspotProperty,
          hubspot_property_label: selectedProperty?.label || hubspotProperty,
          transform_type: "custom",
          transform_config: {
            type: "template",
            fields: templateFields,
            separator: templateSeparator,
          },
        });
      } else {
        // Single field mapping
        await onSubmit({
          source_field: sourceField,
          source_category: sourceCategory,
          hubspot_object: hubspotObject,
          hubspot_property: hubspotProperty,
          hubspot_property_label: selectedProperty?.label || hubspotProperty,
          transform_type: transformType,
        });
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create mapping");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setHubspotProperty("");
    setSelectedProperty(null);
    setMappingType("field");
    setSourceCategory("lead");
    setSourceField("");
    setTransformType("direct");
    setStaticValue("");
    setTemplateFields([]);
    setTemplateSeparator(" ");
  };

  const addTemplateField = () => {
    setTemplateFields([...templateFields, { category: "lead", field: "" }]);
  };

  const removeTemplateField = (index: number) => {
    setTemplateFields(templateFields.filter((_, i) => i !== index));
  };

  const updateTemplateField = (index: number, category: "lead" | "config" | "derived", field: string) => {
    const updated = [...templateFields];
    updated[index] = { category, field };
    setTemplateFields(updated);
  };

  // Get available source fields
  const getFieldsForCategory = (category: "lead" | "config" | "derived") =>
    CONFIGURATOR_FIELDS[category].filter((f) => !existingMappings.includes(f.key));

  // Check if property is a text type (can use template)
  const isTextProperty = selectedProperty?.type === "string" || selectedProperty?.fieldType === "text" || selectedProperty?.fieldType === "textarea";
  const hasOptions = selectedProperty?.options && selectedProperty.options.length > 0;

  const canSubmit =
    hubspotProperty &&
    ((mappingType === "field" && sourceField) ||
      (mappingType === "static" && staticValue) ||
      (mappingType === "template" && templateFields.length > 0 && templateFields.every((f) => f.field)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Mapping
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Field Mapping</DialogTitle>
            <DialogDescription>
              Configure how data maps to HubSpot{" "}
              {hubspotObject === "contact"
                ? "Contact"
                : hubspotObject === "company"
                ? "Company"
                : "Deal"}{" "}
              properties.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Step 1: Select HubSpot Property */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">1. Select HubSpot Property</Label>
              {propertiesLoading ? (
                <div className="flex items-center gap-2 text-stone-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading properties...
                </div>
              ) : (
                <Select value={hubspotProperty} onValueChange={setHubspotProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {hubspotProperties.map((prop) => (
                      <SelectItem key={prop.name} value={prop.name}>
                        {prop.label}
                        <span className="text-stone-400 ml-2">({prop.type})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedProperty && (
                <p className="text-xs text-stone-500">
                  Type: {selectedProperty.type} | Field: {selectedProperty.fieldType}
                  {hasOptions && ` | ${selectedProperty.options!.length} options`}
                </p>
              )}
            </div>

            {/* Step 2: Choose mapping type (only show after property is selected) */}
            {hubspotProperty && (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">2. Choose Value Source</Label>
                  <Tabs value={mappingType} onValueChange={(v) => setMappingType(v as typeof mappingType)}>
                    <TabsList className={`grid w-full ${isTextProperty ? "grid-cols-3" : "grid-cols-2"}`}>
                      <TabsTrigger value="field">Single Field</TabsTrigger>
                      <TabsTrigger value="static">Default Value</TabsTrigger>
                      {isTextProperty && (
                        <TabsTrigger value="template">Combine Fields</TabsTrigger>
                      )}
                    </TabsList>

                    {/* Single Field Mapping */}
                    <TabsContent value="field" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Source Category</Label>
                        <Select
                          value={sourceCategory}
                          onValueChange={(v) => {
                            setSourceCategory(v as "lead" | "config" | "derived");
                            setSourceField("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead">Lead Data (form fields)</SelectItem>
                            <SelectItem value="config">Configuration (robot settings)</SelectItem>
                            <SelectItem value="derived">Derived (URL, reference, etc.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Source Field</Label>
                        <Select value={sourceField} onValueChange={setSourceField}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a field..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getFieldsForCategory(sourceCategory).map((field) => (
                              <SelectItem key={field.key} value={field.key}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Transform</Label>
                        <Select
                          value={transformType}
                          onValueChange={(v) => setTransformType(v as TransformType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="direct">Direct (as-is)</SelectItem>
                            <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                            <SelectItem value="array_join">Array Join</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    {/* Static/Default Value */}
                    <TabsContent value="static" className="space-y-4 mt-4">
                      <p className="text-sm text-stone-500">
                        Set a fixed default value for this property.
                      </p>
                      <div className="space-y-2">
                        <Label>Default Value</Label>
                        {hasOptions ? (
                          <Select value={staticValue} onValueChange={setStaticValue}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a value..." />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedProperty!.options!.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Enter default value..."
                            value={staticValue}
                            onChange={(e) => setStaticValue(e.target.value)}
                          />
                        )}
                      </div>
                    </TabsContent>

                    {/* Template/Combine Fields (only for text properties) */}
                    {isTextProperty && (
                      <TabsContent value="template" className="space-y-4 mt-4">
                        <p className="text-sm text-stone-500">
                          Combine multiple fields into one value.
                        </p>

                        <div className="space-y-2">
                          <Label>Separator</Label>
                          <Select value={templateSeparator} onValueChange={setTemplateSeparator}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=" ">Space</SelectItem>
                              <SelectItem value=", ">Comma + Space</SelectItem>
                              <SelectItem value=" - ">Dash</SelectItem>
                              <SelectItem value=" | ">Pipe</SelectItem>
                              <SelectItem value="\n">New Line</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Fields to Combine</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addTemplateField}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Field
                            </Button>
                          </div>

                          {templateFields.length === 0 && (
                            <p className="text-sm text-stone-400 py-2">
                              Click "Add Field" to start combining fields
                            </p>
                          )}

                          <div className="space-y-2">
                            {templateFields.map((tf, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Select
                                  value={tf.category}
                                  onValueChange={(v) =>
                                    updateTemplateField(index, v as "lead" | "config" | "derived", "")
                                  }
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="config">Config</SelectItem>
                                    <SelectItem value="derived">Derived</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={tf.field}
                                  onValueChange={(v) =>
                                    updateTemplateField(index, tf.category, v)
                                  }
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select field..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CONFIGURATOR_FIELDS[tf.category].map((field) => (
                                      <SelectItem key={field.key} value={field.key}>
                                        {field.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeTemplateField(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {templateFields.length > 0 && (
                            <div className="bg-stone-50 p-2 rounded text-sm">
                              <span className="text-stone-500">Preview: </span>
                              {templateFields
                                .filter((f) => f.field)
                                .map((f) => {
                                  const fieldDef = CONFIGURATOR_FIELDS[f.category].find(
                                    (fd) => fd.key === f.field
                                  );
                                  return `{${fieldDef?.label || f.field}}`;
                                })
                                .join(templateSeparator === "\n" ? " ↵ " : templateSeparator)}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !canSubmit}>
              {isLoading ? "Creating..." : "Create Mapping"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
