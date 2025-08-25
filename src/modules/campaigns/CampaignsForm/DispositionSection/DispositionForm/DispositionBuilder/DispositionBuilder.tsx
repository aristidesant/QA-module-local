import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  Stack,
  ScrollArea,
  Paper,
  TextInput,
  Flex,
  Text,
} from "@mantine/core";
import styles from "./DispositionBuilder.module.css";
import { Droppable } from "@hello-pangea/dnd";
import {
  useCreateDispositionFlow,
  useUpdateDispositionFlow,
} from "~/queries/dispositionFlowQueries";
import type { DispositionCatalogModel } from "~/models/DispositionCatalogModels";
import type { DispositionNode } from "~/models/DispositionNodeModel";
import { useDispositionBuilderStore } from "../../dispositionStore";
import NodeEditor from "./NodeEditor";
import DispositionNodeForm from "./DispositionNodeForm";
import { notifications } from "@mantine/notifications";

type DispositionBuilderProps = {
  onComplete?: () => void;
};

const DispositionBuilder: React.FC<DispositionBuilderProps> = ({
  onComplete,
}) => {
  const createMutation = useCreateDispositionFlow();
  const updateMutation = useUpdateDispositionFlow();
  const { flowJson, campaignId, dispositionFlow, removeNode, setFlowJson } =
    useDispositionBuilderStore();

  // Only keep the original catalog nodes from flowJson
  const catalogNodes: DispositionNode[] = flowJson.dispositionNodes ?? [];

  // On mount, initialize builderNodes if empty
  useEffect(() => {
    if (flowJson?.dispositionNodes?.length === 0 && catalogNodes.length > 0) {
      setFlowJson({ ...flowJson, dispositionNodes: catalogNodes });
    }
  }, [catalogNodes, flowJson, setFlowJson]);

  // State for selected node for editing
  const [selectedNode, setSelectedNode] = useState<DispositionNode | null>(
    null
  );

  const [parentNode, setParentNode] = useState<DispositionNode | null>(null);

  // Handler for node selection
  const handleNodeSelect = (
    node: DispositionNode,
    parentNode?: DispositionNode
  ) => {
    if (!node.children || node.children.length === 0) {
      setSelectedNode(node);
      setParentNode(parentNode || null);
    } else {
      setSelectedNode(null);
    }
  };

  const handleNodeFormCancel = () => {
    setSelectedNode(null);
  };

  const handleSave = async () => {
    if (
      !flowJson?.dispositionNodes ||
      flowJson?.dispositionNodes?.length === 0
    ) {
      notifications.show({
        title: "Error",
        message: "Please add at least one disposition node.",
        color: "red",
      });
      return;
    }

    // Ensure required fields are filled
    if (!flowJson.name || flowJson.name.trim() === "") {
      notifications.show({
        title: "Error",
        message: "Disposition name is required.",
        color: "red",
      });
      return;
    }

    const filledFlowJson: DispositionCatalogModel = {
      id: flowJson.id ?? 0,
      name: flowJson.name ?? "Untitled Catalog",
      clientId: flowJson.clientId ?? 0,
      isActive: flowJson.isActive ?? true,
      isDefault: flowJson.isDefault ?? false,
      createdAt: flowJson.createdAt ?? new Date().toISOString(),
      updatedAt: flowJson.updatedAt ?? new Date().toISOString(),
      dispositionNodes: flowJson.dispositionNodes ?? [],
      description: flowJson.description,
      campaignId: campaignId,
    };
    try {
      if (dispositionFlow?.id) {
        await updateMutation.mutateAsync({
          id: dispositionFlow?.id,
          data: { ...dispositionFlow, flowJson: filledFlowJson },
        });
        onComplete?.();
      } else {
        console.log("Creating new disposition flow", campaignId);
        await createMutation.mutateAsync({
          flowJson: filledFlowJson,
          campaignId,
        });
        onComplete?.();
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "An error occurred while saving the disposition flow.",
        color: "red",
      });
    }
  };

  return (
    <Box className={styles.builderContainer}>
      {/* Main content area with two panels */}
      <Flex mb={"xs"}>
        <TextInput
          label="Disposition Name"
          labelProps={{
            title: `Campaign ID: ${campaignId || "N/A"}`,
          }}
          placeholder="Disposition Name"
          description="Enter the name of the disposition"
          value={flowJson.name || ""}
          onChange={(event) =>
            setFlowJson({ ...flowJson, name: event.currentTarget.value })
          }
          required
        />
      </Flex>
      <Box className={styles.panelsContainer}>
        {/* Left panel: Disposition nodes */}
        <Box className={styles.leftPanel}>
          <ScrollArea
            type="hover"
            scrollbarSize={6}
            className={styles.scrollArea}
            styles={{
              scrollbar: {
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "var(--mantine-color-gray-1)",
                },
              },
              thumb: {
                backgroundColor: "var(--mantine-color-gray-4)",
                "&:hover": {
                  backgroundColor: "var(--mantine-color-gray-6)",
                },
              },
            }}
          >
            <Box className={styles.leftPanelContent}>
              <Droppable droppableId="builder-drop" type="DISPOSITION_NODE">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={
                      snapshot.isDraggingOver
                        ? `${styles.dropArea} ${styles.dropAreaActive}`
                        : flowJson?.dispositionNodes &&
                          flowJson.dispositionNodes.length > 0
                        ? styles.dropAreaWithNodes
                        : styles.dropArea
                    }
                  >
                    <Stack gap="xs" className={styles.nodesStack}>
                      {flowJson?.dispositionNodes &&
                      flowJson.dispositionNodes.length > 0 ? (
                        <div>
                          {flowJson.dispositionNodes.map((node, idx) => (
                            <NodeEditor
                              key={node.id}
                              node={node}
                              idx={idx}
                              setBuilderNodes={(nodes) => {
                                setFlowJson({
                                  ...flowJson,
                                  dispositionNodes: nodes,
                                });
                              }}
                              builderNodes={flowJson.dispositionNodes || []}
                              removeNode={removeNode}
                              onNodeSelect={handleNodeSelect}
                              selectedNodeId={selectedNode?.id}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={styles.dropAreaText}>
                          Drop disposition nodes here
                        </div>
                      )}
                      {provided.placeholder}
                    </Stack>
                  </div>
                )}
              </Droppable>
            </Box>
          </ScrollArea>
        </Box>

        {/* Right panel for node editing */}
        <Box className={styles.rightPanel}>
          <ScrollArea
            type="hover"
            scrollbarSize={6}
            className={styles.scrollArea}
            styles={{
              scrollbar: {
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "var(--mantine-color-gray-1)",
                },
              },
              thumb: {
                backgroundColor: "var(--mantine-color-gray-4)",
                "&:hover": {
                  backgroundColor: "var(--mantine-color-gray-6)",
                },
              },
            }}
          >
            <Box className={styles.rightPanelContent}>
              {selectedNode &&
              (!selectedNode.children || selectedNode.children.length === 0) ? (
                <DispositionNodeForm
                  key={selectedNode.id}
                  node={selectedNode}
                  parentNode={parentNode}
                  onSubmit={() => {
                    setSelectedNode(null);
                    setParentNode(null);
                  }}
                  onCancel={handleNodeFormCancel}
                />
              ) : (
                <Box className={styles.emptyRightPanel}>
                  <div className={styles.emptyPanelText}>
                    Select a node to edit its properties
                  </div>
                </Box>
              )}
            </Box>
          </ScrollArea>
        </Box>
      </Box>

      {/* Footer */}
      <Paper withBorder className={styles.footer}>
        <Button
          onClick={handleSave}
          loading={createMutation.isPending || updateMutation.isPending}
          size="md"
          variant="filled"
        >
          {dispositionFlow?.id ? "Update Flow" : "Create Flow"}
        </Button>
      </Paper>
    </Box>
  );
};

export default DispositionBuilder;
