import { useState } from 'react';
import {
	ActionIcon,
	Button,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconBook2, IconPlus } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import AppDrawer from '~/components/AppDrawer';
import BaseTable from '~/components/BaseTable/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { usePagination } from '~/hooks/usePagination';
import type {
	PronunciationDictionary,
	PronunciationRule,
} from '~/models/PronunciationDictionaryModel';
import {
	usePronunciationDictionaries,
	useCreateDictionary,
	useDeleteDictionary,
	useSyncDictionary,
} from '~/queries/pronunciationDictionaryQueries';
import { useDictionaryTableColumns } from './useDictionaryTableColumns';
import { RuleList } from './RuleList';
import { RuleForm } from './RuleForm';
import styles from './DictionaryRulesPage.module.css';

export default function DictionaryRulesPage() {
	const { t } = useTranslation('dictionary-rules');

	// ── Data ──
	const pagination = usePagination({ initialItemsPerPage: 10 });
	const { limit, offset } = pagination.getApiParams();

	const {
		data: dictionariesResponse,
		isLoading: isDictionariesLoading,
		isFetching: isDictionariesFetching,
	} = usePronunciationDictionaries({ limit, offset });
	const dictionaries = dictionariesResponse?.data ?? [];
	const totalDictionaries = dictionariesResponse?.total ?? 0;
	const totalDictionaryPages =
		pagination.calculateTotalPages(totalDictionaries);
	const isTableLoading = isDictionariesLoading || isDictionariesFetching;

	const createDictionary = useCreateDictionary();
	const deleteDictionary = useDeleteDictionary();
	const syncDictionary = useSyncDictionary();

	// ── View state: list vs detail ──
	const [activeDictionary, setActiveDictionary] =
		useState<PronunciationDictionary | null>(null);

	// ── Create dictionary modal ──
	const [createDictOpened, { open: openCreateDict, close: closeCreateDict }] =
		useDisclosure(false);

	// ── Delete dictionary modal ──
	const [deleteDictOpened, { open: openDeleteDict, close: closeDeleteDict }] =
		useDisclosure(false);
	const [dictToDelete, setDictToDelete] =
		useState<PronunciationDictionary | null>(null);

	// ── Rule drawer ──
	const [ruleDrawerOpened, { open: openRuleDrawer, close: closeRuleDrawer }] =
		useDisclosure(false);
	const [selectedRule, setSelectedRule] = useState<PronunciationRule | null>(
		null
	);

	// ── Create dictionary form ──
	const dictForm = useForm({
		initialValues: { name: '', description: '' },
		validate: {
			name: (value) => (value.trim() ? null : t('dictionary.nameRequired')),
		},
	});

	// ── Dictionary actions ──

	const handleCreateDictionary = (values: {
		name: string;
		description: string;
	}) => {
		createDictionary.mutate(
			{
				name: values.name.trim(),
				...(values.description
					? { description: values.description.trim() }
					: {}),
			},
			{
				onSuccess: () => {
					notifications.show({
						title: t('dictionary.notifications.createSuccess'),
						message: t('dictionary.notifications.createSuccess'),
						color: 'green',
					});
					dictForm.reset();
					closeCreateDict();
				},
				onError: () => {
					notifications.show({
						title: t('dictionary.notifications.createError'),
						message: t('dictionary.notifications.createError'),
						color: 'red',
					});
				},
			}
		);
	};

	const handleOpenDeleteDict = (dict: PronunciationDictionary) => {
		setDictToDelete(dict);
		openDeleteDict();
	};

	const handleDeleteDictionary = () => {
		if (!dictToDelete) return;

		deleteDictionary.mutate(dictToDelete.id, {
			onSuccess: () => {
				notifications.show({
					title: t('dictionary.notifications.deleteSuccess'),
					message: t('dictionary.notifications.deleteSuccess'),
					color: 'green',
				});
				if (activeDictionary?.id === dictToDelete.id) {
					setActiveDictionary(null);
				}
				setDictToDelete(null);
				closeDeleteDict();
			},
			onError: () => {
				notifications.show({
					title: t('dictionary.notifications.deleteError'),
					message: t('dictionary.notifications.deleteError'),
					color: 'red',
				});
			},
		});
	};

	const handleSync = (dict: PronunciationDictionary) => {
		syncDictionary.mutate(dict.id, {
			onSuccess: () => {
				notifications.show({
					title: t('dictionary.notifications.syncSuccess'),
					message: t('dictionary.notifications.syncSuccess'),
					color: 'green',
				});
			},
			onError: () => {
				notifications.show({
					title: t('dictionary.notifications.syncError'),
					message: t('dictionary.notifications.syncError'),
					color: 'red',
				});
			},
		});
	};

	// ── Rule actions ──

	const handleEditRule = (rule: PronunciationRule) => {
		setSelectedRule(rule);
		openRuleDrawer();
	};

	const handleCreateRule = () => {
		setSelectedRule(null);
		openRuleDrawer();
	};

	const handleRuleDrawerClose = () => {
		closeRuleDrawer();
		setSelectedRule(null);
	};

	// ── Dictionary table columns ──
	const dictionaryColumns = useDictionaryTableColumns({
		onOpen: setActiveDictionary,
		onSync: handleSync,
		onDelete: handleOpenDeleteDict,
		isSyncing: syncDictionary.isPending,
	});

	// ── Create dictionary modal (shared between views) ──
	const createDictModal = (
		<Modal
			opened={createDictOpened}
			onClose={closeCreateDict}
			title={t('dictionary.create')}
		>
			<form onSubmit={dictForm.onSubmit(handleCreateDictionary)}>
				<Stack gap='sm'>
					<TextInput
						label={t('dictionary.name')}
						placeholder={t('dictionary.namePlaceholder')}
						required
						size='sm'
						key={dictForm.key('name')}
						{...dictForm.getInputProps('name')}
					/>
					<TextInput
						label={t('dictionary.descriptionLabel')}
						placeholder={t('dictionary.descriptionPlaceholder')}
						size='sm'
						key={dictForm.key('description')}
						{...dictForm.getInputProps('description')}
					/>
					<Group justify='flex-end' mt='sm'>
						<Button variant='default' size='sm' onClick={closeCreateDict}>
							{t('dictionary.deleteModal.cancel')}
						</Button>
						<Button
							type='submit'
							size='sm'
							loading={createDictionary.isPending}
						>
							{t('dictionary.create')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);

	// ── Delete dictionary confirmation (shared) ──
	const deleteDictModal = (
		<Modal
			opened={deleteDictOpened}
			onClose={closeDeleteDict}
			title={t('dictionary.deleteModal.title')}
		>
			<Stack>
				<Text>
					<Trans
						i18nKey='dictionary.deleteModal.message'
						t={t}
						values={{ name: dictToDelete?.name }}
						components={{ b: <b /> }}
					/>
				</Text>
				<Group justify='flex-end'>
					<Button variant='default' onClick={closeDeleteDict}>
						{t('dictionary.deleteModal.cancel')}
					</Button>
					<Button
						color='red'
						loading={deleteDictionary.isPending}
						onClick={handleDeleteDictionary}
					>
						{t('dictionary.deleteModal.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);

	// ═══════════════════════════════════════════════
	// VIEW: Dictionary detail (rules for one dictionary)
	// ═══════════════════════════════════════════════
	if (activeDictionary) {
		return (
			<Stack className={styles.pageRoot}>
				<SectionCard
					title={
						<Group gap='xs' align='center' wrap='nowrap'>
							<ActionIcon
								variant='subtle'
								color='gray'
								radius='md'
								size='sm'
								onClick={() => setActiveDictionary(null)}
								aria-label={t('dictionary.backToList')}
							>
								<IconArrowLeft size={18} />
							</ActionIcon>
							<span>{activeDictionary.name}</span>
						</Group>
					}
					description={activeDictionary.description || undefined}
					icon={IconBook2}
					actions={{
						primary: {
							kind: 'add',
							icon: IconPlus,
							label: t('rules.addRule'),
							onClick: handleCreateRule,
						},
					}}
				>
					<RuleList
						dictionaryId={activeDictionary.id}
						onEdit={handleEditRule}
					/>
				</SectionCard>

				<AppDrawer
					opened={ruleDrawerOpened}
					onClose={handleRuleDrawerClose}
					title={selectedRule ? t('form.editTitle') : t('form.createTitle')}
					size='lg'
				>
					<RuleForm
						dictionaryId={activeDictionary.id}
						initialData={selectedRule}
						onClose={handleRuleDrawerClose}
						onSuccess={handleRuleDrawerClose}
					/>
				</AppDrawer>

				{deleteDictModal}
			</Stack>
		);
	}

	// ═══════════════════════════════════════════════
	// VIEW: Dictionary list (default)
	// ═══════════════════════════════════════════════

	// Empty state
	if (
		!isDictionariesLoading &&
		dictionaries.length === 0 &&
		totalDictionaries === 0
	) {
		return (
			<SectionCard
				title={t('dictionary.title')}
				icon={IconBook2}
				actions={{
					primary: {
						kind: 'add',
						icon: IconPlus,
						label: t('dictionary.create'),
						onClick: openCreateDict,
					},
				}}
			>
				<div className={styles.emptyState}>
					<IconBook2
						size={48}
						stroke={1.2}
						color='var(--mantine-color-gray-5)'
					/>
					<Text size='lg' fw={500} c='dimmed'>
						{t('noDictionaries')}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('noDictionariesDescription')}
					</Text>
					<Button
						leftSection={<IconPlus size={16} />}
						size='sm'
						mt='sm'
						onClick={openCreateDict}
					>
						{t('dictionary.create')}
					</Button>
				</div>
				{createDictModal}
			</SectionCard>
		);
	}

	// List view
	return (
		<Stack className={styles.pageRoot}>
			<SectionCard
				title={t('dictionary.title')}
				description={t('dictionary.listDescription')}
				icon={IconBook2}
				actions={{
					primary: {
						kind: 'add',
						icon: IconPlus,
						label: t('dictionary.create'),
						onClick: openCreateDict,
					},
				}}
			>
				<BaseTable
					data={dictionaries}
					columns={dictionaryColumns}
					isLoading={isTableLoading}
					filterMode='server'
				/>
				<PaginationControls
					currentPage={pagination.currentPage}
					totalPages={totalDictionaryPages}
					itemsPerPage={pagination.itemsPerPage}
					totalItems={totalDictionaries}
					onPageChange={pagination.setCurrentPage}
					onItemsPerPageChange={(value) => {
						if (value) pagination.setItemsPerPage(parseInt(value, 10));
					}}
					isLoading={isTableLoading}
					itemLabel={t('dictionary.title').toLowerCase()}
				/>
			</SectionCard>

			{createDictModal}
			{deleteDictModal}
		</Stack>
	);
}
