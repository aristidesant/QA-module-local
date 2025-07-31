import React, { useEffect, useRef } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { notifications } from "@mantine/notifications";

import {
  Text,
  Button,
  Textarea,
  Switch,
  ActionIcon,
  Stack,
  Group,
} from "@mantine/core";
import {
  IconPlus,
  IconCode,
  IconFileImport,
  IconChevronDown,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import classes from "./DispositionBuilder.module.css";
import {
  useDispositionsStore,
  type DispositionCatalogModel,
  type DispositionCategoryModel,
  type DispositionTypeModel,
  type DispositionStatusModel,
} from "~/stores/dispositionsStore";
import {
  useCreateDispositionFlow,
  useUpdateDispositionFlow,
} from "~/queries/dispositionFlowQueries";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";

interface DispositionBuilderProps {
  campaignId?: string | number;
  onComplete?: (disposition: DispositionFlowModel) => void;
  initialFlow?: DispositionFlowModel;
  catalog?: DispositionCatalogModel;
}

const DispositionBuilder: React.FC<DispositionBuilderProps> = ({
  campaignId,
  onComplete,
  initialFlow,
  catalog,
}) => {
  const {
    workingCatalog,
    selectedItem,
    setSourceCatalog,
    initializeWorkingCatalog,
    addCategory,
    addType,
    addStatus,
    removeCategory,
    removeType,
    removeStatus,
    updateCategory,
    updateType,
    updateStatus,
    setSelectedCategory,
    setSelectedType,
    setSelectedStatus,
    clearSelection,
    clearWorkingCatalog,
    restoreFromDispositionFlow,
    getDispositionFlowModel,
  } = useDispositionsStore();

  // Track the last restored flow ID to prevent unnecessary restorations
  const lastRestoredFlowId = useRef<number | null>(null);

  const createDispositionFlowMutation = useCreateDispositionFlow();
  const updateDispositionFlowMutation = useUpdateDispositionFlow();

  // Determine if we're updating an existing flow
  const isUpdating = initialFlow && initialFlow.id && initialFlow.id > 0;

  // Set the source catalog when component mounts or catalog changes
  useEffect(() => {
    if (catalog) {
      setSourceCatalog(catalog);
      if (!workingCatalog && !initialFlow) {
        initializeWorkingCatalog(catalog);
      }
    }
  }, [
    catalog,
    setSourceCatalog,
    initializeWorkingCatalog,
    workingCatalog,
    initialFlow,
  ]);

  // Restore from initial flow when component mounts or when a different flow is provided
  useEffect(() => {
    if (initialFlow && initialFlow.id !== lastRestoredFlowId.current) {
      try {
        console.log("Attempting to restore from initial flow:", {
          flowId: initialFlow.id,
          lastRestoredId: lastRestoredFlowId.current,
          campaignId: initialFlow.campaignId,
        });

        // Restore from the initial flow
        restoreFromDispositionFlow(initialFlow);

        // Update the ref to track this restoration
        lastRestoredFlowId.current = initialFlow.id;
      } catch (error) {
        console.error("Error restoring from initial flow:", error);
        notifications.show({
          title: "Error",
          message: `Failed to restore initial configuration: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          color: "red",
        });
      }
    } else if (!initialFlow && lastRestoredFlowId.current !== null) {
      // If initialFlow becomes null, clear the working catalog and reset the ref
      clearWorkingCatalog();
      lastRestoredFlowId.current = null;
    }
  }, [initialFlow?.id, initialFlow?.campaignId]);

  const handleCategoryClick = (category: DispositionCategoryModel) => {
    setSelectedCategory(category);
  };

  const handleTypeClick = (type: DispositionTypeModel, categoryId: number) => {
    setSelectedType(type, categoryId);
  };

  const handleStatusClick = (
    status: DispositionStatusModel,
    categoryId: number,
    typeId: number
  ) => {
    setSelectedStatus(status, categoryId, typeId);
  };

  const handleRemoveCategory = (
    categoryId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    removeCategory(categoryId);
  };

  const handleRemoveType = (
    categoryId: number,
    typeId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    removeType(categoryId, typeId);
  };

  const handleRemoveStatus = (
    categoryId: number,
    typeId: number,
    statusId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    removeStatus(categoryId, typeId, statusId);
  };

  const handleUpdateItem = (field: string, value: any) => {
    if (!selectedItem) return;

    if (selectedItem.type === "category") {
      updateCategory(selectedItem.item.id, { [field]: value });
    } else if (selectedItem.type === "type" && selectedItem.categoryId) {
      updateType(selectedItem.categoryId, selectedItem.item.id, {
        [field]: value,
      });
    } else if (
      selectedItem.type === "status" &&
      selectedItem.categoryId &&
      selectedItem.typeId
    ) {
      updateStatus(
        selectedItem.categoryId,
        selectedItem.typeId,
        selectedItem.item.id,
        { [field]: value }
      );
    }
  };

  const exportJSON = () => {
    try {
      const dispositionFlow = getDispositionFlowModel();
      const blob = new Blob([JSON.stringify(dispositionFlow, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign-${campaignId}-dispositions.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting disposition flow:", error);
      notifications.show({
        title: "Error",
        message: "Failed to export disposition configuration",
        color: "red",
      });
    }
  };

  const importJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonContent = e.target?.result as string;
            const dispositionFlow = JSON.parse(
              jsonContent
            ) as DispositionFlowModel;
            restoreFromDispositionFlow(dispositionFlow);
            notifications.show({
              title: "Success",
              message: "Disposition configuration imported successfully",
              color: "green",
            });
          } catch (error) {
            console.error("Error importing JSON:", error);
            notifications.show({
              title: "Error",
              message: "Failed to import disposition configuration",
              color: "red",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const saveDisposition = async () => {
    if (!campaignId) {
      notifications.show({
        title: "Error",
        message: "Campaign ID is required to save disposition configuration",
        color: "red",
      });
      return;
    }

    try {
      const dispositionFlow = getDispositionFlowModel();
      console.log("Saving disposition flow:", dispositionFlow);

      let savedFlow: DispositionFlowModel;

      if (isUpdating && initialFlow?.id) {
        // Update existing disposition flow
        const updateData = {
          campaignId:
            typeof campaignId === "string" ? parseInt(campaignId) : campaignId,
          flowJson: dispositionFlow.flowJson,
          clientId: initialFlow.clientId,
          userId: initialFlow.userId,
        };

        savedFlow = await updateDispositionFlowMutation.mutateAsync({
          id: initialFlow.id,
          data: updateData,
        });
      } else {
        // Create new disposition flow
        const createData = {
          campaignId:
            typeof campaignId === "string" ? parseInt(campaignId) : campaignId,
          flowJson: dispositionFlow.flowJson,
        };

        savedFlow = await createDispositionFlowMutation.mutateAsync(createData);
      }

      notifications.show({
        title: "Success",
        message: `Disposition configuration ${
          isUpdating ? "updated" : "created"
        } successfully`,
        color: "green",
      });

      // Call the onComplete callback if provided with the saved flow
      if (onComplete) {
        onComplete(savedFlow);
      }
    } catch (error) {
      console.error("Error saving disposition:", error);
      notifications.show({
        title: "Error",
        message: `Failed to ${
          isUpdating ? "update" : "save"
        } disposition configuration`,
        color: "red",
      });
    }
  };

  const renderStatusItem = (
    status: DispositionStatusModel,
    categoryId: number,
    typeId: number
  ) => (
    <div
      key={status.id}
      className={`${classes.statusItem} ${
        selectedItem?.type === "status" && selectedItem.item.id === status.id
          ? classes.selected
          : ""
      }`}
      onClick={() => handleStatusClick(status, categoryId, typeId)}
    >
      <Group justify="space-between">
        <div>
          <Text size="sm" fw={500}>
            {status.name}
          </Text>
          {status.description && (
            <Text size="xs" c="dimmed">
              {status.description}
            </Text>
          )}
        </div>
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={(e) => handleRemoveStatus(categoryId, typeId, status.id, e)}
        >
          <IconTrash size={12} />
        </ActionIcon>
      </Group>
    </div>
  );

  const renderTypeItem = (type: DispositionTypeModel, categoryId: number) => (
    <div key={type.id} className={classes.typeItem}>
      <div
        className={`${classes.typeHeader} ${
          selectedItem?.type === "type" && selectedItem.item.id === type.id
            ? classes.selected
            : ""
        }`}
        onClick={() => handleTypeClick(type, categoryId)}
      >
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={500}>
              {type.name}
            </Text>
            {type.description && (
              <Text size="xs" c="dimmed">
                {type.description}
              </Text>
            )}
          </div>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={(e) => handleRemoveType(categoryId, type.id, e)}
          >
            <IconTrash size={12} />
          </ActionIcon>
        </Group>
      </div>
      {type.statuses && type.statuses.length > 0 && (
        <div className={classes.statusList}>
          {type.statuses.map((status) =>
            renderStatusItem(status, categoryId, type.id)
          )}
        </div>
      )}
    </div>
  );

  const renderCategoryItem = (category: DispositionCategoryModel) => (
    <div key={category.id} className={classes.categoryItem}>
      <div
        className={`${classes.categoryHeader} ${
          selectedItem?.type === "category" &&
          selectedItem.item.id === category.id
            ? classes.selected
            : ""
        }`}
        onClick={() => handleCategoryClick(category)}
      >
        <Group justify="space-between">
          <div>
            <Text size="md" fw={600}>
              {category.name}
            </Text>
            {category.description && (
              <Text size="sm" c="dimmed">
                {category.description}
              </Text>
            )}
          </div>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={(e) => handleRemoveCategory(category.id, e)}
          >
            <IconTrash size={12} />
          </ActionIcon>
        </Group>
      </div>
      {category.types && category.types.length > 0 && (
        <div className={classes.typeList}>
          {category.types.map((type) => renderTypeItem(type, category.id))}
        </div>
      )}
    </div>
  );

  return (
    <div className={classes.builderContainer}>
      <div className={classes.builderHeader}>
        <div className={classes.headerTitle}>
          <div className={classes.dispositionListHeader}>
            <Text size="sm" c="dimmed" className={classes.dispositionListLabel}>
              Disposition list
            </Text>
            <div className={classes.campaignTitle}>
              <Text size="lg" fw={600}>
                Campañas de localización
              </Text>
              <ActionIcon variant="subtle" size="sm">
                <IconChevronDown size={16} />
              </ActionIcon>
            </div>
          </div>
        </div>
      </div>

      <div className={classes.flexContent}>
        <div className={classes.builderContent}>
          <Droppable droppableId="disposition-builder">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={classes.dropZone}
              >
                {!workingCatalog?.categories?.length ? (
                  <div
                    className={`${classes.emptyState} ${
                      snapshot.isDraggingOver ? classes.emptyStateActive : ""
                    }`}
                  >
                    <IconPlus size={48} color="var(--mantine-color-gray-4)" />
                    <Text size="lg" c="dimmed" mt="md">
                      Drop disposition items here
                    </Text>
                    <Text size="sm" c="dimmed">
                      Drag categories, types, or statuses from the left panel to
                      build your structure
                    </Text>
                  </div>
                ) : (
                  <Stack gap="md">
                    {workingCatalog.categories.map((category) =>
                      renderCategoryItem(category)
                    )}
                  </Stack>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {selectedItem && (
          <div className={classes.propertiesPanel}>
            <div className={classes.propertiesHeader}>
              <Text size="md" fw={600}>
                Properties
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase">
                {selectedItem.type}
              </Text>
            </div>

            <div className={classes.propertiesContent}>
              <Textarea
                label="Name"
                value={selectedItem.item.name}
                onChange={(e) =>
                  handleUpdateItem("name", e.currentTarget.value)
                }
                rows={2}
              />

              <Textarea
                label="Description"
                value={selectedItem.item.description || ""}
                onChange={(e) =>
                  handleUpdateItem("description", e.currentTarget.value)
                }
                rows={3}
                placeholder="Enter description..."
              />

              {selectedItem.type === "status" && (
                <>
                  <Switch
                    label="Final disposition"
                    description="Marks this as a final call outcome"
                    checked={
                      (selectedItem.item as DispositionStatusModel).isFinal ||
                      false
                    }
                    onChange={(e) =>
                      handleUpdateItem("isFinal", e.currentTarget.checked)
                    }
                  />

                  <Switch
                    label="Invalidates number"
                    description="Marks the phone number as invalid"
                    checked={
                      (selectedItem.item as DispositionStatusModel)
                        .isInvalidatesNumber || false
                    }
                    onChange={(e) =>
                      handleUpdateItem(
                        "isInvalidatesNumber",
                        e.currentTarget.checked
                      )
                    }
                  />

                  <Switch
                    label="Requires reschedule"
                    description="Indicates this status requires rescheduling"
                    checked={
                      (selectedItem.item as DispositionStatusModel)
                        .requiresReschedule || false
                    }
                    onChange={(e) =>
                      handleUpdateItem(
                        "requiresReschedule",
                        e.currentTarget.checked
                      )
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons moved to the bottom */}
      <div className={classes.actionButtons}>
        <Button
          variant="filled"
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={saveDisposition}
          disabled={!workingCatalog?.categories?.length}
          loading={
            createDispositionFlowMutation.isPending ||
            updateDispositionFlowMutation.isPending
          }
          color="blue"
        >
          {isUpdating ? "Update Disposition" : "Save Disposition"}
        </Button>
      </div>
    </div>
  );
};

export default DispositionBuilder;
