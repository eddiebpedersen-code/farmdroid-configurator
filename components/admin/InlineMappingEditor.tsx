"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowRight, Loader2, Lock, Search, Pencil, X, Check } from "lucide-react";
import type {
  HubSpotObject,
  SourceCategory,
  TransformType,
  HubSpotProperty,
  HubSpotFieldMappingRow,
} from "@/lib/admin/types";
import { CONFIGURATOR_FIELDS } from "@/lib/admin/types";

interface InlineMappingEditorProps {
  hubspotObject: HubSpotObject;
  mappings: HubSpotFieldMappingRow[];
  onCreateMapping: (data: {
    source_field: string;
    source_category: SourceCategory;
    hubspot_object: HubSpotObject;
    hubspot_property: string;
    hubspot_property_label: string;
    transform_type: TransformType;
    transform_config?: Record<string, unknown>;
  }) => Promise<void>;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onDeleteMapping: (id: string) => Promise<void>;
  onUpdateMapping: (
    id: string,
    data: {
      source_field?: string;
      source_category?: SourceCategory;
      hubspot_property?: string;
      hubspot_property_label?: string;
      transform_type?: TransformType;
      transform_config?: Record<string, unknown>;
    }
  ) => Promise<void>;
}

interface NewMappingRow {
  id: string;
  mappingType: "field" | "default" | "combine";
  sourceCategory: "lead" | "config" | "derived";
  sourceField: string;
  hubspotProperty: string;
  defaultValue: string;
  transformType: TransformType;
  isSubmitting: boolean;
  // For combine/template mappings
  templateFields: Array<{ category: "lead" | "config" | "derived"; field: string }>;
  templateSeparator: string;
}

interface PipelineOption {
  value: string;
  label: string;
}

interface EditingMapping {
  id: string;
  mappingType: "field" | "default" | "combine";
  sourceCategory: "lead" | "config" | "derived";
  sourceField: string;
  hubspotProperty: string;
  defaultValue: string;
  transformType: TransformType;
  isSubmitting: boolean;
  templateFields: Array<{ category: "lead" | "config" | "derived"; field: string }>;
  templateSeparator: string;
}

export function InlineMappingEditor({
  hubspotObject,
  mappings,
  onCreateMapping,
  onToggleActive,
  onDeleteMapping,
  onUpdateMapping,
}: InlineMappingEditorProps) {
  const [hubspotProperties, setHubspotProperties] = useState<HubSpotProperty[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [newRows, setNewRows] = useState<NewMappingRow[]>([]);
  const [propertySearch, setPropertySearch] = useState("");
  const [pipelines, setPipelines] = useState<PipelineOption[]>([]);
  const [dealStages, setDealStages] = useState<PipelineOption[]>([]);
  const [editingMapping, setEditingMapping] = useState<EditingMapping | null>(null);

  useEffect(() => {
    fetchHubspotProperties();
    if (hubspotObject === "deal") {
      fetchPipelines();
    }
  }, [hubspotObject]);

  const fetchHubspotProperties = async () => {
    setPropertiesLoading(true);
    try {
      const response = await fetch(
        `/api/admin/hubspot/properties?object=${hubspotObject}`
      );
      if (response.ok) {
        const data = await response.json();
        setHubspotProperties(data);
      }
    } catch (err) {
      console.error("Failed to load HubSpot properties:", err);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      console.log("Fetching pipelines...");
      const response = await fetch("/api/admin/hubspot/pipelines");
      console.log("Pipelines response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Pipelines data received:", data);
        setPipelines(data.pipelines || []);
        setDealStages(data.stages || []);
      } else {
        console.error("Pipelines API error:", await response.text());
      }
    } catch (err) {
      console.error("Failed to load pipelines:", err);
    }
  };

  const addNewRow = () => {
    setNewRows([
      ...newRows,
      {
        id: `new-${Date.now()}`,
        mappingType: "field",
        sourceCategory: "lead",
        sourceField: "",
        hubspotProperty: "",
        defaultValue: "",
        transformType: "direct",
        isSubmitting: false,
        templateFields: [],
        templateSeparator: " ",
      },
    ]);
  };

  const updateNewRow = (id: string, updates: Partial<NewMappingRow>) => {
    setNewRows(
      newRows.map((row) => (row.id === id ? { ...row, ...updates } : row))
    );
  };

  const removeNewRow = (id: string) => {
    setNewRows(newRows.filter((row) => row.id !== id));
  };

  const submitNewRow = async (row: NewMappingRow) => {
    updateNewRow(row.id, { isSubmitting: true });

    try {
      const selectedProperty = hubspotProperties.find(
        (p) => p.name === row.hubspotProperty
      );

      if (row.mappingType === "default") {
        await onCreateMapping({
          source_field: `static_${row.hubspotProperty}`,
          source_category: "static",
          hubspot_object: hubspotObject,
          hubspot_property: row.hubspotProperty,
          hubspot_property_label: selectedProperty?.label || row.hubspotProperty,
          transform_type: "direct",
          transform_config: { value: row.defaultValue },
        });
      } else if (row.mappingType === "combine") {
        await onCreateMapping({
          source_field: `template_${row.hubspotProperty}`,
          source_category: "static",
          hubspot_object: hubspotObject,
          hubspot_property: row.hubspotProperty,
          hubspot_property_label: selectedProperty?.label || row.hubspotProperty,
          transform_type: "custom",
          transform_config: {
            type: "template",
            fields: row.templateFields,
            separator: row.templateSeparator,
          },
        });
      } else {
        await onCreateMapping({
          source_field: row.sourceField,
          source_category: row.sourceCategory,
          hubspot_object: hubspotObject,
          hubspot_property: row.hubspotProperty,
          hubspot_property_label: selectedProperty?.label || row.hubspotProperty,
          transform_type: row.transformType,
        });
      }

      removeNewRow(row.id);
    } catch (err) {
      updateNewRow(row.id, { isSubmitting: false });
    }
  };

  const getSourceFieldLabel = (category: string, field: string) => {
    if (category === "static") return null;
    const fields = CONFIGURATOR_FIELDS[category as "lead" | "config" | "derived"];
    return fields?.find((f) => f.key === field)?.label || field;
  };

  const getPropertyOptions = (propertyName: string): PipelineOption[] => {
    // Special handling for pipeline and dealstage
    if (propertyName === "pipeline") {
      return pipelines;
    }
    if (propertyName === "dealstage") {
      return dealStages;
    }
    // Regular property options
    const prop = hubspotProperties.find((p) => p.name === propertyName);
    console.log(`getPropertyOptions for ${propertyName}:`, {
      type: prop?.type,
      fieldType: prop?.fieldType,
      optionsCount: prop?.options?.length || 0,
      options: prop?.options
    });
    return prop?.options || [];
  };

  const hasPropertyOptions = (propertyName: string): boolean => {
    // Special handling for pipeline and dealstage
    if (propertyName === "pipeline") {
      return pipelines.length > 0;
    }
    if (propertyName === "dealstage") {
      return dealStages.length > 0;
    }
    // Regular property options - check both options array AND if type is enumeration
    const prop = hubspotProperties.find((p) => p.name === propertyName);
    const hasOptions = (prop?.options && prop.options.length > 0) || false;
    const isEnumeration = prop?.type === "enumeration";
    console.log(`hasPropertyOptions for ${propertyName}:`, {
      hasOptions,
      isEnumeration,
      type: prop?.type,
      optionsCount: prop?.options?.length || 0
    });
    return hasOptions;
  };

  const filteredProperties = hubspotProperties.filter(
    (p) =>
      p.label.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.name.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const canSubmitRow = (row: NewMappingRow) => {
    if (!row.hubspotProperty) return false;
    if (row.mappingType === "default") return !!row.defaultValue;
    if (row.mappingType === "combine") {
      return row.templateFields.length > 0 && row.templateFields.every(f => f.field);
    }
    return !!row.sourceField;
  };

  const addTemplateField = (rowId: string) => {
    const row = newRows.find(r => r.id === rowId);
    if (row) {
      updateNewRow(rowId, {
        templateFields: [...row.templateFields, { category: "lead", field: "" }]
      });
    }
  };

  const removeTemplateField = (rowId: string, index: number) => {
    const row = newRows.find(r => r.id === rowId);
    if (row) {
      updateNewRow(rowId, {
        templateFields: row.templateFields.filter((_, i) => i !== index)
      });
    }
  };

  const updateTemplateField = (rowId: string, index: number, category: "lead" | "config" | "derived", field: string) => {
    const row = newRows.find(r => r.id === rowId);
    if (row) {
      const updated = [...row.templateFields];
      updated[index] = { category, field };
      updateNewRow(rowId, { templateFields: updated });
    }
  };

  // Edit existing mapping functions
  const startEditing = (mapping: HubSpotFieldMappingRow) => {
    const isStatic = mapping.source_category === "static";
    const transformConfig = mapping.transform_config as { value?: string; type?: string; fields?: Array<{ category: "lead" | "config" | "derived"; field: string }>; separator?: string } | null;
    const isTemplate = transformConfig?.type === "template";

    setEditingMapping({
      id: mapping.id,
      mappingType: isTemplate ? "combine" : isStatic ? "default" : "field",
      sourceCategory: isStatic ? "lead" : (mapping.source_category as "lead" | "config" | "derived"),
      sourceField: isStatic ? "" : mapping.source_field,
      hubspotProperty: mapping.hubspot_property,
      defaultValue: isStatic && !isTemplate ? (transformConfig?.value || "") : "",
      transformType: mapping.transform_type,
      isSubmitting: false,
      templateFields: isTemplate ? (transformConfig?.fields || []) : [],
      templateSeparator: isTemplate ? (transformConfig?.separator || " ") : " ",
    });
  };

  const cancelEditing = () => {
    setEditingMapping(null);
  };

  const updateEditingMapping = (updates: Partial<EditingMapping>) => {
    if (editingMapping) {
      setEditingMapping({ ...editingMapping, ...updates });
    }
  };

  const submitEdit = async () => {
    if (!editingMapping) return;

    setEditingMapping({ ...editingMapping, isSubmitting: true });

    try {
      const selectedProperty = hubspotProperties.find(
        (p) => p.name === editingMapping.hubspotProperty
      );

      if (editingMapping.mappingType === "default") {
        await onUpdateMapping(editingMapping.id, {
          source_field: `static_${editingMapping.hubspotProperty}`,
          source_category: "static",
          hubspot_property: editingMapping.hubspotProperty,
          hubspot_property_label: selectedProperty?.label || editingMapping.hubspotProperty,
          transform_type: "direct",
          transform_config: { value: editingMapping.defaultValue },
        });
      } else if (editingMapping.mappingType === "combine") {
        await onUpdateMapping(editingMapping.id, {
          source_field: `template_${editingMapping.hubspotProperty}`,
          source_category: "static",
          hubspot_property: editingMapping.hubspotProperty,
          hubspot_property_label: selectedProperty?.label || editingMapping.hubspotProperty,
          transform_type: "custom",
          transform_config: {
            type: "template",
            fields: editingMapping.templateFields,
            separator: editingMapping.templateSeparator,
          },
        });
      } else {
        await onUpdateMapping(editingMapping.id, {
          source_field: editingMapping.sourceField,
          source_category: editingMapping.sourceCategory,
          hubspot_property: editingMapping.hubspotProperty,
          hubspot_property_label: selectedProperty?.label || editingMapping.hubspotProperty,
          transform_type: editingMapping.transformType,
        });
      }

      setEditingMapping(null);
    } catch (err) {
      setEditingMapping({ ...editingMapping, isSubmitting: false });
    }
  };

  const canSubmitEdit = () => {
    if (!editingMapping || !editingMapping.hubspotProperty) return false;
    if (editingMapping.mappingType === "default") return !!editingMapping.defaultValue;
    if (editingMapping.mappingType === "combine") {
      return editingMapping.templateFields.length > 0 && editingMapping.templateFields.every(f => f.field);
    }
    return !!editingMapping.sourceField;
  };

  const addEditTemplateField = () => {
    if (editingMapping) {
      updateEditingMapping({
        templateFields: [...editingMapping.templateFields, { category: "lead", field: "" }]
      });
    }
  };

  const removeEditTemplateField = (index: number) => {
    if (editingMapping) {
      updateEditingMapping({
        templateFields: editingMapping.templateFields.filter((_, i) => i !== index)
      });
    }
  };

  const updateEditTemplateField = (index: number, category: "lead" | "config" | "derived", field: string) => {
    if (editingMapping) {
      const updated = [...editingMapping.templateFields];
      updated[index] = { category, field };
      updateEditingMapping({ templateFields: updated });
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Mappings */}
      {mappings.length > 0 && (
        <div className="space-y-2">
          {mappings.map((mapping) => {
            const isEditing = editingMapping?.id === mapping.id;
            const isStatic = mapping.source_category === "static";
            const transformConfig = mapping.transform_config as { value?: string; type?: string } | null;
            const isTemplate = transformConfig?.type === "template";
            const staticValue = isStatic && !isTemplate
              ? (transformConfig?.value || "")
              : null;
            const sourceLabel = getSourceFieldLabel(
              mapping.source_category,
              mapping.source_field
            );

            if (isEditing && editingMapping) {
              // Editing UI
              return (
                <div
                  key={mapping.id}
                  className="flex flex-wrap items-start gap-3 p-3 bg-amber-50 border border-amber-300 rounded-lg"
                >
                  {/* Row 1: Mapping Type + HubSpot Property */}
                  <div className="flex items-center gap-3 w-full">
                    {/* Mapping Type */}
                    <Select
                      value={editingMapping.mappingType}
                      onValueChange={(v) =>
                        updateEditingMapping({
                          mappingType: v as "field" | "default" | "combine",
                          sourceField: "",
                          defaultValue: "",
                          templateFields: [],
                        })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="field">Field</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="combine">Combine</SelectItem>
                      </SelectContent>
                    </Select>

                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />

                    {/* HubSpot Property */}
                    <Select
                      value={editingMapping.hubspotProperty}
                      onValueChange={(v) => {
                        updateEditingMapping({ hubspotProperty: v, defaultValue: "" });
                      }}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select HubSpot property..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <div className="px-2 pb-2 sticky top-0 bg-white">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-stone-400" />
                            <Input
                              placeholder="Search..."
                              className="pl-8 h-9"
                              value={propertySearch}
                              onChange={(e) => setPropertySearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        {propertiesLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : (
                          filteredProperties.map((prop) => (
                            <SelectItem key={prop.name} value={prop.name}>
                              <span>{prop.label}</span>
                              {((prop.options && prop.options.length > 0) ||
                                prop.name === "pipeline" ||
                                prop.name === "dealstage") && (
                                <span className="text-stone-400 ml-1 text-xs">
                                  (dropdown)
                                </span>
                              )}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        size="sm"
                        onClick={submitEdit}
                        disabled={editingMapping.isSubmitting || !canSubmitEdit()}
                      >
                        {editingMapping.isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={cancelEditing}
                        disabled={editingMapping.isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Row 2: Source field, Default value, or Combine fields */}
                  {editingMapping.hubspotProperty && (
                    <div className="flex flex-col gap-3 w-full pl-[140px]">
                      {editingMapping.mappingType === "field" && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-stone-500">from</span>
                          <Select
                            value={editingMapping.sourceCategory}
                            onValueChange={(v) =>
                              updateEditingMapping({
                                sourceCategory: v as "lead" | "config" | "derived",
                                sourceField: "",
                              })
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
                            value={editingMapping.sourceField}
                            onValueChange={(v) => updateEditingMapping({ sourceField: v })}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent>
                              {CONFIGURATOR_FIELDS[editingMapping.sourceCategory].map((field) => (
                                <SelectItem key={field.key} value={field.key}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <span className="text-sm text-stone-500">transform</span>
                          <Select
                            value={editingMapping.transformType}
                            onValueChange={(v) =>
                              updateEditingMapping({ transformType: v as TransformType })
                            }
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="direct">Direct</SelectItem>
                              <SelectItem value="boolean">Yes/No</SelectItem>
                              <SelectItem value="array_join">Join</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {editingMapping.mappingType === "default" && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-stone-500">value</span>
                          {hasPropertyOptions(editingMapping.hubspotProperty) ? (
                            <Select
                              value={editingMapping.defaultValue}
                              onValueChange={(v) => updateEditingMapping({ defaultValue: v })}
                            >
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select value..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getPropertyOptions(editingMapping.hubspotProperty).map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="Enter default value..."
                              className="w-64"
                              value={editingMapping.defaultValue}
                              onChange={(e) =>
                                updateEditingMapping({ defaultValue: e.target.value })
                              }
                            />
                          )}
                        </div>
                      )}

                      {editingMapping.mappingType === "combine" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-stone-500">separator</span>
                            <Select
                              value={editingMapping.templateSeparator}
                              onValueChange={(v) => updateEditingMapping({ templateSeparator: v })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value=" ">Space</SelectItem>
                                <SelectItem value=", ">Comma</SelectItem>
                                <SelectItem value=" - ">Dash</SelectItem>
                                <SelectItem value=" | ">Pipe</SelectItem>
                                <SelectItem value="\n">New Line</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addEditTemplateField}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Field
                            </Button>
                          </div>

                          {editingMapping.templateFields.length === 0 && (
                            <p className="text-sm text-stone-400">
                              Click "Add Field" to start combining fields
                            </p>
                          )}

                          {editingMapping.templateFields.map((tf, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Select
                                value={tf.category}
                                onValueChange={(v) =>
                                  updateEditTemplateField(index, v as "lead" | "config" | "derived", "")
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
                                  updateEditTemplateField(index, tf.category, v)
                                }
                              >
                                <SelectTrigger className="w-48">
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
                                className="h-8 w-8"
                                onClick={() => removeEditTemplateField(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}

                          {editingMapping.templateFields.length > 0 && editingMapping.templateFields.every(f => f.field) && (
                            <div className="bg-stone-100 p-2 rounded text-sm">
                              <span className="text-stone-500">Preview: </span>
                              {editingMapping.templateFields
                                .filter((f) => f.field)
                                .map((f) => {
                                  const fieldDef = CONFIGURATOR_FIELDS[f.category].find(
                                    (fd) => fd.key === f.field
                                  );
                                  return `{${fieldDef?.label || f.field}}`;
                                })
                                .join(editingMapping.templateSeparator === "\n" ? " ↵ " : editingMapping.templateSeparator)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Normal display (not editing)
            return (
              <div
                key={mapping.id}
                className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
              >
                {/* Source */}
                <div className="flex-1 min-w-0">
                  {isStatic ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs shrink-0">
                        <Lock className="w-3 h-3 mr-1" />
                        {isTemplate ? "combine" : "default"}
                      </Badge>
                      {!isTemplate && (
                        <span className="text-sm font-medium text-stone-700 truncate">
                          "{staticValue}"
                        </span>
                      )}
                      {isTemplate && (
                        <span className="text-sm font-medium text-stone-700 truncate">
                          (combined fields)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {mapping.source_category}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {sourceLabel}
                      </span>
                    </div>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />

                {/* HubSpot Property */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-green-700 truncate block">
                    {mapping.hubspot_property_label || mapping.hubspot_property}
                  </span>
                </div>

                {/* Transform Badge */}
                {!isStatic && mapping.transform_type !== "direct" && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {mapping.transform_type}
                  </Badge>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={mapping.is_active}
                    onCheckedChange={(checked) =>
                      onToggleActive(mapping.id, checked)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-400 hover:text-stone-600"
                    onClick={() => startEditing(mapping)}
                    disabled={editingMapping !== null}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-400 hover:text-red-600"
                    onClick={() => onDeleteMapping(mapping.id)}
                    disabled={editingMapping !== null}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Mapping Rows */}
      {newRows.map((row) => (
        <div
          key={row.id}
          className="flex flex-wrap items-start gap-3 p-3 bg-stone-50 border border-dashed border-stone-300 rounded-lg"
        >
          {/* Row 1: Mapping Type + HubSpot Property */}
          <div className="flex items-center gap-3 w-full">
            {/* Mapping Type */}
            <Select
              value={row.mappingType}
              onValueChange={(v) =>
                updateNewRow(row.id, {
                  mappingType: v as "field" | "default" | "combine",
                  sourceField: "",
                  defaultValue: "",
                  templateFields: [],
                })
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="field">Field</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="combine">Combine</SelectItem>
              </SelectContent>
            </Select>

            <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />

            {/* HubSpot Property - Always first after mapping type */}
            <Select
              value={row.hubspotProperty}
              onValueChange={(v) => {
                updateNewRow(row.id, { hubspotProperty: v, defaultValue: "" });
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select HubSpot property..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <div className="px-2 pb-2 sticky top-0 bg-white">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-stone-400" />
                    <Input
                      placeholder="Search..."
                      className="pl-8 h-9"
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {propertiesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  filteredProperties.map((prop) => (
                    <SelectItem key={prop.name} value={prop.name}>
                      <span>{prop.label}</span>
                      {((prop.options && prop.options.length > 0) ||
                        prop.name === "pipeline" ||
                        prop.name === "dealstage") && (
                        <span className="text-stone-400 ml-1 text-xs">
                          (dropdown)
                        </span>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Actions - always on the right */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                onClick={() => submitNewRow(row)}
                disabled={row.isSubmitting || !canSubmitRow(row)}
              >
                {row.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeNewRow(row.id)}
                disabled={row.isSubmitting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Row 2: Source field, Default value, or Combine fields (only show when property selected) */}
          {row.hubspotProperty && (
            <div className="flex flex-col gap-3 w-full pl-[140px]">
              {row.mappingType === "field" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-500">from</span>
                  <Select
                    value={row.sourceCategory}
                    onValueChange={(v) =>
                      updateNewRow(row.id, {
                        sourceCategory: v as "lead" | "config" | "derived",
                        sourceField: "",
                      })
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
                    value={row.sourceField}
                    onValueChange={(v) => updateNewRow(row.id, { sourceField: v })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONFIGURATOR_FIELDS[row.sourceCategory].map((field) => (
                        <SelectItem key={field.key} value={field.key}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-sm text-stone-500">transform</span>
                  <Select
                    value={row.transformType}
                    onValueChange={(v) =>
                      updateNewRow(row.id, { transformType: v as TransformType })
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="boolean">Yes/No</SelectItem>
                      <SelectItem value="array_join">Join</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {row.mappingType === "default" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-500">value</span>
                  {hasPropertyOptions(row.hubspotProperty) ? (
                    <Select
                      value={row.defaultValue}
                      onValueChange={(v) => updateNewRow(row.id, { defaultValue: v })}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select value..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getPropertyOptions(row.hubspotProperty).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter default value..."
                      className="w-64"
                      value={row.defaultValue}
                      onChange={(e) =>
                        updateNewRow(row.id, { defaultValue: e.target.value })
                      }
                    />
                  )}
                </div>
              )}

              {row.mappingType === "combine" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-500">separator</span>
                    <Select
                      value={row.templateSeparator}
                      onValueChange={(v) => updateNewRow(row.id, { templateSeparator: v })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Space</SelectItem>
                        <SelectItem value=", ">Comma</SelectItem>
                        <SelectItem value=" - ">Dash</SelectItem>
                        <SelectItem value=" | ">Pipe</SelectItem>
                        <SelectItem value="\n">New Line</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTemplateField(row.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Field
                    </Button>
                  </div>

                  {row.templateFields.length === 0 && (
                    <p className="text-sm text-stone-400">
                      Click "Add Field" to start combining fields
                    </p>
                  )}

                  {row.templateFields.map((tf, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={tf.category}
                        onValueChange={(v) =>
                          updateTemplateField(row.id, index, v as "lead" | "config" | "derived", "")
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
                          updateTemplateField(row.id, index, tf.category, v)
                        }
                      >
                        <SelectTrigger className="w-48">
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
                        className="h-8 w-8"
                        onClick={() => removeTemplateField(row.id, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {row.templateFields.length > 0 && row.templateFields.every(f => f.field) && (
                    <div className="bg-stone-100 p-2 rounded text-sm">
                      <span className="text-stone-500">Preview: </span>
                      {row.templateFields
                        .filter((f) => f.field)
                        .map((f) => {
                          const fieldDef = CONFIGURATOR_FIELDS[f.category].find(
                            (fd) => fd.key === f.field
                          );
                          return `{${fieldDef?.label || f.field}}`;
                        })
                        .join(row.templateSeparator === "\n" ? " ↵ " : row.templateSeparator)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add New Row Button */}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={addNewRow}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Mapping
      </Button>

      {/* Empty State */}
      {mappings.length === 0 && newRows.length === 0 && (
        <div className="text-center py-8 text-stone-500">
          <p>No mappings configured yet</p>
          <p className="text-sm mt-1">
            Click "Add Mapping" to start mapping fields to HubSpot
          </p>
        </div>
      )}
    </div>
  );
}
