import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { IconClock } from "@tabler/icons-react";
import type { DispositionNode } from "~/models/DispositionNodeModel";
import { getNodeStyle } from "~/utils/dispositionNodeStyles";
import styles from "./DispositionCatalogMenuItem.module.css";

// Helper to compute all classNames for draggable, icon, and node name
function getMenuItemClasses({
  node,
  hasChildren,
  disabled,
  dragSnapshot,
}: {
  node: DispositionNode;
  hasChildren: boolean;
  disabled: boolean;
  dragSnapshot: {
    isDragging: boolean;
  };
}) {
  // Get base node styling using common utility
  const nodeStyle = getNodeStyle(node, 0);

  // Draggable class
  let draggableClass = styles.draggable;

  // Add node style classes
  if (nodeStyle !== "default") {
    draggableClass += ` ${styles[nodeStyle]}`;
  }

  if (dragSnapshot.isDragging) {
    draggableClass += ` ${styles.dragging}`;
  } else if (disabled) {
    draggableClass += ` ${styles.disabled}`;
  } else {
    draggableClass += ` ${styles.default}`;
  }

  // Only add root styling for consistency with NodeEditor approach
  if (!("parentId" in node) || node.parentId == null) {
    draggableClass += ` ${styles.root}`;
  }

  // Icon class
  let iconClass = styles.icon;
  if (disabled) {
    iconClass += ` ${styles.iconDisabled}`;
  } else if (hasChildren) {
    iconClass += ` ${styles.iconFolder}`;
  } else {
    iconClass += ` ${styles.iconFile}`;
  }

  // Node name class
  let nodeNameClass = styles.nodeName;
  nodeNameClass += hasChildren
    ? ` ${styles.nodeNameFolder}`
    : ` ${styles.nodeNameFile}`;
  if (disabled) {
    nodeNameClass += ` ${styles.nodeNameDisabled}`;
  }

  return { draggableClass, iconClass, nodeNameClass, nodeStyle };
}

interface Props {
  node: DispositionNode;
  path: string;
  movedNodeIds: string[];
  disabled?: boolean;
}

const DispositionCatalogMenuItem: React.FC<Props> = ({
  node,
  path,
  movedNodeIds,
  disabled = false,
}) => {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isMoved = movedNodeIds.includes(String(node.id));

  // Helper function to get status message
  const getStatusMessage = () => {
    if (!disabled) return null;
    if (isMoved && hasChildren) {
      return "Already added";
    } else if (hasChildren) {
      return "Add children first";
    }
    return null;
  };

  return (
    <Draggable
      key={`draggable-${node.id}`}
      draggableId={String(node.id)}
      index={parseInt(path.split("-").pop() || "0", 10)}
      isDragDisabled={disabled}
    >
      {(dragProvided, dragSnapshot) => {
        const { draggableClass, iconClass, nodeNameClass, nodeStyle } =
          getMenuItemClasses({
            node,
            hasChildren,
            disabled,
            dragSnapshot,
          });
        return (
          <li
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            className={styles.listItem}
            style={dragProvided.draggableProps.style}
          >
            <div {...dragProvided.dragHandleProps} className={draggableClass}>
              {/* Status indicator dot */}
              <div
                className={`${styles.statusDot} ${styles[`${nodeStyle}Dot`]}`}
              />

              {/* Icon */}
              <span className={iconClass}>{hasChildren ? "📁" : "📄"}</span>

              {/* Node name */}
              <span className={nodeNameClass}>{node.name}</span>

              {/* Clock icon for nodes that require reschedule */}
              {node?.requiresReschedule && (
                <IconClock size={16} color="var(--mantine-color-gray-6)" />
              )}

              {/* Status indicator */}
              {(() => {
                const statusMessage = getStatusMessage();
                return (
                  statusMessage && (
                    <span className={styles.status}>{statusMessage}</span>
                  )
                );
              })()}
            </div>
          </li>
        );
      }}
    </Draggable>
  );
};

export default DispositionCatalogMenuItem;
