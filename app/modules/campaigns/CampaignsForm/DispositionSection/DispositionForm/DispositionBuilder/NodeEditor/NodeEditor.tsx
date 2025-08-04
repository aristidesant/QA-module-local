import React from "react";
import {
  Box,
  Group,
  ActionIcon,
  Stack,
  Title,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconTrash, IconClock } from "@tabler/icons-react";
import type { DispositionNode } from "~/models/DispositionNodeModel";
import { getNodeStyle, isLeafNode } from "~/utils/dispositionNodeStyles";
import styles from "./NodeEditor.module.css";

interface NodeEditorProps {
  node: DispositionNode;
  parentNode?: DispositionNode;
  idx: number;
  setBuilderNodes: (nodes: DispositionNode[]) => void;
  builderNodes: DispositionNode[];
  removeNode: (id: number) => void;
  level?: number;
  onNodeSelect?: (
    node: DispositionNode,
    parentNode: DispositionNode | undefined
  ) => void;
  selectedNodeId?: number;
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  parentNode,
  idx,
  setBuilderNodes,
  builderNodes,
  removeNode,
  level = 0,
  onNodeSelect,
  selectedNodeId,
}) => {
  const handleRemove = () => {
    removeNode(node.id);
  };

  const isLeaf = isLeafNode(node);
  const isSelected = selectedNodeId === node.id;
  const isClickable = isLeaf && onNodeSelect;

  const handleNodeClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();

    // Only handle click if it's a leaf node and onNodeSelect is provided
    if (isClickable) {
      onNodeSelect(node, parentNode);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    // Prevent the node selection when clicking on action buttons
    e.stopPropagation();
  };

  // Use common utility functions
  const nodeStyle = getNodeStyle(node, level);
  const hasChildren = !isLeaf;

  return (
    <>
      <Box
        key={node.id}
        className={`${styles.nodeEditor} ${styles[nodeStyle]} ${
          isSelected ? styles.selected : ""
        } ${isClickable ? styles.clickable : ""} ${
          hasChildren ? styles.parentNode : styles.leafNode
        }`}
        style={{
          marginLeft: level > 0 ? `${level * 16 + 8}px` : "0px",
          width: level > 0 ? `calc(100% - ${level * 16 + 8}px)` : "100%",
          position: "relative",
        }}
        onClick={handleNodeClick}
      >
        {/* Connection line for child nodes */}
        {level > 0 && (
          <>
            <div className={styles.connectionLine} />
            <div className={styles.connectionDot} />
          </>
        )}

        {/* Status indicator dot */}
        <div className={`${styles.statusDot} ${styles[`${nodeStyle}Dot`]}`} />

        <Group justify="space-between" style={{ flex: 1 }}>
          <Box style={{ flex: 1 }}>
            <Text
              size={level === 0 ? "md" : "sm"}
              fw={level === 0 ? 600 : 500}
              className={styles.nodeText}
            >
              {node.name}
            </Text>
          </Box>

          {/* Clock icon for certain nodes */}
          {node?.requiresReschedule && (
            <Tooltip withArrow label="Requires reschedule">
              <IconClock size={16} color="var(--mantine-color-gray-6)" />
            </Tooltip>
          )}

          <ActionIcon
            onClick={(e) => {
              handleActionClick(e);
              handleRemove();
            }}
            color="red"
            size="sm"
            variant="subtle"
            className={styles.deleteButton}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Render children with increased indentation */}
      {node.children &&
        node.children.length > 0 &&
        node.children.map((child, cidx) => (
          <NodeEditor
            key={child.id}
            node={child}
            parentNode={node}
            idx={cidx}
            setBuilderNodes={setBuilderNodes}
            builderNodes={builderNodes}
            removeNode={removeNode}
            level={level + 1}
            onNodeSelect={onNodeSelect}
            selectedNodeId={selectedNodeId}
          />
        ))}
    </>
  );
};

export default NodeEditor;
