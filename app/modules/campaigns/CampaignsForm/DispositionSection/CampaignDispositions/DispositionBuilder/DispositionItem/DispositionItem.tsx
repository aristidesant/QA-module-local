import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Text, UnstyledButton, ActionIcon } from "@mantine/core";
import { IconTrash, IconClock } from "@tabler/icons-react";
import classes from "./DispositionItem.module.css";
import type {
  DispositionStructure,
  DispositionItem as DispositionItemType,
} from "~/stores/dispositionsStore";

interface DispositionItemProps {
  structure: DispositionStructure;
  index: number;
  isLast?: boolean;
  parentLines?: boolean[];
  parentId?: string;
  selectedItem: DispositionItemType | null;
  onItemClick: (
    item: DispositionItemType,
    structure: DispositionStructure
  ) => void;
  onRemoveItem: (id: string, event: React.MouseEvent, itemType: string) => void;
  isItemClickeable: (
    item: DispositionItemType,
    structure: DispositionStructure
  ) => boolean;
}

const DispositionItem: React.FC<DispositionItemProps> = ({
  structure,
  index,
  isLast = false,
  parentLines = [],
  parentId,
  selectedItem,
  onItemClick,
  onRemoveItem,
  isItemClickeable,
}) => {
  const isSelected = selectedItem?.id === structure.item.id;

  const getTypeIndicator = (type: string, level: number, itemName?: string) => {
    if (level === 0) {
      // Top level categories with specific colors based on the image
      if (itemName === "Effective Contact") {
        return { symbol: "●", color: "var(--mantine-color-green-6)" };
      } else if (itemName === "No Effective Contact") {
        return { symbol: "●", color: "var(--mantine-color-orange-6)" };
      } else if (itemName === "No Contact") {
        return { symbol: "●", color: "var(--mantine-color-red-6)" };
      }
      return { symbol: "●", color: "var(--mantine-color-blue-6)" };
    } else if (level === 1) {
      // Second level types
      return { symbol: "—", color: "var(--mantine-color-gray-7)" };
    } else {
      // Third level statuses
      return { symbol: "▪", color: "var(--mantine-color-gray-7)" };
    }
  };

  const indicator = getTypeIndicator(
    structure.item.type,
    structure.level,
    structure.item.name
  );

  const isClickeable = isItemClickeable(structure.item, structure);

  const dropZoneId = parentId ? `${parentId}-child-${index}` : `root-${index}`;

  return (
    <React.Fragment key={structure.id}>
      {/* Drop zone before this item */}
      <Droppable droppableId={`before-${dropZoneId}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${classes.dropZoneBetween} ${
              snapshot.isDraggingOver ? classes.dropZoneBetweenActive : ""
            }`}
            style={{
              marginLeft: `${structure.level * 20}px`,
            }}
          >
            {snapshot.isDraggingOver && (
              <div className={classes.dropIndicator}>
                <Text size="xs" c="blue">
                  Drop here
                </Text>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className={classes.dispositionItem}>
        <div className={classes.itemWrapper}>
          <UnstyledButton
            className={`${classes.itemButton} ${
              isSelected ? classes.selected : ""
            } ${!isClickeable ? classes.nonClickeable : ""}`}
            onClick={() =>
              isClickeable && onItemClick(structure.item, structure)
            }
            disabled={!isClickeable}
          >
            <div className={classes.itemContent}>
              {/* Tree structure lines */}
              <div className={classes.treeLines}>
                {parentLines.map((hasLine, idx) => (
                  <div
                    key={idx}
                    className={`${classes.treeLine} ${
                      hasLine ? classes.treeLineVisible : ""
                    }`}
                  />
                ))}
                {structure.level > 0 && (
                  <div
                    className={`${classes.treeBranch} ${
                      isLast ? classes.treeBranchLast : ""
                    }`}
                  />
                )}
              </div>

              <div className={classes.itemInfo}>
                <span
                  className={classes.typeIndicator}
                  style={{ color: indicator.color }}
                >
                  {indicator.symbol}
                </span>
                <Text className={classes.itemName} size="sm">
                  {structure.item.name}
                </Text>

                {/* Show clock icon for "No Contact" statuses */}
                {structure.item.type === "status" &&
                  structure.item.parentCategory?.name === "No Contact" && (
                    <IconClock size={14} className={classes.clockIcon} />
                  )}
              </div>
            </div>
          </UnstyledButton>

          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveItem(structure.id, e, structure.item.type);
            }}
            className={classes.removeButton}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </div>

        {structure.children.length > 0 && (
          <div className={classes.children}>
            {structure.children.map((child, childIndex) => {
              const isChildLast = childIndex === structure.children.length - 1;
              const newParentLines = [
                ...parentLines,
                structure.level === 0 || !isLast,
              ];
              return (
                <DispositionItem
                  key={child.id}
                  structure={child}
                  index={childIndex}
                  isLast={isChildLast}
                  parentLines={newParentLines}
                  parentId={structure.id}
                  selectedItem={selectedItem}
                  onItemClick={onItemClick}
                  onRemoveItem={onRemoveItem}
                  isItemClickeable={isItemClickeable}
                />
              );
            })}

            {/* Drop zone at the end of children */}
            <Droppable droppableId={`${structure.id}-children-end`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${classes.dropZoneBetween} ${
                    snapshot.isDraggingOver ? classes.dropZoneBetweenActive : ""
                  }`}
                  style={{
                    marginLeft: `${(structure.level + 1) * 20}px`,
                  }}
                >
                  {snapshot.isDraggingOver && (
                    <div className={classes.dropIndicator}>
                      <Text size="xs" c="blue">
                        Drop here
                      </Text>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default DispositionItem;
