import { useMemo } from 'react';
import {
	Accordion,
	ActionIcon,
	Box,
	CopyButton,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconBraces, IconCheck, IconCopy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard/SectionCard';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import type { TranscriptContent } from '~/models/ConversationsModels';
import { formatJsonDisplay } from '../TranscriptViewer/helpers/formatUtils';
import { hasMeaningfulValue } from '../TranscriptViewer/helpers/technicalEntryHelpers';
import styles from './ConversationTechnicalOverview.module.css';

interface ConversationTechnicalOverviewProps {
	transcriptContent?: TranscriptContent | null;
}

export function ConversationTechnicalOverview({
	transcriptContent,
}: ConversationTechnicalOverviewProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const { canPerformAction } = usePermissions();
	const canViewTechnicalDetails = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.MANAGE
	);

	const sections = useMemo(() => {
		if (!transcriptContent) {
			return [];
		}

		const conversationInitiationData =
			transcriptContent.conversationInitiationClientData ??
			transcriptContent.conversation_initiation_client_data;
		const candidates = [
			{
				id: 'metadata',
				label: t('technicalOverview.sections.metadata'),
				value: transcriptContent.metadata,
			},
			{
				id: 'analysis',
				label: t('technicalOverview.sections.analysis'),
				value: transcriptContent.analysis,
			},
			{
				id: 'initiation-data',
				label: t('technicalOverview.sections.initiationData'),
				value: conversationInitiationData,
			},
		];

		const visibleSections = candidates.filter((section) =>
			hasMeaningfulValue(section.value)
		);

		return [
			...visibleSections,
			{
				id: 'raw-payload',
				label: t('technicalOverview.sections.rawPayload'),
				value: transcriptContent,
			},
		];
	}, [t, transcriptContent]);

	if (!canViewTechnicalDetails || sections.length === 0) {
		return null;
	}

	return (
		<SectionCard
			title={t('technicalOverview.title')}
			description={t('technicalOverview.description')}
			icon={IconBraces}
			padding='sm'
			contentSpacing='sm'
		>
			<Accordion variant='contained' className={styles.accordion}>
				{sections.map((section) => (
					<TechnicalOverviewSection key={section.id} {...section} />
				))}
			</Accordion>
		</SectionCard>
	);
}

interface TechnicalOverviewSectionProps {
	id: string;
	label: string;
	value: unknown;
}

function TechnicalOverviewSection({
	id,
	label,
	value,
}: TechnicalOverviewSectionProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const displayValue = formatJsonDisplay(value);

	if (!displayValue) {
		return null;
	}

	return (
		<Accordion.Item value={id}>
			<Accordion.Control>
				<Text size='xs' fw={600}>
					{label}
				</Text>
			</Accordion.Control>
			<Accordion.Panel>
				<Stack gap='xs'>
					<Group justify='flex-end'>
						<CopyButton value={displayValue} timeout={1200}>
							{({ copied, copy }) => (
								<Tooltip
									label={
										copied
											? t('transcript.technical.copiedValue')
											: t('transcript.technical.copyValue')
									}
									withArrow
								>
									<ActionIcon
										variant='subtle'
										size='sm'
										color={copied ? 'green' : 'gray'}
										onClick={copy}
										aria-label={t('transcript.technical.copyValue')}
									>
										{copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
									</ActionIcon>
								</Tooltip>
							)}
						</CopyButton>
					</Group>
					<Box className={styles.codeBlock}>{displayValue}</Box>
				</Stack>
			</Accordion.Panel>
		</Accordion.Item>
	);
}

export default ConversationTechnicalOverview;
