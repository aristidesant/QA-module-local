import { useCallback, useMemo, useState } from "react";
import { Table, Loader, Center, Text, Box, Stack } from "@mantine/core";
import { useGetConversations } from "~/queries/conversationsQueries";
import { useConversationStore } from "~/stores/useConversationStore";
import { ConversationDetails } from "../ConversationDetails/ConversationDetails";
import type { ConversationsModel } from "~/models/ConversationsModels";
import SectionCard from "~/components/SectionCard";
import { useConversationsTable } from "./useConversationsTable";
import { TableHeader } from "./components/TableHeader";
import { TableBody } from "./components/TableBody";
import { TablePagination } from "./components/TablePagination";
import { TableToolbar } from "./components/TableToolbar";
import styles from "./ConversationsList.module.css";

export function ConversationsList() {
  const { data: conversations, isLoading, refetch } = useGetConversations();
  const { selectedId, setSelection } = useConversationStore();

  // Memoize the typed conversations to prevent unnecessary re-renders
  const typedConversations = useMemo(
    () => conversations as ConversationsModel[] | undefined,
    [conversations]
  );

  // Stable callback for row clicks
  const handleRowClick = useCallback(
    (conversation: ConversationsModel) => {
      setSelection(
        conversation.id,
        <ConversationDetails conversation={conversation} />
      );
    },
    [setSelection]
  );

  // Stable callback for refetch
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const [globalFilter, setGlobalFilter] = useState("");

  const { table, getRowProps, pageSizeOptions, totalRows, currentPageRows } =
    useConversationsTable({
      data: typedConversations,
      onRowClick: handleRowClick,
      selectedRowId: selectedId,
      globalFilter,
      onGlobalFilterChange: setGlobalFilter,
    });

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
    <SectionCard
      title="Conversations"
      description="Click on a conversation to view details"
    >
      <Stack gap={0}>
        <Box className={styles.tableContainer}>
          <TableToolbar
            table={table}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            onRefresh={handleRefresh}
          />

          <Table
            highlightOnHover
            withTableBorder
            verticalSpacing="xs"
            horizontalSpacing="md"
            className={styles.table}
          >
            <TableHeader headers={table.getHeaderGroups()[0]?.headers || []} />
            <TableBody
              rows={currentPageRows || []}
              getRowProps={getRowProps}
              isLoading={isLoading}
              isEmpty={(currentPageRows?.length || 0) === 0}
            />
          </Table>

          <TablePagination
            table={table}
            totalRows={totalRows}
            pageSizeOptions={pageSizeOptions}
          />
        </Box>
      </Stack>
    </SectionCard>
  );
}

export default ConversationsList;
