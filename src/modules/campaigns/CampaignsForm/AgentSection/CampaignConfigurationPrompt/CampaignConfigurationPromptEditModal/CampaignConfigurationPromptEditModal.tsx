// CampaignConfigurationPromptEditModal.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router';
import {
	Paper,
	Button,
	Group,
	LoadingOverlay,
	Text,
	ThemeIcon,
	Stack,
	Box,
	Badge,
	ScrollArea,
} from '@mantine/core';
import { IconSparkles, IconDeviceFloppy } from '@tabler/icons-react';
import styles from './CampaignConfigurationPromptEditModal.module.css';
import { useGetAllCampaignPromptTypes } from '~/queries/campaignPromptTypeQueries';
import {
	useGetCampaignPrompts,
	useCreateCampaignPromptsBatch,
} from '~/queries/campaignPromptQueries';
import type { CampaignPromptModel } from '~/models/CampaignPromptModel';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import PromptEditor from './PromptTypeAccordionItem/PromptEditor';
import PromptMenuItem from './PromptMenuItem';
import { useTranslation } from 'react-i18next';

const normalizePromptValue = (value: string) =>
	value.replace(/\r\n/g, '\n').trim();

interface CampaignConfigurationPromptEditModalProps {
	onClose: () => void;
	onSave: () => void;
	initialSchemaId?: number;
	campaignId?: number;
}

const CampaignConfigurationPromptEditModal: React.FC<
	CampaignConfigurationPromptEditModalProps
> = (props) => {
	const { campaignId: routeCampaignId } = useParams();
	const campaignId = props.campaignId || Number(routeCampaignId);

	const { data: types } = useGetAllCampaignPromptTypes();
	const { data: existingPrompts, isLoading: isLoadingPrompts } =
		useGetCampaignPrompts({ campaignId }, { enabled: !!campaignId });
	const { mutate: saveBatch, isPending: isSaving } =
		useCreateCampaignPromptsBatch();
	const { t } = useTranslation();

	const [prompts, setPrompts] = useState<Record<number, CampaignPromptModel>>(
		{}
	);
	const [originalPrompts, setOriginalPrompts] = useState<
		Record<number, CampaignPromptModel>
	>({});
	const [activeTypeId, setActiveTypeId] = useState<number | null>(null);

	useEffect(() => {
		if (types) {
			const initialPrompts: Record<number, CampaignPromptModel> = {};

			if (existingPrompts) {
				existingPrompts.forEach((p) => {
					initialPrompts[p.typeId] = p;
				});
			}

			types.forEach((type) => {
				const current = initialPrompts[type.id];
				if (!current) {
					initialPrompts[type.id] = {
						typeId: type.id,
						campaignId: campaignId!,
						prompt: '',
						order: type.order,
					};
				} else {
					initialPrompts[type.id] = {
						...current,
						order: type.order,
					};
				}
			});

			setPrompts(initialPrompts);
			setOriginalPrompts({ ...initialPrompts });
		}
	}, [existingPrompts, types, campaignId]);

	useEffect(() => {
		if (!types || types.length === 0) return;
		if (activeTypeId !== null) return;

		const fallbackTypeId = types[0]?.id;
		const preferredTypeId =
			props.initialSchemaId && types.some((t) => t.id === props.initialSchemaId)
				? props.initialSchemaId
				: fallbackTypeId;

		if (preferredTypeId) {
			setActiveTypeId(preferredTypeId);
		}
	}, [types, activeTypeId, props.initialSchemaId]);

	const handleChange = (type: CampaignPromptTypeModel, value: string) => {
		setPrompts((prev) => {
			const currentPrompt = prev[type.id];

			return {
				...prev,
				[type.id]: {
					...currentPrompt,
					typeId: type.id,
					campaignId: campaignId!,
					prompt: value,
					order: type.order,
				},
			};
		});
	};

	const getPromptMeta = useCallback(
		(typeId: number) => {
			const promptValue = prompts[typeId]?.prompt || '';
			const trimmed = promptValue.trim();
			const originalValue = originalPrompts[typeId]?.prompt || '';
			const normalizedCurrent = normalizePromptValue(promptValue);
			const normalizedOriginal = normalizePromptValue(originalValue);

			return {
				hasValue: trimmed.length > 0,
				isDrafted: normalizedCurrent !== normalizedOriginal,
			};
		},
		[prompts, originalPrompts]
	);

	const handleSave = () => {
		// Map prompts with isChange flag for each individual prompt
		const promptsList = Object.values(prompts)
			.filter((p) => p.prompt && p.prompt.trim() !== '')
			.map((prompt) => {
				const originalPrompt = originalPrompts[prompt.typeId]?.prompt || '';
				const currentPrompt = prompt.prompt || '';
				const isChange =
					normalizePromptValue(currentPrompt) !==
					normalizePromptValue(originalPrompt);

				return {
					...prompt,
					isChange,
				};
			});

		saveBatch(
			{ prompts: promptsList },
			{
				onSuccess: () => {
					props.onSave();
					props.onClose();
				},
			}
		);
	};

	const activeType = useMemo(() => {
		return types?.find((t) => t.id === activeTypeId);
	}, [types, activeTypeId]);

	const activePromptMeta = useMemo(() => {
		if (!activeTypeId) return null;
		return getPromptMeta(activeTypeId);
	}, [activeTypeId, getPromptMeta]);

	return (
		<Paper radius='sm' className={styles.modalShell} withBorder>
			<LoadingOverlay visible={isLoadingPrompts || isSaving} />
			<div className={styles.mainContainer}>
				<div className={styles.header}>
					<Group align='center' gap={6} className={styles.headerMain}>
						<ThemeIcon
							color='blue'
							variant='light'
							size='sm'
							radius='sm'
							className={styles.pulseIcon}
						>
							<IconSparkles size={14} />
						</ThemeIcon>
						<div className={styles.headerContent}>
							<Text className={styles.title}>
								{t('campaigns.form.agent.prompt.modal.title')}
							</Text>
							<Text c='dimmed' className={styles.subtitle}>
								{t('campaigns.form.agent.prompt.modal.subtitle')}
							</Text>
						</div>
					</Group>
				</div>

				<div className={styles.contentGrid}>
					<div className={styles.menuColumn}>
						<div className={styles.menuHeader}>
							<Text size='xs' fw={500} c='dimmed'>
								{t('campaigns.form.agent.prompt.modal.types')}
							</Text>
							<Badge size='xs' variant='light' color='gray' radius='sm'>
								{types?.length ?? 0}
							</Badge>
						</div>
						<ScrollArea className={styles.menuScroll} type='auto'>
							<Stack gap={2}>
								{types?.map((type) => {
									const promptMeta = getPromptMeta(type.id);

									return (
										<PromptMenuItem
											key={type.id}
											typeId={type.id}
											label={type.name}
											isActive={activeTypeId === type.id}
											onClick={() => setActiveTypeId(type.id)}
											isDrafted={promptMeta.isDrafted}
											hasValue={promptMeta.hasValue}
										/>
									);
								})}
							</Stack>
						</ScrollArea>
					</div>
					<div className={styles.editorColumn}>
						{activeType ? (
							<div className={styles.editorShell}>
								<Group
									justify='space-between'
									align='center'
									gap='xs'
									className={styles.editorHeader}
								>
									<Box className={styles.editorHeaderText}>
										<Text fw={600} size='sm'>
											{activeType.name}
										</Text>
									</Box>
									{activePromptMeta && (
										<Badge
											size='xs'
											variant='light'
											color={activePromptMeta.isDrafted ? 'blue' : 'gray'}
											radius='sm'
										>
											{activePromptMeta.isDrafted
												? t('campaigns.form.agent.prompt.modal.editorDrafted')
												: t(
														'campaigns.form.agent.prompt.modal.editorNoChanges'
													)}
										</Badge>
									)}
								</Group>
								<Stack gap='xs' className={styles.editorContent}>
									<PromptEditor
										type={activeType}
										value={prompts[activeType.id]?.prompt}
										onChange={(val) => handleChange(activeType, val)}
										campaignId={campaignId!}
									/>
								</Stack>
							</div>
						) : (
							<div className={styles.emptyState}>
								<Text size='xs' c='dimmed'>
									{t('campaigns.form.agent.prompt.modal.selectPromptType')}
								</Text>
							</div>
						)}
					</div>
				</div>

				<div className={styles.footer}>
					<Text size='xs' c='dimmed'>
						{t('campaigns.form.agent.prompt.modal.saveHint')}
					</Text>
					<Group gap='xs'>
						<Button variant='subtle' size='xs' onClick={props.onClose}>
							{t('common.cancel')}
						</Button>
						<Button
							onClick={handleSave}
							loading={isSaving}
							size='xs'
							leftSection={<IconDeviceFloppy size={14} />}
						>
							{t('common.save')}
						</Button>
					</Group>
				</div>
			</div>
		</Paper>
	);
};

export default CampaignConfigurationPromptEditModal;
