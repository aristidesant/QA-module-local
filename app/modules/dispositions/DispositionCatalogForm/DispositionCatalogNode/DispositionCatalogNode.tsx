import { useUpdateDispositionNode } from "~/queries/dispositionNodesQueries";
import { useDeleteDispositionNode } from "~/queries/dispositionNodesQueries";
import { useCreateDispositionNode } from "~/queries/dispositionNodesQueries";

import {
  Tree,
  ActionIcon,
  useTree,
  getTreeExpandedState,
  Box,
  Flex,
  Button,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconChevronRight,
  IconFolder,
  IconFileDescription,
} from "@tabler/icons-react";
import { useState } from "react";
import styles from "./DispositionCatalogNode.module.css";
import DispositionNodeForm from "./DispositionNodeForm";
// Types for modal state
type ModalState = {
  open: boolean;
  parentId?: number;
  editNode?: DispositionNode;
};
import type { TreeNodeData } from "@mantine/core";
import type { DispositionNode } from "~/models/DispositionNodeModel";
import { useDispositionTreeByCatalog } from "~/queries/dispositionNodesQueries";

type DispositionCatalogFormProps = {
  catalogId: number;
};

// Utility to map DispositionNode[] to Mantine TreeNodeData[]
function mapDispositionNodesToTreeData(
  nodes: DispositionNode[]
): TreeNodeData[] {
  return nodes.map((node) => {
    const mappedNode: TreeNodeData = {
      value: node.id.toString(),
      label: node.name,
    };
    if (node.children && node.children.length > 0) {
      mappedNode.children = mapDispositionNodesToTreeData(node.children);
    }
    return mappedNode;
  });
}

const DispositionCatalogForm: React.FC<DispositionCatalogFormProps> = ({
  catalogId,
}) => {
  const { data, refetch: reloadCatalogs } =
    useDispositionTreeByCatalog(catalogId);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const createNode = useCreateDispositionNode();
  const updateNode = useUpdateDispositionNode();
  const deleteNode = useDeleteDispositionNode();

  if (!catalogId) return null;
  const treeData = data ? mapDispositionNodesToTreeData(data) : [];

  // Initialize tree with all nodes expanded by default
  const tree = useTree({
    initialExpandedState: getTreeExpandedState(treeData, "*"),
  });

  // Custom node renderer
  // Mantine's Tree renderNode provides level, expanded, hasChildren, tree, elementProps, etc.
  const renderNode = ({
    node,
    level,
    expanded,
    hasChildren,
    tree,
    elementProps,
  }: any) => {
    // Find the original DispositionNode by id
    const nodeId = Number(node.value);
    const findNodeById = (
      nodes: DispositionNode[],
      id: number
    ): DispositionNode | undefined => {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = findNodeById(n.children, id);
          if (found) return found;
        }
      }
      return undefined;
    };
    const nodeData = data ? findNodeById(data, nodeId) : undefined;
    return (
      <Flex style={{ marginLeft: level * 18 }} {...elementProps}>
        {hasChildren && (
          <span
            className={styles.expandIcon}
            onClick={(e) => {
              e.stopPropagation();
              tree.toggleExpanded(node.value);
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <IconChevronRight
              size={16}
              style={{
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.1s",
              }}
            />
          </span>
        )}
        {/* Folder or file icon */}
        <span style={{ marginRight: 6, display: "flex", alignItems: "center" }}>
          {hasChildren ? (
            <IconFolder size={18} color="#8c8c8c" />
          ) : (
            <IconFileDescription size={18} color="#b0b0b0" />
          )}
        </span>
        <span
          className={styles.nodeLabel}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) tree.toggleExpanded(node.value);
          }}
        >
          {node.label}
        </span>
        <div className={styles.iconGroup}>
          <ActionIcon
            size="sm"
            variant="subtle"
            aria-label="Edit node"
            className={styles.actionIcon}
            onClick={(e) => {
              e.stopPropagation();
              if (nodeData) setModal({ open: true, editNode: nodeData });
            }}
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            aria-label="Add child"
            className={styles.actionIcon}
            onClick={(e) => {
              e.stopPropagation();
              if (nodeData) setModal({ open: true, parentId: nodeData.id });
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            aria-label="Remove node"
            className={styles.actionIcon}
            onClick={async (e) => {
              e.stopPropagation();
              if (nodeData) await deleteNode.mutateAsync(nodeData.id);
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </div>
      </Flex>
    );
  };

  return (
    <>
      <Box>
        {treeData.length > 0 && (
          <Tree data={treeData} tree={tree} renderNode={renderNode} />
        )}
        <Flex
          justify="center"
          align="center"
          style={{ marginTop: 24, minHeight: treeData.length === 0 ? 120 : 0 }}
        >
          <Button
            fullWidth
            variant="light"
            color="blue"
            leftSection={<IconPlus size={18} />}
            size="sm"
            style={{ maxWidth: 340 }}
            onClick={() => setModal({ open: true })}
            aria-label="Add disposition to catalog"
          >
            Add Disposition
          </Button>
        </Flex>
      </Box>
      <DispositionNodeForm
        opened={modal.open}
        onClose={() => setModal({ open: false })}
        initialValues={modal.editNode}
        onSubmit={async (values) => {
          if (!catalogId) return;
          if (modal.editNode) {
            await updateNode.mutateAsync({
              id: modal.editNode.id,
              data: values,
            });
            await reloadCatalogs();
          } else {
            await createNode.mutateAsync({
              data: {
                ...values,
                catalogId: Number(catalogId),
                parentId: modal.parentId,
              },
            });
            await reloadCatalogs();
          }
          setModal({ open: false });
        }}
        title={modal.editNode ? "Edit Disposition" : "Add Disposition"}
      />
    </>
  );
};

export default DispositionCatalogForm;
