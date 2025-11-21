// CampaignConfigurationPromptEditModal.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
	Accordion,
	Paper,
	Button,
	Group,
	LoadingOverlay,
	Badge,
	Text,
	ThemeIcon,
	Tooltip,
	ActionIcon,
} from '@mantine/core';
import {
	IconSparkles,
	IconInfoCircle,
	IconDeviceFloppy,
} from '@tabler/icons-react';
import styles from './CampaignConfigurationPromptEditModal.module.css';
import { useGetAllCampaignPromptTypes } from '~/queries/campaignPromptTypeQueries';
import {
	useGetCampaignPrompts,
	useCreateCampaignPromptsBatch,
} from '~/queries/campaignPromptQueries';
import type { CampaignPromptModel } from '~/models/CampaignPromptModel';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import PromptTypeAccordionItem from './PromptTypeAccordionItem';

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

	const [prompts, setPrompts] = useState<Record<number, CampaignPromptModel>>(
		{}
	);
	const [activeAccordionValue, setActiveAccordionValue] = useState<
		string | null
	>(null);

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
		}
	}, [existingPrompts, types, campaignId]);

	useEffect(() => {
		if (!types || types.length === 0) return;
		setActiveAccordionValue((current) => current ?? String(types[0].id));
	}, [types]);

	const handleAccordionChange = (value: string | string[] | null) => {
		setActiveAccordionValue(Array.isArray(value) ? (value[0] ?? null) : value);
	};

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

	const handleSave = () => {
		const promptsList = Object.values(prompts).filter(
			(p) => p.prompt && p.prompt.trim() !== ''
		);
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

	return (
		<Paper radius='md' className={styles.modalShell} withBorder>
			<LoadingOverlay visible={isLoadingPrompts || isSaving} />
			<div className={styles.mainContainer}>
				<div className={styles.header}>
					<Group align='center' gap='sm' style={{ flex: 1 }}>
						<ThemeIcon
							color='blue'
							variant='light'
							size='lg'
							radius='md'
							className={styles.pulseIcon}
						>
							<IconSparkles size={18} />
						</ThemeIcon>
						<div className={styles.headerContent}>
							<Group gap='xs' align='center'>
								<Text className={styles.title}>Prompt configuration</Text>
								<div className={styles.badgesRow}>
									<Badge size='xs' variant='light' color='blue'>
										{types?.length ?? 0} types
									</Badge>
									{campaignId && (
										<Badge size='xs' variant='light' color='grape'>
											#{campaignId}
										</Badge>
									)}
									<Badge size='xs' variant='outline' color='teal'>
										MD
									</Badge>
								</div>
							</Group>
							<Text size='xs' c='dimmed' className={styles.subtitle}>
								Curated, compact instructions for every interaction type.
							</Text>
						</div>
					</Group>
					<Tooltip
						label='Prompts are stored per message type and can be reused.'
						withArrow
						position='left'
					>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='sm'
							aria-label='Prompt tips'
						>
							<IconInfoCircle size={16} />
						</ActionIcon>
					</Tooltip>
				</div>

				<div className={styles.scrollableContent}>
					<Accordion
						radius='md'
						className={styles.accordionRoot}
						value={activeAccordionValue}
						onChange={handleAccordionChange}
						transitionDuration={150}
					>
						{types?.map((type) => (
							<>
								<PromptTypeAccordionItem
									key={type.id}
									type={type}
									value={prompts[type.id]?.prompt}
									onChange={(val) => handleChange(type, val)}
									campaignId={campaignId!}
								/>
							</>
						))}
					</Accordion>
				</div>

				<div className={styles.footer}>
					<Text size='xs' c='dimmed'>
						Save to share these prompts with every agent in this campaign.
					</Text>
					<Group gap='xs'>
						<Button variant='subtle' onClick={props.onClose}>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							loading={isSaving}
							leftSection={<IconDeviceFloppy size={16} />}
						>
							Save prompts
						</Button>
					</Group>
				</div>
			</div>
		</Paper>
	);
};

export default CampaignConfigurationPromptEditModal;
