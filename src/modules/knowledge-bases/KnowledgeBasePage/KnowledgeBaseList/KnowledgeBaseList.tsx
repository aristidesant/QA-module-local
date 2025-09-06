import { useMemo, useState } from 'react';
import styles from './KnowledgeBaseList.module.css';
import {
  Button,
  Text,
  ActionIcon,
  Badge,
  TextInput,
  Card,
  Tooltip,
  Select,
  Skeleton,
  Flex,
} from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconDownload,
  IconRefresh,
  IconAlertTriangle,
  IconFileText,
  IconExternalLink,
  IconArticle,
} from '@tabler/icons-react';
import { KnowledgeBaseType, KnowledgeBaseStatus } from '~/models/KnowledgeBaseModel';
import {
  useKnowledgeBases,
  useDeleteKnowledgeBase,
  useRetryKnowledgeBase,
} from '~/queries/knowledgeBaseQueries';
import useKnowledgeBaseStore from '../store/knowledgeBaseStore';
import KnowledgeBaseForm from '../KnowledgeBaseForm/KnowledgeBaseForm';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import type { KnowledgeBaseModel } from '~/models/KnowledgeBaseModel';
import BaseTable from '~/components/BaseTable';
import dayjs from 'dayjs';

const truncate = (s: string | undefined, n = 80) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '');

const statusConfig = {
  PENDING: { color: 'orange', icon: IconAlertTriangle },
  UPLOADING: { color: 'blue', icon: IconRefresh },
  ACTIVE: { color: 'green', icon: IconFileText },
  FAILED: { color: 'red', icon: IconAlertTriangle },
  INACTIVE: { color: 'gray', icon: IconFileText },
} as const;

const formatDate = (iso?: string | null) => (iso ? dayjs(iso).format('YYYY-MM-DD HH:mm') : '-');

const KnowledgeBaseList = () => {
  const setRight = useKnowledgeBaseStore((s) => s.setRightComponent);
  const { data: items = [], isLoading, refetch } = useKnowledgeBases();
  const deleteMutation = useDeleteKnowledgeBase();
  const retryMutation = useRetryKnowledgeBase();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((i: KnowledgeBaseModel) => {
      const matchesQuery = !q
        || (i.name || '').toLowerCase().includes(q)
        || (i.description || '').toLowerCase().includes(q);
      const matchesStatus = !statusFilter || i.status === statusFilter;
      const matchesType = !typeFilter || i.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [items, query, statusFilter, typeFilter]);

  const columnHelper = createColumnHelper<KnowledgeBaseModel>();

  const columns = useMemo<ColumnDef<KnowledgeBaseModel, any>[]>(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Knowledge base',
        cell: ({ row }) => {
          const item = row.original;
          const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.INACTIVE;
          const StatusIcon = config.icon;

          return (
            <div className={styles.knowledgeBaseCell}>
              <div className={styles.cellContent}>
                <div className={styles.leftSection}>
                  <div className={styles.titleRow}>
                    <div className={styles.typeIcon}>
                      {item.type === KnowledgeBaseType.FILE ? (
                        <IconFileText size={20} className={styles.typeIconSvg} />
                      ) : item.type === KnowledgeBaseType.URL ? (
                        <IconExternalLink size={20} className={styles.typeIconSvg} />
                      ) : (
                        <IconArticle size={20} className={styles.typeIconSvg} />
                      )}
                    </div>
                    <div className={styles.titleContent}>
                      <Text fw={600} className={styles.knowledgeBaseName} title={item.name}>
                        {item.name}
                      </Text>
                      {item.description && (
                        <Text size="sm" className={styles.description} title={item.description}>
                          {truncate(item.description, 120)}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.rightSection}>
                  <div className={styles.statusSection}>
                    <Badge
                      variant="light"
                      color={config.color}
                      size="sm"
                      className={styles.statusBadge}
                      leftSection={<StatusIcon size={12} />}
                    >
                      {item.status}
                    </Badge>
                    {item.uploadError && (
                      <Tooltip
                        label={<pre className={styles.errorTooltip}>{item.uploadError}</pre>}
                        multiline
                        maw={400}
                      >
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          className={styles.errorIcon}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconAlertTriangle size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </div>
                  <Text size="xs" c="dimmed" className={styles.metadata}>
                    Created {formatDate(item.createdAt)}
                  </Text>
                </div>
              </div>
            </div>
          );
        },
        size: 600,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
              <Flex gap={"xs"}>
                {item.file?.repositoryRoute || item.sourceUrl ? (
                  <Tooltip label="Download file" position="top">
                    <ActionIcon
                      component="a"
                      href={(item.file?.repositoryRoute as string) || (item.sourceUrl as string)}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="subtle"
                      className={styles.actionButton}
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Tooltip>
                ) : null}

                {(item.status === KnowledgeBaseStatus.FAILED || !!item.uploadError) && (
                  <Tooltip label="Retry upload" position="top">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      className={styles.actionButton}
                      onClick={async () => {
                        try {
                          await retryMutation.mutateAsync(Number(item.id));
                          refetch();
                        } catch (_) {
                          // handled by mutation
                        }
                      }}
                      disabled={retryMutation?.status === 'pending'}
                      loading={retryMutation?.status === 'pending'}
                    >
                      <IconRefresh size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}

                <Tooltip label="Edit knowledge base" position="top">
                  <ActionIcon
                    onClick={() =>
                      setRight(
                        <KnowledgeBaseForm
                          initialData={{ ...item, description: item.description ?? undefined }}
                        />
                      )
                    }
                    size="sm"
                    variant="subtle"
                    className={styles.actionButton}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Delete knowledge base" position="top">
                  <ActionIcon
                    color="red"
                    onClick={() =>
                      openConfirmModal({
                        title: 'Delete Knowledge Base',
                        children: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
                        labels: { confirm: 'Delete', cancel: 'Cancel' },
                        confirmProps: { color: 'red' },
                        onConfirm: () => deleteMutation.mutate(Number(item.id)),
                      })
                    }
                    size="sm"
                    variant="subtle"
                    className={styles.deleteButton}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Flex>
            </div>
          );
        },
        size: 120,
        meta: { headerClassName: styles.actionsTh, cellClassName: styles.actionsTd },
      }),
    ],
    [retryMutation, deleteMutation, setRight, refetch]
  );

  const total = items?.length ?? 0;
  const count = filtered.length;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Knowledge Base</h1>
          <Text className={styles.pageDescription}>
            Manage collections of documents used by your agents
          </Text>
        </div>
        <div className={styles.actionsSection}>
          <Button
            onClick={() => setRight(<KnowledgeBaseForm />)}
            leftSection={<IconPlus size={18} />}
            size="md"
            className={styles.primaryButton}
          >
            New Knowledge Base
          </Button>
        </div>
      </div>

      <Card radius="lg" className={styles.contentCard}>
        <div className={styles.toolbar}>
          <div className={styles.filtersGroup}>
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Search knowledge bases..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              size="sm"
              className={styles.searchInput}
            />

            <div className={styles.selectFilters}>
              <Select
                placeholder="All statuses"
                data={[
                  { value: '', label: 'All statuses' },
                  ...Object.values(KnowledgeBaseStatus).map((s) => ({ value: s, label: s })),
                ]}
                value={statusFilter ?? ''}
                onChange={(val) => setStatusFilter(val || null)}
                size="sm"
                className={styles.filterSelect}
                allowDeselect
                checkIconPosition="right"
              />

              <Select
                placeholder="All types"
                data={[
                  { value: '', label: 'All types' },
                  ...Object.values(KnowledgeBaseType).map((t) => ({ value: t, label: t })),
                ]}
                value={typeFilter ?? ''}
                onChange={(val) => setTypeFilter(val || null)}
                size="sm"
                className={styles.filterSelect}
                allowDeselect
                checkIconPosition="right"
              />
            </div>
          </div>

          <div className={styles.toolbarActions}>
            <Text size="sm" className={styles.resultsCounter}>
              {count} of {total} items
            </Text>
            <Button
              onClick={() => refetch()}
              variant="subtle"
              size="sm"
              leftSection={<IconRefresh size={16} />}
              className={styles.refreshButton}
            >
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.skeletonWrap}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} height={64} mb={12} radius="md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <IconFileText size={48} className={styles.emptyIcon} />
              <Text fw={600} size="lg" className={styles.emptyTitle}>No knowledge bases found</Text>
              <Text size="sm" c="dimmed" className={styles.emptyDescription}>
                Create your first knowledge base to surface documents to agents.
              </Text>
              <Button
                mt="lg"
                onClick={() => setRight(<KnowledgeBaseForm />)}
                leftSection={<IconPlus size={18} />}
                size="md"
              >
                Create Knowledge Base
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <BaseTable<KnowledgeBaseModel>
              data={filtered}
              columns={columns}
              initialSort={[{ id: 'name', desc: false }]}
              onRowClick={(row) =>
                setRight(
                  <KnowledgeBaseForm initialData={{ ...row, description: row.description ?? undefined }} />
                )
              }
              className={styles.baseTable}
              density="default"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default KnowledgeBaseList;
