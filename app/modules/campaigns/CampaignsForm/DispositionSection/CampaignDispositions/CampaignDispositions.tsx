import React, { useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { useDispositionCatalogs } from "~/queries/dispositionCatalogQueries";
import { useDispositionsStore } from "~/stores/dispositionsStore";
import DispositionCatalogMenu from "./DispositionCatalogMenu";
import DispositionBuilder from "./DispositionBuilder/DispositionBuilder";
import classes from "./CampaignDispositions.module.css";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";

/**
 * CampaignDispositions Component (Simplified Version)
 *
 * Features:
 * - Works directly with DispositionCatalogModel structure
 * - No intermediate conversions or complex hierarchy management
 * - Simple drag-and-drop from catalog to working area
 * - Direct manipulation of the catalog structure that will be saved
 */

type CampaignDispositionsProps = {
  campaignId?: string | number;
  onComplete?: (disposition: DispositionFlowModel) => void;
  initialFlow?: DispositionFlowModel;
};

const CampaignDispositions: React.FC<CampaignDispositionsProps> = ({
  campaignId,
  onComplete,
  initialFlow,
}) => {
  const { data: dispositionCatalogs } = useDispositionCatalogs();
  const { workingCatalog, sourceCatalog, addCategory, addType, addStatus } =
    useDispositionsStore();

  // For now, use the first catalog (can be improved for selection)
  const catalog = dispositionCatalogs?.[0];

  // Memoize safeCatalog to prevent unnecessary re-renders and sort by order
  const safeCatalog = useMemo(() => {
    return catalog
      ? {
          ...catalog,
          categories: (catalog.categories ?? [])
            .map((cat) => ({
              ...cat,
              types: (cat.types ?? [])
                .map((type) => ({
                  ...type,
                  statuses: (type.statuses ?? []).sort(
                    (a, b) => (a.order || 0) - (b.order || 0)
                  ), // Sort statuses by order
                }))
                .sort((a, b) => (a.order || 0) - (b.order || 0)), // Sort types by order
            }))
            .sort((a, b) => (a.order || 0) - (b.order || 0)), // Sort categories by order
        }
      : undefined;
  }, [catalog]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    // Check if dropped in builder area
    const isBuilderDrop = destination.droppableId === "disposition-builder";

    if (isBuilderDrop && safeCatalog) {
      // Parse the draggableId (format: "type-id")
      const [itemType, itemIdStr] = draggableId.split("-");
      const itemId = parseInt(itemIdStr);

      if (!itemType || !itemId) return;

      // Handle different item types
      if (itemType === "category") {
        const category = safeCatalog.categories?.find((c) => c.id === itemId);
        if (category) {
          // Add the category with all its children
          addCategory({
            ...category,
            types:
              category.types?.map((type) => ({
                ...type,
                statuses: type.statuses || [],
              })) || [],
          });
        }
      } else if (itemType === "type") {
        // Find the type in the source catalog
        let foundType = null;
        let parentCategoryId: number | null = null;

        safeCatalog.categories?.forEach((category) => {
          const type = category.types?.find((t) => t.id === itemId);
          if (type) {
            foundType = type;
            parentCategoryId = category.id;
          }
        });

        if (foundType && parentCategoryId) {
          // Check if the parent category exists in working catalog
          const parentExists = workingCatalog?.categories?.find(
            (c) => c.id === parentCategoryId
          );

          if (!parentExists) {
            // Add parent category first
            const parentCategory = safeCatalog.categories?.find(
              (c) => c.id === parentCategoryId
            );
            if (parentCategory) {
              addCategory({
                ...parentCategory,
                types: [],
              });
            }
          }

          // Add the type
          addType(foundType, parentCategoryId);
        }
      } else if (itemType === "status") {
        // Find the status in the source catalog
        let foundStatus = null;
        let parentCategoryId: number | null = null;
        let parentTypeId: number | null = null;

        safeCatalog.categories?.forEach((category) => {
          category.types?.forEach((type) => {
            const status = type.statuses?.find((s) => s.id === itemId);
            if (status) {
              foundStatus = status;
              parentCategoryId = category.id;
              parentTypeId = type.id;
            }
          });
        });

        if (foundStatus && parentCategoryId && parentTypeId) {
          // Check if parent category exists
          const parentCategory = workingCatalog?.categories?.find(
            (c) => c.id === parentCategoryId
          );

          if (!parentCategory) {
            // Add parent category first
            const sourceCat = safeCatalog.categories?.find(
              (c) => c.id === parentCategoryId
            );
            if (sourceCat) {
              addCategory({
                ...sourceCat,
                types: [],
              });
            }
          }

          // Check if parent type exists
          const parentType = workingCatalog?.categories
            ?.find((c) => c.id === parentCategoryId)
            ?.types?.find((t) => t.id === parentTypeId);

          if (!parentType) {
            // Add parent type first
            const sourceType = safeCatalog.categories
              ?.find((c) => c.id === parentCategoryId)
              ?.types?.find((t) => t.id === parentTypeId);
            if (sourceType) {
              addType(
                {
                  ...sourceType,
                  statuses: [],
                },
                parentCategoryId
              );
            }
          }

          // Add the status
          addStatus(foundStatus, parentCategoryId, parentTypeId);
        }
      }
    }
  };

  return (
    <div className={classes.container}>
      {safeCatalog && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={classes.content}>
            <div className={classes.catalogPanel}>
              <DispositionCatalogMenu catalog={safeCatalog} />
            </div>

            <div className={classes.builderPanel}>
              <DispositionBuilder
                campaignId={campaignId}
                onComplete={onComplete}
                initialFlow={initialFlow}
                catalog={safeCatalog}
              />
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default CampaignDispositions;
