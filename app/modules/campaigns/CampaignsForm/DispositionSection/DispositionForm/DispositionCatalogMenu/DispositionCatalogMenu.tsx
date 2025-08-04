import React, { useState, useMemo } from "react";
import styles from "./DispositionCatalogMenu.module.css";
import { useDispositionBuilderStore } from "../../dispositionStore";
import { Select, Box, Paper, Divider } from "@mantine/core";
import { Droppable } from "@hello-pangea/dnd";
import { useDispositionCatalogs } from "~/queries/dispositionCatalogQueries";
import type { DispositionNode } from "~/models/DispositionNodeModel";
import DispositionCatalogMenuItem from "./DispositionCatalogMenuItem";

interface AvailableNode {
  node: DispositionNode;
  disabled: boolean;
  level: number;
}

const DispositionCatalogMenu: React.FC = () => {
  const { getMovedNodeIds, selectedCatalog, setSelectedCatalog } =
    useDispositionBuilderStore();
  const movedNodeIds = getMovedNodeIds();
  const { data: catalogs = [], isLoading } = useDispositionCatalogs();
  // Set default catalog if not set or if selectedCatalog is not in the list
  React.useEffect(() => {
    if (catalogs.length > 0) {
      if (
        !selectedCatalog ||
        !catalogs.some((cat) => cat.id === selectedCatalog.id)
      ) {
        setSelectedCatalog(catalogs[0]);
      }
    } else {
      setSelectedCatalog(null);
    }
  }, [catalogs, selectedCatalog, setSelectedCatalog]);

  // Helper functions
  const getAllChildIds = (node: DispositionNode): number[] => {
    if (!node.children || node.children.length === 0) return [];
    return node.children.reduce<number[]>(
      (acc, child) => [...acc, child.id, ...getAllChildIds(child)],
      []
    );
  };

  const availableNodes = useMemo((): AvailableNode[] => {
    if (!selectedCatalog?.dispositionNodes) return [];

    const allNodes = selectedCatalog.dispositionNodes;
    const movedIds = new Set(movedNodeIds.map((id) => parseInt(id)));
    const result: AvailableNode[] = [];

    // Enhanced logic: covers all edge cases for parent/child visibility and enabled state
    const addNodeWithChildren = (node: DispositionNode, level: number = 0) => {
      const hasChildren = node.children && node.children.length > 0;
      const isMoved = movedIds.has(node.id);
      const childIds = hasChildren ? getAllChildIds(node) : [];
      const allChildrenAndDescendantsMoved =
        childIds.length > 0 && childIds.every((id) => movedIds.has(id));

      // Case 1: Hide parent only if it and all descendants are moved
      if (isMoved && allChildrenAndDescendantsMoved) {
        return;
      }

      // Case 2: Parent node logic
      if (hasChildren) {
        // Parent is disabled if moved or if not all children are moved
        result.push({
          node,
          disabled: isMoved || !allChildrenAndDescendantsMoved,
          level,
        });
        // Always process children, regardless of parent state
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => {
            addNodeWithChildren(child, level + 1);
          });
        }
      } else {
        // Case 3: Leaf node logic
        // Leaf is hidden if moved, else enabled
        if (!isMoved) {
          result.push({
            node,
            disabled: false,
            level,
          });
        }
      }
    };

    allNodes.forEach((node) => {
      addNodeWithChildren(node, 0);
    });

    return result;
  }, [selectedCatalog, movedNodeIds]);

  return (
    <>
      <Select
        label="Select Catalog"
        data={catalogs.map((cat) => ({
          value: String(cat.id),
          label: cat.name,
        }))}
        value={selectedCatalog ? String(selectedCatalog.id) : null}
        onChange={(id) => {
          const catalog = catalogs.find((cat) => String(cat.id) === id) || null;
          setSelectedCatalog(catalog);
        }}
        disabled={isLoading || catalogs.length === 0}
        mb="md"
      />
      <Divider />
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
        <Droppable
          droppableId="catalog-menu"
          isDropDisabled={true}
          type="DISPOSITION_NODE"
        >
          {(provided) => (
            <div className={styles.menuListWrapper}>
              <ul ref={provided.innerRef} {...provided.droppableProps}>
                {availableNodes.map((item, idx) => (
                  <div
                    key={`${item.node.id}-${idx}`}
                    style={{
                      marginLeft: `${item.level * 16}px`,
                      width: `calc(100% - ${item.level * 16}px)`,
                    }}
                  >
                    <DispositionCatalogMenuItem
                      node={item.node}
                      path={`${idx}`}
                      movedNodeIds={movedNodeIds}
                      disabled={item.disabled}
                    />
                  </div>
                ))}
                {provided.placeholder}
              </ul>
            </div>
          )}
        </Droppable>
      </div>
    </>
  );
};

export default DispositionCatalogMenu;
