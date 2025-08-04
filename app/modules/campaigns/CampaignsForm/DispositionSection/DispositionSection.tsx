import React from "react";
import { Button, Flex, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useQueryClient } from "@tanstack/react-query";
import { useDispositionCatalogs } from "~/queries/dispositionCatalogQueries";
import SectionCard from "~/components/SectionCard";
import DispositionForm from "./DispositionForm";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { useDispositionFlowsByCampaignPath } from "~/queries/dispositionFlowQueries";
import { notifications } from "@mantine/notifications";
import DispositionViewer from "./DispositionViewer";

const DispositionSection: React.FC = () => {
  const { selectedCampaign } = useCampaignsStore();

  const {
    data: currentDispositionFlow,
    isLoading: isLoadingCurrentFlow,
    refetch: refetchCurrentFlow,
  } = useDispositionFlowsByCampaignPath(selectedCampaign?.id);

  const handleOpenModal = (isEdit: boolean) => {
    modals.open({
      modalId: "disposition-form",
      size: "100vw",
      fullScreen: true,
      children: (
        <DispositionForm
          catalog={isEdit ? currentDispositionFlow ?? {} : {}}
          onComplete={() => {
            refetchCurrentFlow();
            modals.close("disposition-form");
            notifications.show({
              title: "Success",
              message: "Disposition flow saved successfully.",
              color: "green",
            });
          }}
        />
      ),
    });
  };

  const hasFlow = Boolean(currentDispositionFlow?.flowJson?.id);

  return (
    <SectionCard
      title="Disposition Configuration"
      headerActions={
        <Flex>
          {hasFlow ? (
            <Button
              onClick={() => handleOpenModal(true)}
              loading={isLoadingCurrentFlow}
            >
              Edit disposition
            </Button>
          ) : (
            <Button onClick={() => handleOpenModal(false)}>
              Add disposition
            </Button>
          )}
        </Flex>
      }
      description="Set up call dispositions for this campaign. Drag items from the catalog to build your disposition structure."
    >
      {currentDispositionFlow ? (
        <DispositionViewer flow={currentDispositionFlow} />
      ) : (
        <Text>No disposition flow found.</Text>
      )}
    </SectionCard>
  );
};

export default DispositionSection;
