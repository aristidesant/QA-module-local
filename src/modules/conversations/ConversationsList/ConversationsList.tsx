import { useCallback, useState } from "react";
import { Table, Loader, Center, Text, Box, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
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
  const {
    data: typedConversations,
    isLoading,
    isError,
    refetch: handleRefresh,
  } = useGetConversations();
  const { selectedId, setSelection } = useConversationStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  const [globalFilter, setGlobalFilter] = useState("");

  const { table, getRowProps, pageSizeOptions, totalRows, currentPageRows } =
    useConversationsTable({
  data: typedConversations,
      onRowClick: handleRowClick,
      selectedRowId: selectedId,
      globalFilter,
      onGlobalFilterChange: setGlobalFilter,
    });
  console.log("Elements");
  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center p="xl">
        <Text c="red">Error loading conversations</Text>
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

  // Dynamic minWidth based on screen size
  const getMinWidth = () => {
    if (isMobile) return 500;
    return 700;
  };

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

          {/* Responsive scroll container for the table */}
          <Table.ScrollContainer
            minWidth={getMinWidth()}
            className={styles.scrollContainer}
            type="native"
          >
            <Table
              highlightOnHover
              withTableBorder
              verticalSpacing={isMobile ? "xs" : "sm"}
              horizontalSpacing={isMobile ? "xs" : "md"}
              className={styles.table}
            >
              <TableHeader
                headers={table.getHeaderGroups()[0]?.headers || []}
              />
              <TableBody
                rows={currentPageRows || []}
                getRowProps={getRowProps}
                isLoading={isLoading}
                isEmpty={(currentPageRows?.length || 0) === 0}
              />
            </Table>
          </Table.ScrollContainer>

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
