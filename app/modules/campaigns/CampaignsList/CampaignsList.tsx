import React, { useState } from "react";
import {
  Loader,
  Table,
  Text,
  Badge,
  ActionIcon,
  Menu,
  NumberFormatter,
  Stack,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconRocket,
  IconDetails,
  IconPlus,
} from "@tabler/icons-react";
import {
  useDeleteCampaign,
  useGetAllCampaigns,
} from "~/queries/campaignsQueries";
import styles from "./CampaignsList.module.css";
import { CampaignsDetails } from "../CampaignsDetails";
import SectionCard from "~/components/SectionCard";
import { modals } from "@mantine/modals";
import { CampaignsForm } from "../CampaignsForm/CampaignsForm";
import { notifications } from "@mantine/notifications";
import CampaignAgentList from "../CampaignAgentList";
import { useCampaignsStore } from "~/store/campaignsStore";
import CampaignPreview from "../CampaignPreview";
import type { Campaign } from "~/models/CampaignsModel";

export const CampaignsList: React.FC = () => {
  const { selectCampaign, selectedCampaign, setRightComponent } =
    useCampaignsStore((state) => state);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: reloadCampaigns,
  } = useGetAllCampaigns();
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const { mutateAsync: deleteCampaign, isPending: isDeleting } =
    useDeleteCampaign();

  if (isLoading || isFetching) {
    return (
      <div className={styles.loaderContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <IconAlertCircle size={32} color="red" />
        <Text c="red" mt="sm">
          {error instanceof Error ? error.message : "Failed to load campaigns."}
        </Text>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>
          <IconRocket size={64} stroke={1.2} />
        </div>
        <Text size="xl" fw={600} mt="xl" className={styles.emptyTitle}>
          No campaigns yet
        </Text>
        <Text size="md" c="dimmed" mt={8} className={styles.emptySubtitle}>
          Launch your first campaign to reach your audience
        </Text>
      </div>
    );
  }

  const handleCampaignClick = (campaign: Campaign) => {
    setCurrentCampaign(campaign);
    
    // Enhanced campaign data for the preview
    const enhancedCampaign: Campaign = {
      ...campaign,
      // Add mock stats
      stats: {
        callsMade: 1245,
        callsAnswered: 856,
        conversionRate: 12.5,
        avgCallDuration: '2:45',
        lastUpdated: new Date().toISOString(),
      },
      // Add mock agent performance
      agentPerformance: [
        { id: 1, name: 'John Doe', callsHandled: 245, successRate: 78, avgRating: 4.5 },
        { id: 2, name: 'Jane Smith', callsHandled: 198, successRate: 82, avgRating: 4.7 },
        { id: 3, name: 'Robert Johnson', callsHandled: 176, successRate: 71, avgRating: 4.2 },
      ],
      // Add mock assigned agents
      assignedAgents: [
        { 
          id: 1, 
          name: 'John Doe', 
          language: 'English', 
          countryCode: 'us', 
          status: 'online',
          avatarUrl: 'https://i.pravatar.cc/150?img=1'
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          language: 'Spanish', 
          countryCode: 'es', 
          status: 'busy',
          avatarUrl: 'https://i.pravatar.cc/150?img=2'
        },
      ],
      // Add mock contact list
      contactList: {
        id: 1,
        name: 'Q2 Leads',
        description: 'High priority leads for Q2 campaign',
        totalContacts: 1245,
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        source: 'csv',
        tags: ['high-priority', 'q2'],
        metadata: {
          headers: ['name', 'phone', 'email', 'company'],
          importedAt: new Date().toISOString(),
          importedBy: 'admin@example.com'
        }
      },
      // Add mock parameters
      parameters: {
        callingHours: {
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'America/New_York'
        },
        voicemailDetection: true,
        callRetries: 2,
        maxConcurrentCalls: 5,
        answerMachineDetection: true
      },
      // Add mock working hours
      workingHours: {
        monday: { enabled: true, from: '09:00', to: '17:00' },
        tuesday: { enabled: true, from: '09:00', to: '17:00' },
        wednesday: { enabled: true, from: '09:00', to: '17:00' },
        thursday: { enabled: true, from: '09:00', to: '17:00' },
        friday: { enabled: true, from: '09:00', to: '17:00' },
        saturday: { enabled: false, from: '09:00', to: '13:00' },
        sunday: { enabled: false, from: '09:00', to: '13:00' },
      },
      // Add mock tags if not present
      tags: campaign.tags || ['outbound', 'sales', 'q2-2023']
    };
    
    setRightComponent?.(<CampaignPreview campaign={enhancedCampaign} />);
  };

  return (
    <Stack className={styles.tableWrapper}>
      <SectionCard
        title="Campaigns"
        description="Manage your marketing campaigns"
        headerActions={
          <ActionIcon
            onClick={() => {
              modals.open({
                modalId: "create-campaign",
                title: "Create New Campaign",
                children: <CampaignsForm />,
                size: "lg",
                centered: true,
              });
            }}
          >
            <IconPlus size={20} />
          </ActionIcon>
        }
        icon={IconDetails}
      >
        <Table
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="sm"
          className={styles.table}
        >
          <Table.Thead className={styles.thead}>
            <Table.Tr>
              <Table.Th className={styles.thName}>Campaign</Table.Th>
              <Table.Th className={styles.thType}>Type</Table.Th>
              <Table.Th className={styles.thStatus}>Status</Table.Th>
              <Table.Th className={styles.thBudget}>Budget</Table.Th>
              <Table.Th className={styles.thActions}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((campaign) => (
              <Table.Tr
                key={campaign.id}
                className={
                  currentCampaign?.id === campaign.id
                    ? styles.rowSelected
                    : styles.row
                }
                onClick={() => handleCampaignClick(campaign)}
              >
                <Table.Td className={styles.campaignInfo}>
                  <div className={styles.campaignName}>{campaign.name}</div>
                  <div className={styles.campaignDescription}>
                    {campaign.description}
                  </div>
                </Table.Td>

                <Table.Td className={styles.typeCell}>
                  <Badge
                    variant="outline"
                    color={campaign.type === "OUTBOUND" ? "blue" : "violet"}
                    radius="sm"
                    size="sm"
                  >
                    {campaign.type.charAt(0) +
                      campaign.type.slice(1).toLowerCase()}
                  </Badge>
                </Table.Td>

                <Table.Td>
                  <Badge
                    variant="light"
                    color={
                      campaign.status === "ACTIVE"
                        ? "green"
                        : campaign.status === "PAUSED"
                        ? "yellow"
                        : "gray"
                    }
                    radius="md"
                    className={styles.statusBadge}
                  >
                    {campaign.status.charAt(0) +
                      campaign.status.slice(1).toLowerCase()}
                  </Badge>
                </Table.Td>

                <Table.Td className={styles.budgetCell}>
                  <NumberFormatter
                    value={campaign.budget}
                    decimalScale={2}
                    prefix="$"
                    className={styles.budgetValue}
                    fixedDecimalScale
                    decimalSeparator="."
                  />
                </Table.Td>

                <Table.Td>
                  <Menu shadow="md" width={160}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" radius="md">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        onClick={() => {
                          if (campaign.id === selectedCampaign?.id) {
                            selectCampaign(null);
                          } else {
                            selectCampaign(campaign);
                          }
                        }}
                        leftSection={<IconEye size={14} />}
                      >
                        {campaign?.id === selectedCampaign?.id
                          ? "Hide Details"
                          : "View Details"}
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => {
                          modals.open({
                            modalId: "edit-campaign",
                            title: `Edit Campaign: ${campaign.name}`,
                            children: <CampaignsForm campaign={campaign} />,
                            size: "lg",
                            centered: true,
                          });
                        }}
                        leftSection={<IconEdit size={14} />}
                      >
                        Edit Campaign
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        onClick={async () => {
                          modals.openConfirmModal({
                            title: "Delete Campaign",
                            children: (
                              <Text size="sm">
                                Are you sure you want to delete this campaign?
                              </Text>
                            ),
                            labels: { confirm: "Delete", cancel: "Cancel" },
                            confirmProps: { color: "red" },
                            onConfirm: async () => {
                              try {
                                await deleteCampaign(`${campaign.id}`);
                                reloadCampaigns();
                                selectCampaign(null);
                                notifications.show({
                                  title: "Campaign Deleted",
                                  message:
                                    "The campaign has been successfully deleted.",
                                  color: "green",
                                });
                              } catch (error) {
                                notifications.show({
                                  title: "Error",
                                  message:
                                    "Failed to delete campaign. Please try again.",
                                  color: "red",
                                });
                              }
                            },
                          });
                        }}
                        color="red"
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </SectionCard>
      {selectedCampaign?.id && (
        <>
          <CampaignsDetails campaignId={`${selectedCampaign?.id}`} />
          <CampaignAgentList campaignId={`${selectedCampaign?.id}`} />
        </>
      )}
    </Stack>
  );
};
