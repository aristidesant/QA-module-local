import React from "react";
import AgentForm from "../AgentForm";
import { Modal, Group, Title, ActionIcon, Box, Text } from "@mantine/core";

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
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      title={<Text fw="bold">Create New Agent</Text>}
    >
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
