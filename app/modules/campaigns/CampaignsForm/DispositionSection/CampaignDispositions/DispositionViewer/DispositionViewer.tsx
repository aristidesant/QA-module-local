import React, { useState } from "react";
import {
  Text,
  ScrollArea,
  Stack,
  Group,
  Divider,
  Collapse,
  Box,
  UnstyledButton,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconFolder,
  IconFolderOpen,
  IconFileText,
  IconCircle,
  IconGitBranch,
  IconEye,
} from "@tabler/icons-react";
import classes from "./DispositionViewer.module.css";
import type {
  DispositionCatalogModel,
  DispositionCategoryModel,
  DispositionTypeModel,
  DispositionStatusModel,
} from "~/models/DispositionCatalogModels";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";
import { useCampaignsStore } from "~/stores/campaignsStore";
import DispositionPropertiesViewer from "../DispositionPropertiesViewer";

// Interface for the incoming raw data structure
interface RawDispositionNode {
  id: number;
  name: string;
  type: "category" | "type" | "status";
  order: number;
  description?: string | null;
  children?: RawDispositionNode[];
  isFinal?: boolean;
  requiresReschedule?: boolean;
  isInvalidatesNumber?: boolean;
}

interface RawDispositionData {
  name: string;
  category: RawDispositionNode[];
}

interface DispositionViewerProps {
  dispositionData?:
    | DispositionCatalogModel
    | DispositionFlowModel
    | RawDispositionData;
  title?: string;
  height?: number | string;
}

// Function to transform raw data structure to expected model structure
const transformRawDataToCatalog = (
  rawData: RawDispositionData
): DispositionCatalogModel => {
  const transformStatus = (
    node: RawDispositionNode
  ): DispositionStatusModel => ({
    id: node.id,
    name: node.name,
    description: node.description || undefined,
    order: node.order,
    isFinal: node.isFinal || false,
    requiresReschedule: node.requiresReschedule || false,
    isInvalidatesNumber: node.isInvalidatesNumber || false,
    isActive: true, // Default to active since raw data doesn't specify
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const transformType = (node: RawDispositionNode): DispositionTypeModel => ({
    id: node.id,
    name: node.name,
    description: node.description || undefined,
    order: node.order,
    isActive: true,
    statuses:
      node.children
        ?.filter((child) => child.type === "status")
        .map(transformStatus) || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const transformCategory = (
    node: RawDispositionNode
  ): DispositionCategoryModel => ({
    id: node.id,
    name: node.name,
    description: node.description || undefined,
    order: node.order,
    isActive: true,
    isProtected: false, // Default to not protected
    types:
      node.children
        ?.filter((child) => child.type === "type")
        .map(transformType) || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return {
    id: 1, // Default ID since raw data doesn't have catalog ID
    name: rawData.name,
    description: `Generated catalog for ${rawData.name}`,
    clientId: 1, // Default client ID
    campaignId: undefined,
    isActive: true,
    isDefault: false,
    categories: rawData.category.map(transformCategory),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Type guard to check if data is raw format
const isRawDispositionData = (data: any): data is RawDispositionData => {
  return (
    data &&
    typeof data === "object" &&
    "category" in data &&
    Array.isArray(data.category)
  );
};

const TreeNode: React.FC<{
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  expandedIcon?: React.ReactNode;
  label: string;
  description?: string;
  children?: React.ReactNode;
  level: number;
  nodeType: "category" | "type" | "status";
  isActive: boolean;
  onClick?: () => void;
}> = ({
  isExpanded,
  onToggle,
  icon,
  expandedIcon,
  label,
  description,
  children,
  level,
  nodeType,
  isActive,
  onClick,
}) => {
  const hasChildren = Boolean(children);
  // Limit the maximum padding to prevent overflow
  const maxPaddingLevel = 3;
  const effectiveLevel = Math.min(level, maxPaddingLevel);
  const paddingLeft = effectiveLevel * 16 + 12; // Reduced from 24px to 16px per level

  // Get color based on level instead of node type
  const getNodeColor = () => {
    if (!isActive) return "gray";

    switch (level) {
      case 0:
        return "blue"; // Categories
      case 1:
        return "green"; // Types
      case 2:
        return "cyan"; // Statuses
      default:
        return "gray";
    }
  };

  const nodeColor = getNodeColor();

  return (
    <Box className={classes.nodeContainer}>
      <UnstyledButton
        onClick={(e) => {
          if (hasChildren) {
            onToggle();
          }
          if (onClick) {
            onClick();
          }
        }}
        className={`${classes.treeNode} ${classes.levelNode}`}
        style={{
          paddingLeft,
          marginLeft: level > 0 ? 4 : 0, // Reduced margin
          opacity: !isActive ? 0.6 : 1,
          cursor: onClick || hasChildren ? "pointer" : "default",
          maxWidth: "100%",
        }}
      >
        <Group gap="sm" align="center" flex={1}>
          <Box w={32} style={{ display: "flex", justifyContent: "center" }}>
            {hasChildren ? (
              <ThemeIcon
                variant="light"
                size="sm"
                color={isExpanded ? nodeColor : "gray"}
              >
                {isExpanded ? (
                  <IconChevronDown size={14} />
                ) : (
                  <IconChevronRight size={14} />
                )}
              </ThemeIcon>
            ) : null}
          </Box>

          <ThemeIcon variant="light" size="md" color={nodeColor}>
            {isExpanded && expandedIcon ? expandedIcon : icon}
          </ThemeIcon>

          <Stack gap={4} flex={1} style={{ minWidth: 0 }}>
            <Group gap="sm" align="center">
              <Text
                size="sm"
                fw={level === 0 ? 500 : 400}
                c={!isActive ? "dimmed" : undefined}
                truncate
              >
                {label}
              </Text>
            </Group>
            {description && (
              <Text size="xs" c="dimmed" lineClamp={2} style={{ wordBreak: "break-word" }}>
                {description}
              </Text>
            )}
          </Stack>
        </Group>
      </UnstyledButton>

      {hasChildren && (
        <Collapse in={isExpanded}>
          <Box className={classes.childrenContainer}>{children}</Box>
        </Collapse>
      )}
    </Box>
  );
};

const StatusNode: React.FC<{
  status: DispositionStatusModel;
  level: number;
}> = ({ status, level }) => {
  const { setRightComponent } = useCampaignsStore();

  const handleStatusClick = () => {
    if (setRightComponent) {
      setRightComponent(<DispositionPropertiesViewer status={status} />);
    }
  };

  return (
    <TreeNode
      isExpanded={false}
      onToggle={() => {}}
      icon={<IconCircle size={16} />}
      label={status.name}
      description={status.description}
      level={level}
      nodeType="status"
      isActive={status.isActive}
      onClick={handleStatusClick}
    />
  );
};

const TypeNode: React.FC<{
  type: DispositionTypeModel;
  level: number;
  expandedTypes: Set<number>;
  onToggleType: (id: number) => void;
}> = ({ type, level, expandedTypes, onToggleType }) => {
  const isExpanded = expandedTypes.has(type.id);
  const hasStatuses = type.statuses && type.statuses.length > 0;

  return (
    <TreeNode
      isExpanded={isExpanded}
      onToggle={() => onToggleType(type.id)}
      icon={<IconFileText size={18} />}
      label={type.name}
      description={type.description}
      level={level}
      nodeType="type"
      isActive={type.isActive}
    >
      {hasStatuses && (
        <Stack gap={1}>
          {type.statuses!.map((status) => (
            <StatusNode key={status.id} status={status} level={level + 1} />
          ))}
        </Stack>
      )}
    </TreeNode>
  );
};

const CategoryNode: React.FC<{
  category: DispositionCategoryModel;
  level: number;
  expandedCategories: Set<number>;
  expandedTypes: Set<number>;
  onToggleCategory: (id: number) => void;
  onToggleType: (id: number) => void;
}> = ({
  category,
  level,
  expandedCategories,
  expandedTypes,
  onToggleCategory,
  onToggleType,
}) => {
  const isExpanded = expandedCategories.has(category.id);
  const hasTypes = category.types && category.types.length > 0;

  return (
    <TreeNode
      isExpanded={isExpanded}
      onToggle={() => onToggleCategory(category.id)}
      icon={<IconFolder size={18} />}
      expandedIcon={<IconFolderOpen size={18} />}
      label={category.name}
      description={category.description}
      level={level}
      nodeType="category"
      isActive={category.isActive}
    >
      {hasTypes && (
        <Stack gap={1}>
          {category.types!.map((type) => (
            <TypeNode
              key={type.id}
              type={type}
              level={level + 1}
              expandedTypes={expandedTypes}
              onToggleType={onToggleType}
            />
          ))}
        </Stack>
      )}
    </TreeNode>
  );
};

const DispositionViewer: React.FC<DispositionViewerProps> = ({
  dispositionData,
  title,
  height = "auto",
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [expandedTypes, setExpandedTypes] = useState<Set<number>>(new Set());

  const toggleExpanded = (id: number, type: "category" | "type") => {
    const setExpanded =
      type === "category" ? setExpandedCategories : setExpandedTypes;
    const expanded = type === "category" ? expandedCategories : expandedTypes;

    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!dispositionData) {
    return (
      <Paper className={classes.container} style={{ height }}>
        <Stack align="center" justify="center" h="100%" gap="lg">
          <ThemeIcon variant="light" size={64} color="gray">
            <IconGitBranch size={32} />
          </ThemeIcon>
          <Text size="lg" fw={500} c="dimmed">
            No disposition configuration available
          </Text>
        </Stack>
      </Paper>
    );
  }

  // Extract catalog from DispositionFlowModel or transform raw data if needed
  let catalog: DispositionCatalogModel;

  if (isRawDispositionData(dispositionData)) {
    catalog = transformRawDataToCatalog(dispositionData);
  } else if ("flowJson" in dispositionData) {
    catalog = dispositionData.flowJson;
  } else {
    catalog = dispositionData;
  }

  const categories = catalog.categories || [];
  const displayTitle = title || `${catalog.name} Dispositions`;

  return (
    <Paper className={classes.container} style={{ height }}>
      <Stack gap="md" h="100%">
        <Box className={classes.header}>
          <Group align="center" gap="sm">
            <ThemeIcon variant="light" size="lg" color="blue">
              <IconGitBranch size={24} />
            </ThemeIcon>
            <Stack gap={4}>
              <Text size="lg" fw={600}>
                {displayTitle}
              </Text>
              {catalog.description && (
                <Text size="sm" c="dimmed">
                  {catalog.description}
                </Text>
              )}
            </Stack>
          </Group>
        </Box>

        <Divider />

        <ScrollArea flex={1} className={classes.scrollArea}>
          <Stack gap={2}>
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryNode
                  key={category.id}
                  category={category}
                  level={0}
                  expandedCategories={expandedCategories}
                  expandedTypes={expandedTypes}
                  onToggleCategory={(id) => toggleExpanded(id, "category")}
                  onToggleType={(id) => toggleExpanded(id, "type")}
                />
              ))
            ) : (
              <Paper p="xl" className={classes.emptyState}>
                <Stack align="center" gap="md">
                  <ThemeIcon variant="light" size={48} color="gray">
                    <IconEye size={24} />
                  </ThemeIcon>
                  <Text c="dimmed" ta="center" size="sm">
                    No disposition categories configured
                  </Text>
                </Stack>
              </Paper>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
};

export default DispositionViewer;
