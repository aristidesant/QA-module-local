import React from "react";
import { IconX } from "@tabler/icons-react";
import AgentForm from "../AgentForm";
import { Modal, Group, Title, ActionIcon, Box } from "@mantine/core";

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
  const handleSave = (agentData: Partial<any>) => {
    if (onSave) {
      onSave(agentData);
    }
    // Optionally close modal after save
    // onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} centered size="md" title={null}>
      <Group justify="space-between" align="center" mb="md">
        <Title order={3}>Create New Agent</Title>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onClose}
          aria-label="Close"
        >
          <IconX size={20} />
        </ActionIcon>
      </Group>
      <Box>
        <AgentForm
          agent={null}
          onSave={handleSave}
          loading={loading}
          error={error}
        />
      </Box>
    </Modal>
  );
};

export default AgentCreate;
