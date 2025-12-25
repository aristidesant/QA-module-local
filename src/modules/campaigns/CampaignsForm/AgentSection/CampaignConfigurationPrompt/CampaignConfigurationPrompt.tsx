import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Group,
	Modal,
	Paper,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconArrowsMaximize,
	IconArrowsMinimize,
	IconBrain,
	IconPencil,
} from '@tabler/icons-react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import { useTranslation } from 'react-i18next';
import styles from './CampaignConfigurationPrompt.module.css';
// History modal removed from this component; it's used elsewhere now.
import CampaignConfigurationPromptEditModal from './CampaignConfigurationPromptEditModal';

const CampaignConfigurationPrompt: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const form = useCampaignFormContext();
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const [contentHeight, setContentHeight] = useState<number | undefined>();

	const prompt =
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.prompt || '';
	const contactSchemaId = (
		form.values.agentConfig as { contactSchemaId?: number } | undefined
	)?.contactSchemaId;

	const handleEdit = useCallback(() => {
		setEditModalOpen(true);
	}, []);

	const toggleExpanded = useCallback(() => {
		setExpanded((prev) => !prev);
	}, []);

	const hasPrompt = prompt.trim().length > 0;
	const compactHeight = 176;

	useEffect(() => {
		const node = contentRef.current;
		if (!node) return;
		setContentHeight(node.scrollHeight);
	}, [prompt, expanded]);

	return (
		<>
			<SectionCard
				icon={IconBrain}
				title={t('form.agent.prompt.title')}
				description={t('form.agent.prompt.description')}
				className={styles.sectionCard}
				contentSpacing='sm'
				padding='md'
				headerActions={
					<Group gap='xs'>
						<ActionIcon
							variant='light'
							aria-label={t('form.agent.prompt.header.editAria')}
							color='blue'
							onClick={handleEdit}
							size='sm'
						>
							<IconPencil size={16} />
						</ActionIcon>
						<ActionIcon
							variant='light'
							aria-label={
								expanded
									? t('form.agent.prompt.header.collapseAria')
									: t('form.agent.prompt.header.expandAria')
							}
							color='blue'
							onClick={toggleExpanded}
							size='sm'
						>
							{expanded ? (
								<IconArrowsMinimize size={16} />
							) : (
								<IconArrowsMaximize size={16} />
							)}
						</ActionIcon>
					</Group>
				}
			>
				<Stack gap='xs' className={styles.promptStack}>
					<Group justify='space-between' align='center'>
						<Text size='sm' fw={600}>
							{t('form.agent.prompt.previewTitle')}
						</Text>
						<Group gap='xs'>
							<Badge size='sm' variant='light' color='gray'>
								{hasPrompt
									? t('form.agent.prompt.previewChars', {
											count: prompt.length,
										})
									: t('form.agent.prompt.status.empty')}
							</Badge>
						</Group>
					</Group>
					<Paper withBorder radius='sm' p='sm' className={styles.promptSurface}>
						<div
							className={`${styles.promptShell} ${
								expanded
									? styles.promptShellExpanded
									: styles.promptShellCompact
							}`}
							style={{
								height: expanded
									? contentHeight
										? `${contentHeight}px`
										: 'auto'
									: `${compactHeight}px`,
							}}
						>
							<div
								ref={contentRef}
								className={`${styles.promptContent} ${
									hasPrompt ? '' : styles.promptPlaceholder
								}`}
								aria-label='Agent prompt preview'
							>
								{hasPrompt ? prompt : t('form.agent.prompt.placeholder')}
							</div>
						</div>
					</Paper>
					<Group justify='space-between' align='center'>
						<Text size='xs' c='dimmed'>
							{t('form.agent.prompt.keepConcise')}
						</Text>
						{expanded && (
							<ActionIcon
								variant='light'
								size='sm'
								color='blue'
								onClick={toggleExpanded}
								aria-label={t('form.agent.prompt.header.collapseAria')}
							>
								<IconArrowsMinimize size={16} />
							</ActionIcon>
						)}
					</Group>
				</Stack>
			</SectionCard>
			<Modal
				opened={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				title={t('configuration.editPrompt')}
				styles={{
					body: {
						height: '90%',
					},
				}}
				centered
				fullScreen
			>
				<CampaignConfigurationPromptEditModal
					initialSchemaId={contactSchemaId}
					onClose={() => setEditModalOpen(false)}
					onSave={() => {
						setEditModalOpen(false);
						// Modal saves directly to backend, so we might need to refresh context or just close
					}}
				/>
			</Modal>
		</>
	);
};

export default CampaignConfigurationPrompt;
