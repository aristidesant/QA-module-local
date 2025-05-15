import React, { useState } from "react";
import AgentForm from "../AgentForm";
import { Modal, Box, Text, Stack, Card, Group } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";

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
      size="md"
      title={<Text fw="bold">Create New Agent</Text>}
    >
      <Box>
        {!agentType ? (
          <Stack align="center" gap="md">
            <Text fw={500} mb="xs">
              Select Agent Type
            </Text>
            <Group grow>
              <Card
                withBorder
                shadow="sm"
                radius="md"
                onClick={() => handleTypeSelect("INBOUND")}
                style={{
                  cursor: "pointer",
                  borderColor: "#228be6",
                  borderWidth: 1,
                }}
                data-testid="inbound-card"
              >
                <Stack align="center" gap={4}>
                  <IconArrowDown size={32} color="#228be6" />
                  <Text fw={600}>INBOUND</Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Agents that handle incoming requests or communications
                    initiated by users or customers.
                  </Text>
                </Stack>
              </Card>
              <Card
                withBorder
                shadow="sm"
                radius="md"
                onClick={() => handleTypeSelect("OUTBOUND")}
                style={{
                  cursor: "pointer",
                  borderColor: "#fa5252",
                  borderWidth: 1,
                }}
                data-testid="outbound-card"
              >
                <Stack align="center" gap={4}>
                  <IconArrowUp size={32} color="#fa5252" />
                  <Text fw={600}>OUTBOUND</Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Agents that initiate contact or actions towards users, such
                    as follow-ups or outreach.
                  </Text>
                </Stack>
              </Card>
            </Group>
          </Stack>
        ) : (
          <AgentForm
            agent={null}
            type={agentType}
            onSave={handleSave}
            loading={loading}
            error={error}
          />
        )}
      </Box>
    </Modal>
  );
};

export default AgentCreate;
