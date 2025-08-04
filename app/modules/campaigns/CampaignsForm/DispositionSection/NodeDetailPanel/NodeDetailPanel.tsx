import React from "react";
import {
  Box,
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Divider,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconX,
  IconClock,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { DispositionNode } from "~/models/DispositionNodeModel";
import { getNodeStyle, isLeafNode } from "~/utils/dispositionNodeStyles";
import { useCampaignsStore } from "~/stores/campaignsStore";
import styles from "./NodeDetailPanel.module.css";

interface NodeDetailPanelProps {
  node: DispositionNode;
  parentNode?: DispositionNode;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  parentNode,
}) => {
  const { setRightComponent } = useCampaignsStore();
  const isLeaf = isLeafNode(node);
  const nodeStyle = getNodeStyle(node, parentNode ? 1 : 0);

  const handleClose = () => {
    setRightComponent(null);
  };

  const getNodeTypeInfo = (style: string) => {
    switch (style) {
      case "effective":
        return {
          label: "Effective Contact",
          color: "green",
          icon: <IconCheck size={14} />,
          description: "This node represents a successful contact outcome.",
        };
      case "noEffective":
        return {
          label: "No Effective Contact",
          color: "orange",
          icon: <IconAlertTriangle size={14} />,
          description: "This node represents an unsuccessful contact attempt.",
        };
      case "noContact":
        return {
          label: "No Contact",
          color: "red",
          icon: <IconAlertTriangle size={14} />,
          description: "This node represents no contact made.",
        };
      default:
        return {
          label: "Default",
          color: "gray",
          icon: null,
          description: "This is a standard disposition node.",
        };
    }
  };

  const nodeTypeInfo = getNodeTypeInfo(nodeStyle);

  return (
    <Card className={styles.panel} withBorder shadow="sm">
      {/* Header */}
      <Group justify="space-between" className={styles.header}>
        <Text size="lg" fw={600} className={styles.title}>
          Node Details
        </Text>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleClose}
          size="sm"
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>

      <Divider mb="md" />

      {/* Main Content */}
      <Stack gap="md">
        {/* Node Name */}
        <Box>
          <Text size="sm" c="dimmed" mb={4}>
            Node Name
          </Text>
          <Text size="md" fw={500} className={styles.nodeName}>
            {node.name}
          </Text>
        </Box>

        {/* Node Type */}
        <Box>
          <Text size="sm" c="dimmed" mb={8}>
            Node Type
          </Text>
          <Badge
            variant="light"
            color={nodeTypeInfo.color}
            size="md"
            leftSection={nodeTypeInfo.icon}
            className={styles.typeBadge}
          >
            {nodeTypeInfo.label}
          </Badge>
          <Text size="sm" c="dimmed" mt={8}>
            {nodeTypeInfo.description}
          </Text>
        </Box>

        {/* Node Status */}
        <Box>
          <Text size="sm" c="dimmed" mb={8}>
            Status
          </Text>
          <Group gap="xs">
            <Badge variant="outline" color={isLeaf ? "blue" : "gray"} size="sm">
              {isLeaf ? "Leaf Node" : "Parent Node"}
            </Badge>
            {node.requiresReschedule && (
              <Badge
                variant="light"
                color="orange"
                size="sm"
                leftSection={<IconClock size={12} />}
              >
                Requires Reschedule
              </Badge>
            )}
          </Group>
        </Box>

        {/* Node ID */}
        <Box>
          <Text size="sm" c="dimmed" mb={4}>
            Node ID
          </Text>
          <Text size="sm" ff="monospace" className={styles.nodeId}>
            {node.id}
          </Text>
        </Box>

        {/* Parent Information */}
        {parentNode && (
          <Box>
            <Text size="sm" c="dimmed" mb={4}>
              Parent Node
            </Text>
            <Card className={styles.parentCard} withBorder>
              <Text size="sm" fw={500}>
                {parentNode.name}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                ID: {parentNode.id}
              </Text>
            </Card>
          </Box>
        )}

        {/* Children Information */}
        {node.children && node.children.length > 0 && (
          <Box>
            <Text size="sm" c="dimmed" mb={8}>
              Child Nodes ({node.children.length})
            </Text>
            <Stack gap="xs">
              {node.children.map((child) => (
                <Card key={child.id} className={styles.childCard} withBorder>
                  <Group justify="space-between">
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
                        {child.name}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        ID: {child.id}
                      </Text>
                    </Box>
                    {child.requiresReschedule && (
                      <Tooltip label="Requires reschedule">
                        <IconClock
                          size={14}
                          color="var(--mantine-color-orange-6)"
                        />
                      </Tooltip>
                    )}
                  </Group>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Additional Properties */}
        {Object.keys(node).length > 0 && (
          <Box>
            <Text size="sm" c="dimmed" mb={8}>
              Additional Properties
            </Text>
            <Card className={styles.propertiesCard} withBorder>
              <Stack gap="xs">
                {Object.entries(node)
                  .filter(
                    ([key]) =>
                      ![
                        "id",
                        "name",
                        "children",
                        "requiresReschedule",
                      ].includes(key)
                  )
                  .map(([key, value]) => (
                    <Group key={key} justify="space-between">
                      <Text size="xs" c="dimmed" tt="capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </Text>
                      <Text size="xs" ff="monospace">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </Text>
                    </Group>
                  ))}
              </Stack>
            </Card>
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default NodeDetailPanel;
