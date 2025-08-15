import React, { useState } from "react";
import AgentForm from "../AgentForm";
import {
  Modal,
  Box,
  Text,
  Stack,
  Group,
  Button,
  Paper,
  Center,
  ActionIcon,
} from "@mantine/core";
import {
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconChevronLeft,
} from "@tabler/icons-react";
import styles from "./AgentCreate.module.css";

interface AgentCreateProps {
  opened: boolean;
  onClose: () => void;
  onSave?: (agentData: Partial<any>) => void;
  loading?: boolean;
  error?: string | null;
}

const AgentCreate: React.FC<AgentCreateProps> = ({
  opened,
  onClose,
  onSave,
  loading = false,
  error = null,
}) => {
  const [agentType, setAgentType] = useState<"INBOUND" | "OUTBOUND">();

  const handleTypeSelect = (value: "INBOUND" | "OUTBOUND") => {
    setAgentType(value);
  };

  const handleSave = (agentData: Partial<any>) => {
    if (onSave) {
      onSave({ ...agentData, type: agentType });
    }
    // Optionally close modal after save
    // onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      title={<Text fw="bold">Create New Agent</Text>}
    >
      <Box>
        {!agentType ? (
          <Stack gap="lg" className={styles.container}>
            <Stack gap={4}>
              <Text fw={700} size="lg">
                Select Agent Type
              </Text>
              <Text size="sm" c="dimmed">
                Choose whether the agent will handle incoming requests or
                initiate outbound communications.
              </Text>
            </Stack>

            <Group grow className={styles.optionsGroup}>
              <Paper
                withBorder
                radius="md"
                className={`${styles.optionCard} ${styles.inbound}`}
                onClick={() => handleTypeSelect("INBOUND")}
                data-testid="inbound-card"
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleTypeSelect("INBOUND")
                }
              >
                <Center className={styles.iconWrap}>
                  <IconPhoneIncoming size={224} />
                </Center>
                <Stack align="center" gap={6} className={styles.cardContent}>
                  <Text fw={700} className={styles.optionLabel}>
                    Inbound
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Handles incoming requests or communications initiated by
                    customers.
                  </Text>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius="md"
                className={`${styles.optionCard} ${styles.outbound}`}
                onClick={() => handleTypeSelect("OUTBOUND")}
                data-testid="outbound-card"
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleTypeSelect("OUTBOUND")
                }
              >
                <Center className={styles.iconWrap}>
                  <IconPhoneOutgoing size={224} />
                </Center>
                <Stack align="center" gap={6} className={styles.cardContent}>
                  <Text fw={700} className={styles.optionLabel}>
                    Outbound
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Initiates contact such as follow-ups, outreach, or
                    notifications.
                  </Text>
                </Stack>
              </Paper>
            </Group>

            <Group className={styles.rightAlign}>
              <Button variant="subtle" onClick={onClose} size="sm">
                Cancel
              </Button>
            </Group>
          </Stack>
        ) : (
          <Box>
            <Group className={styles.headerRow}>
              <Group gap="xs">
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => setAgentType(undefined)}
                  aria-label="Back"
                >
                  <IconChevronLeft size={18} />
                </ActionIcon>
                <Text fw={700}>
                  {agentType === "INBOUND" ? "Inbound Agent" : "Outbound Agent"}
                </Text>
              </Group>
              <Button variant="subtle" size="sm" onClick={onClose}>
                Close
              </Button>
            </Group>

            <AgentForm
              agent={null}
              type={agentType}
              onSave={handleSave}
              loading={loading}
              error={error}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AgentCreate;
