import React, { useState } from "react";
import { Button, Flex, Text } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDispositionCatalogs,
  useCurrentDispositionFlow,
} from "~/queries/dispositionCatalogQueries";
import DispositionViewer from "~/modules/campaigns/CampaignsForm/DispositionSection/CampaignDispositions/DispositionViewer";
import SectionCard from "~/components/SectionCard";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";
import { useDispositionFlowsByCampaignPath } from "~/queries/dispositionFlowQueries";
import { validateAndNormalizeDispositionFlow } from "~/utils/dispositionFlowUtils";
import CampaignDispositions from "./CampaignDispositions/CampaignDispositions";

interface DispositionSectionProps {
  campaignId?: string | number;
  onDispositionChange?: (disposition: DispositionFlowModel) => void;
}

const DispositionSection: React.FC<DispositionSectionProps> = () => {
  const { selectedCampaign } = useCampaignsStore();
  const queryClient = useQueryClient();
  const [dispositionFlow, setDispositionFlow] = useState<
    DispositionFlowModel | undefined
  >(undefined);
  const { data: dispositionCatalogs } = useDispositionCatalogs();
  const { data: currentDispositionFlow, isLoading: isLoadingCurrentFlow } =
    useDispositionFlowsByCampaignPath(selectedCampaign?.id);

  // Debug the received disposition flow
  React.useEffect(() => {
    if (currentDispositionFlow) {
      console.log("DispositionSection: Received disposition flow:", {
        id: currentDispositionFlow.id,
        campaignId: currentDispositionFlow.campaignId,
        hasFlowJson: !!currentDispositionFlow.flowJson,
        flowJsonType: typeof currentDispositionFlow.flowJson,
        flowJsonKeys: currentDispositionFlow.flowJson
          ? Object.keys(currentDispositionFlow.flowJson)
          : [],
        isNestedFlowJson:
          currentDispositionFlow.flowJson &&
          "flowJson" in currentDispositionFlow.flowJson,
      });
    }
  }, [currentDispositionFlow]);

  // Use the current disposition flow from the API if available, otherwise use local state
  const activeDispositionFlow = currentDispositionFlow || dispositionFlow;

  // For now, use the first catalog (can be improved for selection)
  const catalog = dispositionCatalogs?.[0];

  // Memoize safeCatalog to prevent unnecessary re-renders and sort by order
  const safeCatalog = React.useMemo(() => {
    return catalog
      ? {
          ...catalog,
          categories: (catalog.categories ?? [])
            .map((cat) => ({
              ...cat,
              types: (cat.types ?? [])
                .map((type) => ({
                  ...type,
                  statuses: (type.statuses ?? []).sort(
                    (a, b) => (a.order || 0) - (b.order || 0)
                  ), // Sort statuses by order
                }))
                .sort((a, b) => (a.order || 0) - (b.order || 0)), // Sort types by order
            }))
            .sort((a, b) => (a.order || 0) - (b.order || 0)), // Sort categories by order
        }
      : undefined;
  }, [catalog]);

  if (!safeCatalog) {
    return (
      <SectionCard
        title="Disposition Configuration"
        description="Set up call dispositions for this campaign."
      >
        <Text c="dimmed" ta="center" py="xl">
          Loading disposition catalog...
        </Text>
      </SectionCard>
    );
  }

  if (isLoadingCurrentFlow) {
    return (
      <SectionCard
        title="Disposition Configuration"
        description="Set up call dispositions for this campaign."
      >
        <Text c="dimmed" ta="center" py="xl">
          Loading current disposition flow...
        </Text>
      </SectionCard>
    );
  }

  const handleOpenDispositions = (initialFlow?: DispositionFlowModel) => {
    // Debug the initialFlow being passed
    if (initialFlow) {
      console.log(
        "DispositionSection: Opening dispositions with initialFlow:",
        {
          id: initialFlow.id,
          campaignId: initialFlow.campaignId,
          hasFlowJson: !!initialFlow.flowJson,
          flowJsonType: typeof initialFlow.flowJson,
          flowJsonStructure: initialFlow.flowJson
            ? {
                hasId: "id" in initialFlow.flowJson,
                hasCategories: "categories" in initialFlow.flowJson,
                hasNestedFlowJson: "flowJson" in initialFlow.flowJson,
                keys: Object.keys(initialFlow.flowJson),
              }
            : null,
        }
      );

      try {
        // Validate and normalize the disposition flow before passing it
        const normalizedFlow = validateAndNormalizeDispositionFlow(initialFlow);

        modals.open({
          modalId: "dispositions-modal",
          fullScreen: true,
          title: <Text fw="bold">Dispositions</Text>,
          children: (
            <CampaignDispositions
              campaignId={selectedCampaign?.id}
              initialFlow={normalizedFlow}
              onComplete={(flow) => {
                modals.close("dispositions-modal");
                setDispositionFlow(flow);
                // Refresh the current disposition flow query
                queryClient.invalidateQueries({
                  queryKey: [
                    "dispositionFlow",
                    "current",
                    selectedCampaign?.id,
                  ],
                });
                // Also invalidate the campaignPath query
                queryClient.invalidateQueries({
                  queryKey: [
                    "dispositionFlows",
                    "campaignPath",
                    selectedCampaign?.id,
                  ],
                });
                console.log("Disposition flow saved:", flow);
              }}
            />
          ),
        });
      } catch (error) {
        console.error(
          "DispositionSection: Error validating disposition flow:",
          error
        );
        notifications.show({
          title: "Error",
          message: `Failed to open disposition editor: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          color: "red",
        });
        return;
      }
    } else {
      // No initial flow, create new
      modals.open({
        modalId: "dispositions-modal",
        fullScreen: true,
        title: "Dispositions",
        children: (
          <CampaignDispositions
            campaignId={selectedCampaign?.id}
            onComplete={(flow) => {
              modals.close("dispositions-modal");
              setDispositionFlow(flow);
              // Refresh the current disposition flow query
              queryClient.invalidateQueries({
                queryKey: ["dispositionFlow", "current", selectedCampaign?.id],
              });
              // Also invalidate the campaignPath query
              queryClient.invalidateQueries({
                queryKey: [
                  "dispositionFlows",
                  "campaignPath",
                  selectedCampaign?.id,
                ],
              });
              console.log("Disposition flow saved:", flow);
            }}
          />
        ),
      });
    }
  };

  return (
    <SectionCard
      title="Disposition Configuration"
      headerActions={
        !activeDispositionFlow ? (
          <Flex>
            <Button onClick={() => handleOpenDispositions()}>
              Add disposition
            </Button>
          </Flex>
        ) : (
          <Flex justify="end" align="center" mb="md">
            <Button
              onClick={() => handleOpenDispositions(activeDispositionFlow)}
            >
              Edit
            </Button>
          </Flex>
        )
      }
      description="Set up call dispositions for this campaign. Drag items from the catalog to build your disposition structure."
    >
      <div style={{ padding: "16px", maxWidth: "100%", overflow: "hidden" }}>
        <DispositionViewer
          dispositionData={activeDispositionFlow?.flowJson}
          title="Active dispositions"
        />
      </div>
    </SectionCard>
  );
};

export default DispositionSection;
