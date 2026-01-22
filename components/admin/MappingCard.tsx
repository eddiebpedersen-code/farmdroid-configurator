"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2, Lock } from "lucide-react";
import type { HubSpotFieldMappingRow } from "@/lib/admin/types";
import { CONFIGURATOR_FIELDS } from "@/lib/admin/types";

interface MappingCardProps {
  mapping: HubSpotFieldMappingRow;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MappingCard({
  mapping,
  onToggleActive,
  onDelete,
}: MappingCardProps) {
  const isStatic = mapping.source_category === "static";
  const staticValue = isStatic
    ? (mapping.transform_config as { value?: string } | null)?.value || ""
    : null;

  const sourceField = !isStatic
    ? CONFIGURATOR_FIELDS[mapping.source_category as "lead" | "config" | "derived"]?.find(
        (f) => f.key === mapping.source_field
      )
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Source field or static value */}
            <div className="min-w-0 flex-1">
              {isStatic ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs shrink-0">
                    <Lock className="w-3 h-3 mr-1" />
                    default
                  </Badge>
                  <span className="font-medium text-stone-700 truncate">
                    "{staticValue}"
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {mapping.source_category}
                    </Badge>
                    <span className="font-medium truncate">
                      {sourceField?.label || mapping.source_field}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {mapping.source_field}
                  </p>
                </>
              )}
            </div>

            {/* Arrow */}
            <ArrowRight className="w-5 h-5 text-stone-400 shrink-0" />

            {/* HubSpot property */}
            <div className="min-w-0 flex-1">
              <span className="font-medium text-green-700 truncate block">
                {mapping.hubspot_property_label || mapping.hubspot_property}
              </span>
              <p className="text-xs text-stone-500 mt-1">
                {mapping.hubspot_property}
              </p>
            </div>

            {/* Transform badge (only for non-static, non-direct) */}
            {!isStatic && mapping.transform_type !== "direct" && (
              <Badge variant="secondary" className="shrink-0">
                {mapping.transform_type}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-4">
            <Switch
              checked={mapping.is_active}
              onCheckedChange={(checked) => onToggleActive(mapping.id, checked)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-stone-400 hover:text-red-600"
              onClick={() => onDelete(mapping.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
