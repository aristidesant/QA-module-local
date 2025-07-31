import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { Text, UnstyledButton } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import classes from "./DraggableDispositionItem.module.css";
import type { DispositionItem } from "~/stores/dispositionsStore";

interface DraggableDispositionItemProps {
  item: DispositionItem;
  index: number;
  isDragDisabled?: boolean;
  onItemClick?: (item: DispositionItem) => void;
}

const DraggableDispositionItem: React.FC<DraggableDispositionItemProps> = ({
  item,
  index,
  isDragDisabled = false,
  onItemClick,
}) => {
  const getItemTypeColor = (type: string) => {
    switch (type) {
      case "category":
        return "var(--mantine-color-blue-6)";
      case "type":
        return "var(--mantine-color-orange-6)";
      case "status":
        return "var(--mantine-color-green-6)";
      default:
        return "var(--mantine-color-gray-6)";
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "category":
        return "●";
      case "type":
        return "—";
      case "status":
        return "▪";
      default:
        return "•";
    }
  };

  return (
    <Draggable
      draggableId={item.id}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`${classes.draggableItem} ${
            snapshot.isDragging ? classes.dragging : ""
          }`}
        >
          <UnstyledButton
            className={classes.itemButton}
            onClick={() => onItemClick?.(item)}
          >
            <div className={classes.itemContent}>
              <div {...provided.dragHandleProps} className={classes.dragHandle}>
                <IconGripVertical size={14} />
              </div>

              <div className={classes.itemInfo}>
                <span
                  className={classes.typeIndicator}
                  style={{ color: getItemTypeColor(item.type) }}
                >
                  {getItemTypeIcon(item.type)}
                </span>
                <Text className={classes.itemName} size="sm">
                  {item.name}
                </Text>
              </div>

              <div className={classes.itemMeta}>
                <Text className={classes.itemType} size="xs">
                  {item.type}
                </Text>
                {item.isFinal && (
                  <span className={classes.finalBadge}>Final</span>
                )}
                {item.isInvalidatesNumber && (
                  <span className={classes.invalidatesBadge}>Invalidates</span>
                )}
              </div>
            </div>
          </UnstyledButton>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableDispositionItem;
