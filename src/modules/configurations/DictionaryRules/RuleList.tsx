import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	CloseButton,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconFilter, IconSearch } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { usePagination } from '~/hooks/usePagination';
import type { PronunciationRule } from '~/models/PronunciationDictionaryModel';
import {
	usePronunciationRules,
	useDeleteRule,
} from '~/queries/pronunciationDictionaryQueries';
import { useRuleTableColumns } from './useRuleTableColumns';
import styles from './RuleList.module.css';

interface RuleListProps {
	dictionaryId: number;
	onEdit: (rule: PronunciationRule) => void;
}

const RULE_TYPE_OPTIONS = [
	{ label: 'Alias', value: 'ALIAS' },
	{ label: 'Phoneme', value: 'PHONEME' },
];

export function RuleList({ dictionaryId, onEdit }: RuleListProps) {
	const { t } = useTranslation('dictionary-rules');
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState<string | null>(null);

	const activeFiltersCount = (search ? 1 : 0) + (typeFilter ? 1 : 0);
	const hasActiveFilters = activeFiltersCount > 0;

	const pagination = usePagination({ initialItemsPerPage: 10 });
	const { limit, offset } = pagination.getApiParams();

	const {
		data: rulesResponse,
		isLoading,
		isFetching,
	} = usePronunciationRules(dictionaryId, { limit, offset });
	const rules = rulesResponse?.data ?? [];
	const totalRules = rulesResponse?.total ?? 0;
	const totalPages = pagination.calculateTotalPages(totalRules);
	const isTableLoading = isLoading || isFetching;

	const { mutate: removeRule, isPending: isDeleting } =
		useDeleteRule(dictionaryId);
	const [deleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] =
		useDisclosure(false);
	const [ruleToDelete, setRuleToDelete] = useState<PronunciationRule | null>(
		null
	);

	const handleDelete = (rule: PronunciationRule) => {
		setRuleToDelete(rule);
		openDeleteModal();
	};

	const confirmDelete = () => {
		if (ruleToDelete) {
			removeRule(ruleToDelete.id, {
				onSuccess: () => {
					notifications.show({
						title: t('rules.notifications.deleteSuccess'),
						message: t('rules.notifications.deleteSuccess'),
						color: 'green',
					});
					closeDeleteModal();
					setRuleToDelete(null);
				},
				onError: () => {
					notifications.show({
						title: t('rules.notifications.deleteError'),
						message: t('rules.notifications.deleteError'),
						color: 'red',
					});
				},
			});
		}
	};

	const columns = useRuleTableColumns({ onEdit, onDelete: handleDelete });

	// Client-side filtering
	const filteredRules = useMemo(() => {
		let result = rules;

		if (search) {
			const lowerSearch = search.toLowerCase();
			result = result.filter(
				(r) =>
					r.grapheme.toLowerCase().includes(lowerSearch) ||
					r.alias?.toLowerCase().includes(lowerSearch) ||
					r.phoneme?.toLowerCase().includes(lowerSearch) ||
					r.description?.toLowerCase().includes(lowerSearch)
			);
		}

		if (typeFilter) {
			result = result.filter((r) => r.ruleType === typeFilter);
		}

		return result;
	}, [rules, search, typeFilter]);

	const totalCount = totalRules;

	return (
		<Stack className={styles.listRoot}>
			<div className={styles.toolbar}>
				<div className={styles.toolbarMain}>
					<TextInput
						className={styles.searchInput}
						placeholder={t('rules.searchPlaceholder')}
						leftSection={<IconSearch size={16} />}
						value={search}
						rightSection={
							search ? (
								<CloseButton
									size='sm'
									onClick={() => setSearch('')}
									aria-label={t('rules.clearSearch')}
								/>
							) : null
						}
						onChange={(event) => setSearch(event.currentTarget.value)}
						size='sm'
						radius='md'
					/>
					<Select
						className={styles.typeSelect}
						placeholder={t('rules.filterType')}
						data={RULE_TYPE_OPTIONS}
						value={typeFilter}
						onChange={setTypeFilter}
						clearable
						size='sm'
						radius='md'
					/>
				</div>
				<div className={styles.toolbarMeta}>
					<Badge
						leftSection={<IconFilter size={12} />}
						variant='light'
						color={hasActiveFilters ? 'blue' : 'gray'}
						radius='sm'
						className={styles.badge}
					>
						{hasActiveFilters
							? t('rules.activeFilters', { count: activeFiltersCount })
							: t('rules.noActiveFilters')}
					</Badge>
					<Badge variant='dot' color='gray' radius='sm'>
						{t('rules.totalItems', { count: totalCount })}
					</Badge>
					{hasActiveFilters ? (
						<Button
							variant='subtle'
							size='compact-sm'
							className={styles.clearButton}
							onClick={() => {
								setSearch('');
								setTypeFilter(null);
							}}
						>
							{t('rules.clearFilters')}
						</Button>
					) : null}
				</div>
			</div>

			<div className={styles.tableFrame}>
				<BaseTable
					data={filteredRules}
					columns={columns}
					isLoading={isTableLoading}
					filterMode='server'
				/>
			</div>

			<PaginationControls
				currentPage={pagination.currentPage}
				totalPages={totalPages}
				itemsPerPage={pagination.itemsPerPage}
				totalItems={totalRules}
				onPageChange={pagination.setCurrentPage}
				onItemsPerPageChange={(value) => {
					if (value) pagination.setItemsPerPage(parseInt(value, 10));
				}}
				isLoading={isTableLoading}
				itemLabel={t('rules.title').toLowerCase()}
			/>

			<Modal
				opened={deleteModalOpen}
				onClose={closeDeleteModal}
				title={t('rules.deleteModal.title')}
			>
				<Stack>
					<Text>
						<Trans
							i18nKey='rules.deleteModal.message'
							t={t}
							values={{ grapheme: ruleToDelete?.grapheme }}
							components={{ b: <b /> }}
						/>
					</Text>
					<Group justify='flex-end'>
						<Button variant='default' onClick={closeDeleteModal}>
							{t('rules.deleteModal.cancel')}
						</Button>
						<Button color='red' loading={isDeleting} onClick={confirmDelete}>
							{t('rules.deleteModal.confirm')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
}
