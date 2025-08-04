import React from "react";
import { Card, Text, Box, Group, Tooltip } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import styles from "./DispositionViewer.module.css";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";
import type { DispositionNode } from "~/models/DispositionNodeModel";
import { getNodeStyle, isLeafNode } from "~/utils/dispositionNodeStyles";
import { useCampaignsStore } from "~/stores/campaignsStore";
import NodeDetailPanel from "~/modules/campaigns/CampaignsForm/DispositionSection/NodeDetailPanel";

interface DispositionViewerProps {
  flow: DispositionFlowModel;
}

interface NodeViewerProps {
  node: DispositionNode;
  parentNode?: DispositionNode;
  level?: number;
}

const NodeViewer: React.FC<NodeViewerProps> = ({
  node,
  parentNode,
  level = 0,
}) => {
  const { setRightComponent } = useCampaignsStore();
  const isLeaf = isLeafNode(node);
  const nodeStyle = getNodeStyle(node, level);
  const hasChildren = !isLeaf;
  const isClickable = isLeaf;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isClickable) {
      setRightComponent(
        <NodeDetailPanel node={node} parentNode={parentNode} />
      );
    }
  };

  return (
    <>
      <Box
        key={node.id}
        className={`${styles.nodeViewer} ${styles[nodeStyle]} ${
          isClickable ? styles.clickable : ""
        } ${hasChildren ? styles.parentNode : styles.leafNode}`}
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
        </Group>
      </Box>

      {/* Render children with increased indentation */}
      {node.children &&
        node.children.length > 0 &&
        node.children.map((child) => (
          <NodeViewer
            key={child.id}
            node={child}
            parentNode={node}
            level={level + 1}
          />
        ))}
    </>
  );
};

const DispositionViewer: React.FC<DispositionViewerProps> = ({ flow }) => {
  const nodes = flow?.flowJson?.dispositionNodes ?? [];

  if (!nodes || nodes.length === 0) {
    return <Text>No disposition nodes found.</Text>;
  }

  return (
    <Card className={styles.viewer} withBorder>
      <Text className={styles.title}>
        Disposition Flow: {flow.flowJson.name}
      </Text>
      <Box className={styles.nodesContainer}>
        {nodes.map((node) => (
          <NodeViewer key={node.id} node={node} />
        ))}
      </Box>
    </Card>
  );
};

export default DispositionViewer;
