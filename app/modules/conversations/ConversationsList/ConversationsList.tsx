import { useMemo } from 'react';
import { Box, Table, Text, Badge, rem, type MantineStyleProp, Loader, Center } from '@mantine/core';
import { useGetConversations } from '~/queries/conversationsQueries';
import { useConversationStore } from '~/stores/useConversationStore';
import { format, parseISO } from 'date-fns';
import { IconPhoneCall, IconCheck, IconX, IconUser } from '@tabler/icons-react';
import { ConversationDetails } from '../ConversationDetails/ConversationDetails';
import type { ConversationsModel } from '~/models/ConversationsModels';
import styles from './ConversationsList.module.css';

// Define the styles as MantineStyleProp objects
const tableStyles: MantineStyleProp = {
  backgroundColor: 'var(--mantine-color-white)',
  borderRadius: 'var(--mantine-radius-md)',
  boxShadow: 'var(--mantine-shadow-sm)',
  overflow: 'hidden',
};

const headerStyles: MantineStyleProp = {
  backgroundColor: 'var(--mantine-color-gray-0)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: 600,
  color: 'var(--mantine-color-gray-7)',
};

const rowStyles = (isSelected: boolean): MantineStyleProp => ({
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: 'var(--mantine-color-gray-0)',
  },
  ...(isSelected && {
    backgroundColor: 'rgba(228, 240, 255, 0.4)',
    borderLeft: `${rem(3)} solid var(--mantine-color-blue-6)`,
  }),
});

const statusBadgeStyles: MantineStyleProp = {
  textTransform: 'none',
  letterSpacing: '0.5px',
};

const phoneNumberStyles: MantineStyleProp = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--mantine-spacing-xs)',
};

export function ConversationsList() {
  const { data: conversations, isLoading } = useGetConversations();
  const { selectedId, setSelection } = useConversationStore();
  
  const typedConversations = conversations as ConversationsModel[] | undefined;

  const rows = useMemo(() => {
    if (!typedConversations) return [];
    
    return typedConversations.map((conversation) => {
      const contactName = conversation.contact?.name || 'Unknown';
      const contactPhone = conversation.contact?.phoneNumber || 'N/A';
      const agentName = conversation.agent?.name || 'N/A';
      const statusDisplay = conversation.status?.toLowerCase() || 'unknown';
      const isActive = statusDisplay === 'in_progress' || statusDisplay === 'active';
      const isCompleted = statusDisplay === 'completed' || statusDisplay === 'done';
      
      return (
        <Table.Tr
          key={conversation.id}
          style={rowStyles(selectedId === conversation.id)}
          onClick={() => {
            setSelection(conversation.id, <ConversationDetails {...conversation} />);
          }}
        >
          <Table.Td>
            <Box style={phoneNumberStyles}>
              <IconPhoneCall size={16} color="var(--mantine-color-gray-6)" />
              <Text>{String(contactPhone || '')}</Text>
            </Box>
          </Table.Td>
          <Table.Td>
            <Text>{String(contactName || '')}</Text>
          </Table.Td>
          <Table.Td>
            <Badge
              color={isActive ? 'blue' : isCompleted ? 'green' : 'gray'}
              variant="light"
              style={statusBadgeStyles}
              leftSection={
                isCompleted ? (
                  <IconCheck size={12} />
                ) : (
                  <IconX size={12} />
                )
              }
            >
              {statusDisplay}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Text>{agentName}</Text>
          </Table.Td>
          <Table.Td>
            <Text>
              {conversation.startDate ? format(parseISO(conversation.startDate), 'MMM d, yyyy h:mm a') : 'N/A'}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    });
  }, [typedConversations, selectedId, setSelection]);

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (!typedConversations || typedConversations.length === 0) {
    return (
      <Center p="xl">
        <Text c="dimmed">No conversations found</Text>
      </Center>
    );
  }

  return (
    <Box style={tableStyles}>
      <Table highlightOnHover>
        <Table.Thead style={headerStyles}>
          <Table.Tr>
            <Table.Th>Phone Number</Table.Th>
            <Table.Th>Contact</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Agent</Table.Th>
            <Table.Th>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  );
}

export default ConversationsList;