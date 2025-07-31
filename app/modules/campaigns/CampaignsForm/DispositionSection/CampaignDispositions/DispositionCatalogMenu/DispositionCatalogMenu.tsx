import React, { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { TextInput, Text, Collapse, UnstyledButton } from "@mantine/core";
import {
  IconSearch,
  IconPlus,
  IconMinus,
  IconGripVertical,
} from "@tabler/icons-react";
import classes from "./DispositionCatalogMenu.module.css";
import { useDispositionsStore } from "~/stores/dispositionsStore";
import type {
  DispositionCatalogModel,
  DispositionCategoryModel,
  DispositionTypeModel,
} from "~/models/DispositionCatalogModels";

export type DispositionCatalogMenuProps = {
  catalog: DispositionCatalogModel;
  onStatusSelect?: (statusId: number, statusName: string) => void;
  onTypeSelect?: (typeId: number, typeName: string) => void;
};

const DispositionCatalogMenu: React.FC<DispositionCatalogMenuProps> = ({
  catalog,
  onStatusSelect,
  onTypeSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize all categories as expanded
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >(() => {
    const initialState: Record<number, boolean> = {};
    catalog?.categories?.forEach((category) => {
      initialState[category.id] = true;
    });
    return initialState;
  });

  // Initialize all types as expanded
  const [expandedTypes, setExpandedTypes] = useState<Record<number, boolean>>(
    () => {
      const initialState: Record<number, boolean> = {};
      catalog?.categories?.forEach((category) => {
        category.types?.forEach((type) => {
          initialState[type.id] = true;
        });
      });
      return initialState;
    }
  );

  // Get working catalog to filter out used items
  const { workingCatalog } = useDispositionsStore();

  // Get used items from working catalog
  const usedItems = React.useMemo(() => {
    const categories: number[] = [];
    const types: number[] = [];
    const statuses: number[] = [];

    workingCatalog?.categories?.forEach((category) => {
      categories.push(category.id);
      category.types?.forEach((type) => {
        types.push(type.id);
        type.statuses?.forEach((status) => {
          statuses.push(status.id);
        });
      });
    });

    return { categories, types, statuses };
  }, [workingCatalog]);

  // Filter out used items from the catalog and sort by order
  const availableCatalog = React.useMemo(() => {
    if (!catalog) return catalog;

    return {
      ...catalog,
      categories:
        catalog.categories
          ?.filter((category) => {
            // Keep category if it's not used OR if it has available children
            if (usedItems.categories.includes(category.id)) {
              // Category is used, but check if it has available children
              const availableTypes = category.types?.filter((type) => {
                if (usedItems.types.includes(type.id)) {
                  // Type is used, but check if it has available statuses
                  const availableStatuses = type.statuses?.filter(
                    (status) => !usedItems.statuses.includes(status.id)
                  );
                  return availableStatuses && availableStatuses.length > 0;
                }
                return true; // Type is not used
              });
              return availableTypes && availableTypes.length > 0;
            }

            // Category is not used, but filter its children anyway
            return true;
          })
          .map((category) => ({
            ...category,
            types: category.types
              ?.filter((type) => {
                if (usedItems.types.includes(type.id)) {
                  // Type is used, but check if it has available statuses
                  const availableStatuses = type.statuses?.filter(
                    (status) => !usedItems.statuses.includes(status.id)
                  );
                  return availableStatuses && availableStatuses.length > 0;
                }
                return true; // Type is not used
              })
              .map((type) => ({
                ...type,
                statuses: type.statuses
                  ?.filter((status) => !usedItems.statuses.includes(status.id))
                  .sort((a, b) => (a.order || 0) - (b.order || 0)), // Sort statuses by order
              }))
              .sort((a, b) => (a.order || 0) - (b.order || 0)), // Sort types by order
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0)) || [], // Sort categories by order
    };
  }, [catalog, usedItems]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleType = (typeId: number) => {
    setExpandedTypes((prev) => ({
      ...prev,
      [typeId]: !prev[typeId],
    }));
  };

  const filteredCatalog = React.useMemo(() => {
    if (!searchTerm.trim()) return availableCatalog;

    const searchLower = searchTerm.toLowerCase();
    return {
      ...availableCatalog,
      categories:
        availableCatalog?.categories?.filter((category) => {
          const categoryMatches = category.name
            .toLowerCase()
            .includes(searchLower);
          const typeMatches = category.types?.some(
            (type) =>
              type.name.toLowerCase().includes(searchLower) ||
              type.statuses?.some((status) =>
                status.name.toLowerCase().includes(searchLower)
              )
          );
          return categoryMatches || typeMatches;
        }) || [],
    };
  }, [availableCatalog, searchTerm]);

  const renderStatus = (
    status: any,
    type: DispositionTypeModel,
    category: DispositionCategoryModel,
    index: number
  ) => {
    // Don't render if status is in use
    if (usedItems.statuses.includes(status.id)) {
      return null;
    }

    return (
      <Draggable
        key={`status-${status.id}`}
        draggableId={`status-${status.id}`}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`${classes.statusItem} ${
              snapshot.isDragging ? classes.dragging : ""
            }`}
          >
            <div className={classes.statusContent}>
              <div {...provided.dragHandleProps} className={classes.dragHandle}>
                <IconGripVertical size={14} />
              </div>
              <Text
                size="sm"
                onClick={() => onStatusSelect?.(status.id, status.name)}
                className={classes.statusText}
              >
                {status.name}
              </Text>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const renderType = (
    type: DispositionTypeModel,
    category: DispositionCategoryModel,
    index: number
  ) => {
    const isTypeUsed = usedItems.types.includes(type.id);
    const hasAvailableStatuses = type.statuses?.some(
      (status) => !usedItems.statuses.includes(status.id)
    );

    // Don't render type if it's used and has no available statuses
    if (isTypeUsed && !hasAvailableStatuses) {
      return null;
    }

    return (
      <div key={type.id} className={classes.typeWrapper}>
        {!isTypeUsed && (
          <Draggable draggableId={`type-${type.id}`} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                className={`${classes.typeItem} ${
                  snapshot.isDragging ? classes.dragging : ""
                }`}
              >
                <div className={classes.typeContent}>
                  <div
                    {...provided.dragHandleProps}
                    className={classes.dragHandle}
                  >
                    <IconGripVertical size={14} />
                  </div>
                  <UnstyledButton
                    onClick={() => toggleType(type.id)}
                    className={classes.typeToggle}
                  >
                    {expandedTypes[type.id] ? (
                      <IconMinus size={16} />
                    ) : (
                      <IconPlus size={16} />
                    )}
                  </UnstyledButton>
                  <Text
                    size="sm"
                    fw={500}
                    onClick={() => onTypeSelect?.(type.id, type.name)}
                    className={classes.typeText}
                  >
                    {type.name}
                    {isTypeUsed && hasAvailableStatuses && (
                      <Text component="span" size="xs" c="dimmed" ml="xs">
                        (partial)
                      </Text>
                    )}
                  </Text>
                </div>
              </div>
            )}
          </Draggable>
        )}

        {isTypeUsed && hasAvailableStatuses && (
          <div className={`${classes.typeItem} ${classes.typeUsed}`}>
            <div className={classes.typeContent}>
              <div className={classes.dragHandle} style={{ opacity: 0.3 }}>
                <IconGripVertical size={14} />
              </div>
              <UnstyledButton
                onClick={() => toggleType(type.id)}
                className={classes.typeToggle}
              >
                {expandedTypes[type.id] ? (
                  <IconMinus size={16} />
                ) : (
                  <IconPlus size={16} />
                )}
              </UnstyledButton>
              <Text size="sm" fw={500} className={classes.typeText} c="dimmed">
                {type.name}
                <Text component="span" size="xs" c="dimmed" ml="xs">
                  (in use)
                </Text>
              </Text>
            </div>
          </div>
        )}

        <Collapse in={expandedTypes[type.id]}>
          <div className={classes.statusesList}>
            {type.statuses
              ?.map((status, statusIndex) =>
                renderStatus(status, type, category, statusIndex)
              )
              .filter(Boolean)}
          </div>
        </Collapse>
      </div>
    );
  };

  const renderCategory = (
    category: DispositionCategoryModel,
    index: number
  ) => {
    const isCategoryUsed = usedItems.categories.includes(category.id);
    const hasAvailableChildren = category.types?.some((type) => {
      const isTypeUsed = usedItems.types.includes(type.id);
      if (!isTypeUsed) return true;
      return type.statuses?.some(
        (status) => !usedItems.statuses.includes(status.id)
      );
    });

    // Don't render category if it's used and has no available children
    if (isCategoryUsed && !hasAvailableChildren) {
      return null;
    }

    return (
      <div key={category.id} className={classes.categoryWrapper}>
        {!isCategoryUsed && (
          <Draggable draggableId={`category-${category.id}`} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                className={`${classes.categoryItem} ${
                  snapshot.isDragging ? classes.dragging : ""
                }`}
              >
                <div className={classes.categoryContent}>
                  <div
                    {...provided.dragHandleProps}
                    className={classes.dragHandle}
                  >
                    <IconGripVertical size={14} />
                  </div>
                  <UnstyledButton
                    onClick={() => toggleCategory(category.id)}
                    className={classes.categoryToggle}
                  >
                    {expandedCategories[category.id] ? (
                      <IconMinus size={16} />
                    ) : (
                      <IconPlus size={16} />
                    )}
                  </UnstyledButton>
                  <Text size="md" fw={600} className={classes.categoryText}>
                    {category.name}
                    {isCategoryUsed && hasAvailableChildren && (
                      <Text component="span" size="xs" c="dimmed" ml="xs">
                        (partial)
                      </Text>
                    )}
                  </Text>
                </div>
              </div>
            )}
          </Draggable>
        )}

        {isCategoryUsed && hasAvailableChildren && (
          <div className={`${classes.categoryItem} ${classes.categoryUsed}`}>
            <div className={classes.categoryContent}>
              <div className={classes.dragHandle} style={{ opacity: 0.3 }}>
                <IconGripVertical size={14} />
              </div>
              <UnstyledButton
                onClick={() => toggleCategory(category.id)}
                className={classes.categoryToggle}
              >
                {expandedCategories[category.id] ? (
                  <IconMinus size={16} />
                ) : (
                  <IconPlus size={16} />
                )}
              </UnstyledButton>
              <Text
                size="md"
                fw={600}
                className={classes.categoryText}
                c="dimmed"
              >
                {category.name}
                <Text component="span" size="xs" c="dimmed" ml="xs">
                  (in use)
                </Text>
              </Text>
            </div>
          </div>
        )}

        <Collapse in={expandedCategories[category.id]}>
          <div className={classes.typesList}>
            {category.types
              ?.map((type, typeIndex) => renderType(type, category, typeIndex))
              .filter(Boolean)}
          </div>
        </Collapse>
      </div>
    );
  };

  return (
    <div className={classes.container}>
      <div className={classes.searchContainer}>
        <TextInput
          placeholder="Search dispositions..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          size="sm"
        />
      </div>

      <Droppable droppableId="catalog-menu" isDropDisabled>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={classes.categoriesList}
          >
            {filteredCatalog?.categories
              ?.map((category, index) => renderCategory(category, index))
              .filter(Boolean)}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DispositionCatalogMenu;
