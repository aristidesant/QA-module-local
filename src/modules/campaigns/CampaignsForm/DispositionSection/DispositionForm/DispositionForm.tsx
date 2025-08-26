import React from "react";
import { Grid, Paper, ScrollArea } from "@mantine/core";
import DispositionCatalogMenu from "./DispositionCatalogMenu";
import DispositionBuilder from "./DispositionBuilder/DispositionBuilder";
import { DragDropContext } from "@hello-pangea/dnd";
import { useDispositionBuilderStore } from "../dispositionStore";
import {
  findNodeById,
  getDirectHierarchyTree,
  parseDroppableId,
} from "~/utils/dragDropUtils";
import styles from "./DispositionForm.module.css";

interface DispositionFormProps {
  onComplete?: () => void;
}

const DispositionForm: React.FC<DispositionFormProps> = ({ onComplete }) => {
  const {
    isParentInFlow,
    addNodeToParent,
    selectedCatalog,
    addNode,
    flowJson,
  } = useDispositionBuilderStore((state) => state);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceInfo = parseDroppableId(result.source.droppableId);
    const destInfo = parseDroppableId(result.destination.droppableId);

    // Only handle drag from catalog to builder
    if (
      (sourceInfo.type === "catalog-root" ||
        sourceInfo.type === "catalog-nested") &&
      destInfo.type === "builder"
    ) {
      const nodeId = Number(result.draggableId);
      const currentNode = findNodeById(
        selectedCatalog?.dispositionNodes ?? [],
        nodeId
      );
      // Find the parent node (not just parentId)
      let parentNode: any = null;
      if (currentNode?.parentId) {
        parentNode = findNodeById(
          selectedCatalog?.dispositionNodes ?? [],
          currentNode.parentId
        );
      }
      const parentInFlow = parentNode && isParentInFlow(parentNode);
      if (parentInFlow && currentNode && parentNode) {
        console.log("Parent is in flow");
        addNodeToParent(currentNode);
      } else {
        const draggedNode = getDirectHierarchyTree(
          selectedCatalog?.dispositionNodes ?? [],
          nodeId
        );
        if (draggedNode) {
          const existingIds = new Set(
            flowJson?.dispositionNodes?.map((n: any) => n.id) || []
          );
          if (!existingIds.has(draggedNode.id)) {
            addNode(draggedNode);
          }
        }
      }
    }
    // All other drag operations are ignored.
  };
  return (
    <div className={styles.wrapper}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid gutter="md" h="100%">
          <Grid.Col span={3}>
            <Paper className={styles.leftSection} withBorder p={"xs"}>
              <ScrollArea h={"100%"}>
                <DispositionCatalogMenu />
              </ScrollArea>
            </Paper>
          </Grid.Col>
          <Grid.Col span={9}>
            <Paper className={styles.rightSection} withBorder>
              <DispositionBuilder onComplete={onComplete} />
            </Paper>
          </Grid.Col>
        </Grid>
      </DragDropContext>
    </div>
  );
};

export default DispositionForm;
