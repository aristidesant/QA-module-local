import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Alert,
	Badge,
	Box,
	Button,
	Center,
	Checkbox,
	Collapse,
	Divider,
	Group,
	Loader,
	Modal,
	Paper,
	Radio,
	ScrollArea,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconAlertCircle,
	IconCalendarEvent,
	IconChevronDown,
	IconChevronRight,
	IconFileExport,
	IconRefresh,
	IconSearch,
} from '@tabler/icons-react';
import type { CampaignContactList } from '~/models/ContactGroup';
import type {
	CampaignSelectionScope,
	ExportReportTemplateDto,
} from '~/models/ReportValue';
import { useGetCampaignsBySchemaId } from '~/queries/campaignContactSchemasQueries';
import { useGetSimpleCampaigns } from '~/queries/campaignsQueries';
import { useGetCampaignContactLists } from '~/queries/contactGroupQueries';
import { getErrorMessage } from '~/utils/httpClient';
import styles from './CampaignPickerModal.module.css';

const ACTIVE_LIST_PARAMS = { isActive: true as const };

export type ExportData = ExportReportTemplateDto;

interface CampaignOption {
	id: number;
	name: string;
}

interface CampaignSelectionState {
	campaignId: number;
	name: string;
	selected: boolean;
	expanded: boolean;
	scope: CampaignSelectionScope;
	listsLoaded: boolean;
	listsLoading: boolean;
	listsError: string | null;
	availableLists: CampaignContactList[];
	selectedListIds: number[];
	search: string;
}

interface CampaignPickerModalProps {
	opened: boolean;
	onClose: () => void;
	templateId: number;
	templateSchemaId?: number | null;
	onSubmit: (data: ExportData) => Promise<void>;
	isSubmitting?: boolean;
}

interface CampaignSelectionCardProps {
	campaign: CampaignSelectionState;
	onToggleSelected: (campaignId: number) => void;
	onToggleExpanded: (campaignId: number) => void;
	onChangeScope: (campaignId: number, scope: CampaignSelectionScope) => void;
	onToggleList: (campaignId: number, listId: number) => void;
	onSearchChange: (campaignId: number, value: string) => void;
	onListsLoaded: (campaignId: number, lists: CampaignContactList[]) => void;
	onListsLoadingChange: (campaignId: number, loading: boolean) => void;
	onListsErrorChange: (campaignId: number, error: string | null) => void;
}

const getLocalDateString = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const normalizeDateValue = (value: unknown): Date | null => {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	if (typeof value === 'string' || typeof value === 'number') {
		const parsedDate = new Date(value);
		return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
	}

	return null;
};

const createDefaultFormValues = () => {
	const endDate = new Date();
	const startDate = new Date(endDate);
	startDate.setDate(endDate.getDate() - 30);

	return {
		startDate,
		endDate,
		format: 'csv' as const,
	};
};

const createInitialCampaignStates = (
	campaigns: CampaignOption[]
): CampaignSelectionState[] =>
	campaigns.map((campaign) => ({
		campaignId: campaign.id,
		name: campaign.name,
		selected: false,
		expanded: false,
		scope: 'all',
		listsLoaded: false,
		listsLoading: false,
		listsError: null,
		availableLists: [],
		selectedListIds: [],
		search: '',
	}));

const formatDisplayDate = (value: string) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString();
};

const areListsEqual = (
	left: CampaignContactList[],
	right: CampaignContactList[]
) =>
	left.length === right.length &&
	left.every(
		(list, index) =>
			list.id === right[index]?.id &&
			list.name === right[index]?.name &&
			list.createAt === right[index]?.createAt
	);

const buildCampaignSummary = (
	campaign: CampaignSelectionState,
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	if (!campaign.selected) return t('export.notSelected');
	if (campaign.scope === 'all') return t('export.entireCampaign');
	if (campaign.listsLoading) return t('export.listsLoading');
	if (campaign.listsError) return t('export.listsLoadFailed');
	if (!campaign.listsLoaded) return t('export.listsLoading');
	if (campaign.availableLists.length === 0)
		return t('export.noActiveListsAvailable');
	if (campaign.selectedListIds.length === 0) return t('export.chooseLists');
	return campaign.selectedListIds.length === 1
		? t('export.listsSelectedSummary_one')
		: t('export.listsSelectedSummary_other', {
				count: campaign.selectedListIds.length,
			});
};

const buildCampaignScopeBadge = (
	campaign: CampaignSelectionState,
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	if (!campaign.selected) {
		return { label: t('export.notSelected'), color: 'gray' as const };
	}

	if (campaign.scope === 'all') {
		return { label: t('export.entireCampaign'), color: 'blue' as const };
	}

	if (campaign.listsError) {
		return { label: t('export.listsLoadFailed'), color: 'red' as const };
	}

	if (campaign.listsLoaded && campaign.availableLists.length === 0) {
		return {
			label: t('export.noActiveListsAvailable'),
			color: 'gray' as const,
		};
	}

	return { label: t('export.specificLists'), color: 'teal' as const };
};

const buildPayload = (
	values: {
		startDate: Date | null;
		endDate: Date | null;
		format: 'csv' | 'xlsx';
	},
	campaignStates: CampaignSelectionState[]
): ExportData => {
	if (!values.startDate || !values.endDate) {
		throw new Error('Missing date values');
	}

	return {
		startDate: getLocalDateString(values.startDate),
		endDate: getLocalDateString(values.endDate),
		format: values.format,
		campaignSelections: campaignStates
			.filter((campaign) => campaign.selected)
			.map((campaign) =>
				campaign.scope === 'all'
					? {
							campaignId: campaign.campaignId,
							scope: 'all' as const,
						}
					: {
							campaignId: campaign.campaignId,
							scope: 'lists' as const,
							contactListIds: [...campaign.selectedListIds].sort(
								(a, b) => a - b
							),
						}
			),
	};
};

const CampaignSelectionCard = ({
	campaign,
	onToggleSelected,
	onToggleExpanded,
	onChangeScope,
	onToggleList,
	onSearchChange,
	onListsLoaded,
	onListsLoadingChange,
	onListsErrorChange,
}: CampaignSelectionCardProps) => {
	const { t } = useTranslation('report-templates');
	const shouldLoadLists =
		campaign.selected && (campaign.expanded || campaign.scope === 'lists');
	const {
		data: contactLists,
		isFetching,
		isError,
		error,
		refetch,
	} = useGetCampaignContactLists(campaign.campaignId, ACTIVE_LIST_PARAMS, {
		enabled: shouldLoadLists,
	});

	useEffect(() => {
		onListsLoadingChange(campaign.campaignId, isFetching);
	}, [campaign.campaignId, isFetching, onListsLoadingChange]);

	useEffect(() => {
		if (contactLists === undefined) return;

		if (contactLists.length === 0 && campaign.scope === 'lists') {
			onChangeScope(campaign.campaignId, 'all');
		}

		onListsLoaded(campaign.campaignId, contactLists);
	}, [
		campaign.campaignId,
		contactLists,
		campaign.scope,
		onChangeScope,
		onListsLoaded,
	]);

	useEffect(() => {
		if (isError) {
			onListsErrorChange(campaign.campaignId, getErrorMessage(error));
			return;
		}

		if (!isFetching) {
			onListsErrorChange(campaign.campaignId, null);
		}
	}, [campaign.campaignId, error, isError, isFetching, onListsErrorChange]);

	const isListsModeDisabled =
		campaign.listsLoaded && campaign.availableLists.length === 0;
	const listSearch = campaign.search.trim().toLowerCase();
	const filteredLists = useMemo(
		() =>
			campaign.availableLists.filter((list) =>
				list.name.toLowerCase().includes(listSearch)
			),
		[campaign.availableLists, listSearch]
	);
	const scopeBadge = buildCampaignScopeBadge(campaign, t);
	const summary = buildCampaignSummary(campaign, t);

	return (
		<Paper withBorder radius='md' className={styles.campaignCard}>
			<Group align='flex-start' justify='space-between' wrap='nowrap' gap='sm'>
				<Group
					align='flex-start'
					gap='sm'
					wrap='nowrap'
					className={styles.campaignHeaderMain}
				>
					<Checkbox
						checked={campaign.selected}
						onChange={() => onToggleSelected(campaign.campaignId)}
						aria-label={t('export.includeCampaign', {
							name: campaign.name,
						})}
						className={styles.campaignCheckbox}
					/>
					<Box className={styles.campaignHeaderText}>
						<Group gap='xs' wrap='nowrap' className={styles.campaignTitleRow}>
							<Text fw={600} size='sm' className={styles.campaignName}>
								{campaign.name}
							</Text>
							<Badge variant='light' color={scopeBadge.color} size='sm'>
								{scopeBadge.label}
							</Badge>
						</Group>
						<Text size='xs' c='dimmed' className={styles.campaignSummary}>
							{summary}
						</Text>
					</Box>
				</Group>

				<ActionIcon
					variant='subtle'
					color='gray'
					size='sm'
					onClick={() => onToggleExpanded(campaign.campaignId)}
					aria-label={
						campaign.expanded
							? t('export.collapseCampaign')
							: t('export.expandCampaign')
					}
					disabled={!campaign.selected}
				>
					{campaign.expanded ? (
						<IconChevronDown size={16} />
					) : (
						<IconChevronRight size={16} />
					)}
				</ActionIcon>
			</Group>

			<Collapse
				in={campaign.selected && campaign.expanded}
				transitionDuration={160}
			>
				<Divider my='sm' />
				<Stack gap='sm' className={styles.campaignBody}>
					<Radio.Group
						value={campaign.scope}
						onChange={(value) =>
							onChangeScope(
								campaign.campaignId,
								value as CampaignSelectionScope
							)
						}
						label={t('export.scopeLabel')}
					>
						<Stack gap='xs' mt='xs'>
							<Radio value='all' label={t('export.entireCampaign')} size='sm' />
							<Radio
								value='lists'
								label={t('export.specificLists')}
								size='sm'
								disabled={isListsModeDisabled}
							/>
						</Stack>
					</Radio.Group>

					{campaign.scope === 'lists' && (
						<Stack gap='xs'>
							<TextInput
								size='sm'
								value={campaign.search}
								onChange={(event) =>
									onSearchChange(campaign.campaignId, event.currentTarget.value)
								}
								placeholder={t('export.listSearchPlaceholder')}
								leftSection={<IconSearch size={14} />}
								className={styles.listSearch}
							/>

							{campaign.listsLoading && !campaign.listsLoaded ? (
								<Center py='lg' className={styles.inlineState}>
									<Loader size='sm' />
								</Center>
							) : campaign.listsError ? (
								<Alert
									variant='light'
									color='red'
									icon={<IconAlertCircle size={16} />}
								>
									<Stack gap={6}>
										<Text size='sm'>{campaign.listsError}</Text>
										<Group gap='xs'>
											<Button
												size='xs'
												variant='light'
												leftSection={<IconRefresh size={14} />}
												onClick={() => void refetch()}
											>
												{t('export.retry')}
											</Button>
										</Group>
									</Stack>
								</Alert>
							) : campaign.listsLoaded &&
							  campaign.availableLists.length === 0 ? (
								<Alert
									variant='light'
									color='gray'
									icon={<IconAlertCircle size={16} />}
								>
									<Text size='sm'>{t('export.noActiveListsAvailable')}</Text>
								</Alert>
							) : (
								<Stack gap={8}>
									<Text size='xs' c='dimmed'>
										{t('export.listSelectionHint')}
									</Text>
									<ScrollArea.Autosize mah={240} className={styles.listPanel}>
										<Stack gap='xs' p='xs'>
											{filteredLists.length === 0 ? (
												<Center py='md' className={styles.inlineState}>
													<Text size='sm' c='dimmed'>
														{campaign.search.trim()
															? t('export.noListsMatch')
															: t('export.noListsAvailable')}
													</Text>
												</Center>
											) : (
												filteredLists.map((list) => {
													const selected = campaign.selectedListIds.includes(
														list.id
													);
													return (
														<Checkbox
															key={list.id}
															checked={selected}
															onChange={() =>
																onToggleList(campaign.campaignId, list.id)
															}
															label={
																<Stack gap={2} className={styles.listLabel}>
																	<Text size='sm' fw={500}>
																		{list.name}
																	</Text>
																	<Text size='xs' c='dimmed'>
																		{t('export.listCreatedAt', {
																			date: formatDisplayDate(list.createAt),
																		})}
																	</Text>
																</Stack>
															}
															className={styles.listItem}
														/>
													);
												})
											)}
										</Stack>
									</ScrollArea.Autosize>
									{campaign.selectedListIds.length > 0 && (
										<Text size='xs' c='dimmed'>
											{campaign.selectedListIds.length === 1
												? t('export.listsSelectedSummary_one')
												: t('export.listsSelectedSummary_other', {
														count: campaign.selectedListIds.length,
													})}
										</Text>
									)}
								</Stack>
							)}
						</Stack>
					)}

					{campaign.scope === 'lists' &&
					campaign.selected &&
					campaign.listsLoaded &&
					campaign.availableLists.length > 0 &&
					campaign.selectedListIds.length === 0 ? (
						<Text size='xs' c='red'>
							{t('export.validation.contactListsRequired')}
						</Text>
					) : null}
				</Stack>
			</Collapse>
		</Paper>
	);
};

const CampaignPickerModal = ({
	opened,
	onClose,
	templateId: _templateId,
	templateSchemaId,
	onSubmit,
	isSubmitting = false,
}: CampaignPickerModalProps) => {
	void _templateId;
	const { t } = useTranslation('report-templates');
	const [campaignStates, setCampaignStates] = useState<
		CampaignSelectionState[]
	>([]);
	const { data: schemaCampaigns = [], isLoading: isLoadingSchemaCampaigns } =
		useGetCampaignsBySchemaId(
			templateSchemaId ?? undefined,
			!!templateSchemaId
		);
	const { data: simpleCampaigns = [], isLoading: isLoadingSimpleCampaigns } =
		useGetSimpleCampaigns(!templateSchemaId);

	const campaigns = useMemo<CampaignOption[]>(() => {
		const source = templateSchemaId ? schemaCampaigns : simpleCampaigns;
		return source.map((campaign) => ({
			id: campaign.id,
			name: campaign.name,
		}));
	}, [schemaCampaigns, simpleCampaigns, templateSchemaId]);

	const isLoadingCampaigns = templateSchemaId
		? isLoadingSchemaCampaigns
		: isLoadingSimpleCampaigns;

	const form = useForm<{
		startDate: Date | null;
		endDate: Date | null;
		format: 'csv' | 'xlsx';
	}>({
		initialValues: createDefaultFormValues(),
		validate: {
			startDate: (value) =>
				normalizeDateValue(value)
					? null
					: t('export.validation.startDateRequired'),
			endDate: (value, values) => {
				const startDate = normalizeDateValue(values.startDate);
				const endDate = normalizeDateValue(value);

				if (!endDate) return t('export.validation.endDateRequired');
				if (startDate && endDate.getTime() < startDate.getTime()) {
					return t('export.validation.endDateBeforeStartDate');
				}
				return null;
			},
		},
	});

	useEffect(() => {
		if (!opened) {
			form.reset();
			setCampaignStates([]);
			return;
		}

		form.setValues(createDefaultFormValues());
		form.resetDirty();
		// `form` is intentionally omitted here. Mantine form objects are not a stable
		// dependency target and including them can retrigger this effect on every
		// render, which loops because `setValues` schedules a new render.
	}, [opened]);

	useEffect(() => {
		if (!opened || campaigns.length === 0) return;

		setCampaignStates((current) => {
			const currentIds = current.map((campaign) => campaign.campaignId);
			const nextIds = campaigns.map((campaign) => campaign.id);
			const isSameCampaignSet =
				currentIds.length === nextIds.length &&
				currentIds.every((id, index) => id === nextIds[index]);

			if (isSameCampaignSet) {
				return current;
			}

			return createInitialCampaignStates(campaigns);
		});
	}, [campaigns, opened]);

	const updateCampaign = useCallback(
		(
			campaignId: number,
			updater: (campaign: CampaignSelectionState) => CampaignSelectionState
		) => {
			setCampaignStates((current) =>
				current.map((campaign) =>
					campaign.campaignId === campaignId ? updater(campaign) : campaign
				)
			);
		},
		[]
	);

	const handleToggleSelected = useCallback(
		(campaignId: number) => {
			updateCampaign(campaignId, (campaign) => {
				const selected = !campaign.selected;

				if (!selected) {
					return {
						...campaign,
						selected: false,
						expanded: false,
						scope: 'all',
						listsError: null,
						listsLoading: false,
						selectedListIds: [],
						search: '',
					};
				}

				return {
					...campaign,
					selected: true,
				};
			});
		},
		[updateCampaign]
	);

	const handleToggleExpanded = useCallback(
		(campaignId: number) => {
			updateCampaign(campaignId, (campaign) => ({
				...campaign,
				expanded: !campaign.expanded,
			}));
		},
		[updateCampaign]
	);

	const handleChangeScope = useCallback(
		(campaignId: number, scope: CampaignSelectionScope) => {
			updateCampaign(campaignId, (campaign) => ({
				...campaign,
				scope,
				expanded: true,
			}));
		},
		[updateCampaign]
	);

	const handleToggleList = useCallback(
		(campaignId: number, listId: number) => {
			updateCampaign(campaignId, (campaign) => ({
				...campaign,
				selectedListIds: campaign.selectedListIds.includes(listId)
					? campaign.selectedListIds.filter((id) => id !== listId)
					: [...campaign.selectedListIds, listId],
			}));
		},
		[updateCampaign]
	);

	const handleSearchChange = useCallback(
		(campaignId: number, value: string) => {
			updateCampaign(campaignId, (campaign) => ({
				...campaign,
				search: value,
			}));
		},
		[updateCampaign]
	);

	const handleListsLoaded = useCallback(
		(campaignId: number, lists: CampaignContactList[]) => {
			updateCampaign(campaignId, (campaign) => {
				const availableLists = [...lists].sort((left, right) =>
					left.name.localeCompare(right.name)
				);
				if (
					campaign.listsLoaded &&
					areListsEqual(campaign.availableLists, availableLists)
				) {
					return campaign;
				}

				const nextSelectedListIds = campaign.selectedListIds.filter((id) =>
					availableLists.some((list) => list.id === id)
				);

				if (availableLists.length === 0) {
					return {
						...campaign,
						listsLoaded: true,
						listsLoading: false,
						listsError: null,
						availableLists,
						selectedListIds: [],
						scope: 'all',
					};
				}

				return {
					...campaign,
					listsLoaded: true,
					listsLoading: false,
					listsError: null,
					availableLists,
					selectedListIds: nextSelectedListIds,
				};
			});
		},
		[updateCampaign]
	);

	const handleListsLoadingChange = useCallback(
		(campaignId: number, loading: boolean) => {
			updateCampaign(campaignId, (campaign) => {
				if (campaign.listsLoading === loading) {
					return campaign;
				}

				return {
					...campaign,
					listsLoading: loading,
				};
			});
		},
		[updateCampaign]
	);

	const handleListsErrorChange = useCallback(
		(campaignId: number, error: string | null) => {
			updateCampaign(campaignId, (campaign) => {
				if (campaign.listsError === error && campaign.listsLoading === false) {
					return campaign;
				}

				return {
					...campaign,
					listsLoading: false,
					listsError: error,
				};
			});
		},
		[updateCampaign]
	);

	const handleToggleAllCampaigns = useCallback(() => {
		setCampaignStates((current) => {
			const allSelected =
				current.length > 0 && current.every((campaign) => campaign.selected);

			return current.map((campaign) => ({
				...campaign,
				selected: !allSelected,
				expanded: false,
				scope: 'all',
				listsError: null,
				listsLoading: false,
				selectedListIds: [],
				search: '',
			}));
		});
	}, []);

	const selectedCampaigns = campaignStates.filter(
		(campaign) => campaign.selected
	);
	const selectedCampaignCount = selectedCampaigns.length;
	const selectedListCount = selectedCampaigns.reduce(
		(total, campaign) => total + campaign.selectedListIds.length,
		0
	);
	const selectedListScopedCampaigns = selectedCampaigns.filter(
		(campaign) => campaign.scope === 'lists'
	);

	const hasCampaignSelectionError = selectedCampaignCount === 0;
	const hasListSelectionError = selectedListScopedCampaigns.some(
		(campaign) =>
			campaign.listsLoading ||
			!campaign.listsLoaded ||
			Boolean(campaign.listsError) ||
			(campaign.availableLists.length > 0 &&
				campaign.selectedListIds.length === 0)
	);
	const hasValidationBlockers =
		hasCampaignSelectionError || hasListSelectionError;
	const allSelected =
		campaignStates.length > 0 &&
		campaignStates.every((campaign) => campaign.selected);

	const validationMessage = hasCampaignSelectionError
		? t('export.validation.campaignRequired')
		: selectedListScopedCampaigns.some((campaign) => campaign.listsError)
			? t('export.validation.contactListsLoadFailed')
			: selectedListScopedCampaigns.some(
						(campaign) => campaign.listsLoading || !campaign.listsLoaded
				  )
				? t('export.validation.contactListsLoading')
				: selectedListScopedCampaigns.some(
							(campaign) =>
								campaign.availableLists.length > 0 &&
								campaign.selectedListIds.length === 0
					  )
					? t('export.validation.contactListsRequired')
					: null;

	const formatOptions = useMemo(
		() => [
			{ value: 'csv', label: t('export.formatCSV') },
			{ value: 'xlsx', label: t('export.formatXLSX') },
		],
		[t]
	);

	const handleClose = useCallback(() => {
		onClose();
		form.reset();
		setCampaignStates([]);
	}, [form, onClose]);

	const handleSubmit = useCallback(
		async (values: {
			startDate: Date | null;
			endDate: Date | null;
			format: 'csv' | 'xlsx';
		}) => {
			const startDate = normalizeDateValue(values.startDate);
			const endDate = normalizeDateValue(values.endDate);

			if (!startDate || !endDate) {
				notifications.show({
					message: t('export.validation.fixDates'),
					color: 'red',
				});
				return;
			}

			if (hasValidationBlockers) {
				notifications.show({
					message: validationMessage ?? t('export.validation.fixSelections'),
					color: 'red',
				});
				return;
			}

			try {
				const payload = buildPayload(
					{
						...values,
						startDate,
						endDate,
					},
					campaignStates
				);
				await onSubmit(payload);
				handleClose();
			} catch (error) {
				notifications.show({
					message: getErrorMessage(error),
					color: 'red',
				});
			}
		},
		[
			campaignStates,
			handleClose,
			hasValidationBlockers,
			onSubmit,
			t,
			validationMessage,
		]
	);

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Text component='span' fw={600} size='sm'>
					{t('export.title')}
				</Text>
			}
			centered
			size='xl'
			classNames={{ body: styles.modalBody }}
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md' className={styles.modalStack}>
					<Text size='sm' c='dimmed'>
						{t('export.description')}
					</Text>

					{templateSchemaId ? (
						<Alert
							variant='light'
							color='blue'
							icon={<IconAlertCircle size={16} />}
							title={t('export.schemaCompatibility')}
						>
							<Text size='sm'>
								{t('export.schemaCompatibilityDescription', {
									schemaId: templateSchemaId,
								})}
							</Text>
						</Alert>
					) : null}

					<Paper withBorder radius='md' className={styles.sectionCard}>
						<Stack gap='sm'>
							<Group gap='sm' align='flex-start'>
								<ThemeIcon variant='light' radius={12} size={40}>
									<IconFileExport size={18} />
								</ThemeIcon>
								<Box className={styles.sectionHeaderText}>
									<Text fw={600} size='sm'>
										{t('export.formatSectionTitle')}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('export.formatSectionDescription')}
									</Text>
								</Box>
							</Group>

							<Select
								label={t('export.format')}
								data={formatOptions}
								value={form.values.format}
								onChange={(value) =>
									form.setFieldValue(
										'format',
										(value as 'csv' | 'xlsx') ?? 'csv'
									)
								}
								allowDeselect={false}
								size='sm'
							/>
						</Stack>
					</Paper>

					<Paper withBorder radius='md' className={styles.sectionCard}>
						<Stack gap='sm'>
							<Group gap='sm' align='flex-start'>
								<ThemeIcon variant='light' radius={12} size={40}>
									<IconCalendarEvent size={18} />
								</ThemeIcon>
								<Box className={styles.sectionHeaderText}>
									<Text fw={600} size='sm'>
										{t('export.dateSectionTitle')}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('export.dateSectionDescription')}
									</Text>
								</Box>
							</Group>

							<SimpleGrid cols={{ base: 1, sm: 2 }} className={styles.dateGrid}>
								<DatePickerInput
									label={t('export.startDate')}
									value={form.values.startDate}
									onChange={(value) =>
										form.setFieldValue('startDate', normalizeDateValue(value))
									}
									error={form.errors.startDate}
									maxDate={
										normalizeDateValue(form.values.endDate) ?? new Date()
									}
									valueFormat='MMM D, YYYY'
									size='sm'
								/>
								<DatePickerInput
									label={t('export.endDate')}
									value={form.values.endDate}
									onChange={(value) =>
										form.setFieldValue('endDate', normalizeDateValue(value))
									}
									error={form.errors.endDate}
									minDate={
										normalizeDateValue(form.values.startDate) ?? undefined
									}
									maxDate={new Date()}
									valueFormat='MMM D, YYYY'
									size='sm'
								/>
							</SimpleGrid>
						</Stack>
					</Paper>

					<Paper withBorder radius='md' className={styles.sectionCard}>
						<Stack gap='sm'>
							<Group justify='space-between' align='flex-start' gap='sm'>
								<Group gap='sm' align='flex-start'>
									<ThemeIcon variant='light' radius={12} size={40}>
										<IconSearch size={18} />
									</ThemeIcon>
									<Box className={styles.sectionHeaderText}>
										<Text fw={600} size='sm'>
											{t('export.campaignsSectionTitle')}
										</Text>
										<Text size='xs' c='dimmed'>
											{t('export.campaignsSectionDescription')}
										</Text>
									</Box>
								</Group>

								<Button
									size='xs'
									variant='default'
									type='button'
									onClick={handleToggleAllCampaigns}
									disabled={campaignStates.length === 0}
								>
									{allSelected
										? t('export.clearAllCampaigns')
										: t('export.selectAllCampaigns')}
								</Button>
							</Group>

							{isLoadingCampaigns ? (
								<Center py='xl'>
									<Loader size='sm' />
								</Center>
							) : campaigns.length === 0 ? (
								<Alert
									variant='light'
									color='gray'
									icon={<IconAlertCircle size={16} />}
								>
									<Text size='sm'>
										{templateSchemaId
											? t('export.noCompatibleCampaigns')
											: t('export.noCampaignsAvailable')}
									</Text>
								</Alert>
							) : (
								<Stack gap='sm'>
									{validationMessage ? (
										<Alert
											variant='light'
											color='red'
											icon={<IconAlertCircle size={16} />}
										>
											<Text size='sm'>{validationMessage}</Text>
										</Alert>
									) : (
										<Text size='xs' c='dimmed'>
											{t('export.campaignsSectionHint')}
										</Text>
									)}

									<ScrollArea.Autosize
										mah={420}
										className={styles.campaignList}
									>
										<Stack gap='sm' p='xs'>
											{campaignStates.map((campaign) => (
												<CampaignSelectionCard
													key={campaign.campaignId}
													campaign={campaign}
													onToggleSelected={handleToggleSelected}
													onToggleExpanded={handleToggleExpanded}
													onChangeScope={handleChangeScope}
													onToggleList={handleToggleList}
													onSearchChange={handleSearchChange}
													onListsLoaded={handleListsLoaded}
													onListsLoadingChange={handleListsLoadingChange}
													onListsErrorChange={handleListsErrorChange}
												/>
											))}
										</Stack>
									</ScrollArea.Autosize>

									<Group
										justify='space-between'
										wrap='wrap'
										className={styles.footerSummary}
									>
										<Text size='sm'>
											<Text span fw={600}>
												{selectedCampaignCount}
											</Text>{' '}
											{selectedCampaignCount === 1
												? t('export.selectedCampaign_one')
												: t('export.selectedCampaign_other')}
										</Text>
										<Text size='sm'>
											<Text span fw={600}>
												{selectedListCount}
											</Text>{' '}
											{selectedListCount === 1
												? t('export.selectedList_one')
												: t('export.selectedList_other')}
										</Text>
									</Group>
								</Stack>
							)}
						</Stack>
					</Paper>

					<Group justify='flex-end' gap='xs' className={styles.actions}>
						<Button
							variant='default'
							type='button'
							onClick={handleClose}
							size='sm'
						>
							{t('actions.cancel', { ns: 'common' })}
						</Button>
						<Button
							type='submit'
							size='sm'
							loading={isSubmitting}
							disabled={
								isSubmitting ||
								isLoadingCampaigns ||
								campaignStates.length === 0 ||
								selectedCampaignCount === 0 ||
								hasListSelectionError ||
								!form.values.startDate ||
								!form.values.endDate
							}
						>
							{t('export.export')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

export default CampaignPickerModal;
