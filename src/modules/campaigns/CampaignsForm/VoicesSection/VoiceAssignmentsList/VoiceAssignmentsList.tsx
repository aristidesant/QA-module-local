import { useMemo } from 'react';
import {
	ActionIcon,
	Avatar,
	Badge,
	Button,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import {
	IconGripVertical,
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconPlus,
	IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import {
	getCampaignVoiceAssignmentIssues,
	getCampaignVoiceAssignmentStats,
	normalizeCampaignVoiceName,
} from '~/modules/campaigns/utils/campaignVoiceAssignments';
import classes from './VoiceAssignmentsList.module.css';

interface VoiceAssignmentsListProps {
	voices: AgentVoiceModel[];
	playingVoiceId: string | null;
	onPlay: (voiceId: string, previewUrl: string) => void;
	onRemove: (voiceId: string) => void;
	onAddVoice: () => void;
	onClearAll: () => void;
}

const VoiceAssignmentsList: React.FC<VoiceAssignmentsListProps> = ({
	voices,
	playingVoiceId,
	onPlay,
	onRemove,
	onAddVoice,
	onClearAll,
}) => {
	const { t } = useTranslation('campaign.form.voices');
	const form = useCampaignFormContext();

	const voiceById = useMemo(
		() => new Map(voices.map((entry) => [entry.voice.id, entry])),
		[voices]
	);

	const selectedVoiceAssignments = form.values.voices ?? [];
	const assignmentIssues = useMemo(
		() => getCampaignVoiceAssignmentIssues(selectedVoiceAssignments, voices),
		[selectedVoiceAssignments, voices]
	);
	const assignmentStats = useMemo(
		() => getCampaignVoiceAssignmentStats(selectedVoiceAssignments, voices),
		[selectedVoiceAssignments, voices]
	);

	const issueMap = useMemo(() => {
		const map = new Map<string, Set<string>>();
		assignmentIssues.forEach((issue) => {
			const current = map.get(issue.voiceId) ?? new Set<string>();
			current.add(issue.code);
			map.set(issue.voiceId, current);
		});
		return map;
	}, [assignmentIssues]);

	if (selectedVoiceAssignments.length === 0) {
		return (
			<Paper withBorder radius='lg' p='md' className={classes.emptyState}>
				<Stack gap='xs' align='flex-start'>
					<Text size='sm' fw={600}>
						{t('assignments.emptyTitle')}
					</Text>
					<Text size='sm' c='dimmed' className={classes.emptyDescription}>
						{t('assignments.emptyDescription')}
					</Text>
					<Button
						type='button'
						variant='light'
						leftSection={<IconPlus size={14} />}
						onClick={onAddVoice}
						size='xs'
					>
						{t('assignments.addVoice')}
					</Button>
				</Stack>
			</Paper>
		);
	}

	return (
		<Paper withBorder radius='lg' p='md' className={classes.wrapper}>
			<Group justify='space-between' align='flex-end' gap='sm' wrap='wrap'>
				<Stack gap={2} className={classes.headerCopy}>
					<Text size='sm' fw={600} className={classes.title}>
						{t('assignments.title')}
					</Text>
					<Text size='xs' c='dimmed' className={classes.description}>
						{t('assignments.description')}
					</Text>
				</Stack>
				<Text size='xs' c='dimmed' className={classes.reorderHint}>
					{t('assignments.orderHint')}
				</Text>
			</Group>

			<div className={classes.table}>
				<div className={classes.tableHeader}>
					<Text size='xs' tt='uppercase' fw={600} c='dimmed'>
						#
					</Text>
					<Text size='xs' tt='uppercase' fw={600} c='dimmed'>
						{t('assignments.voiceColumn')}
					</Text>
					<Text size='xs' tt='uppercase' fw={600} c='dimmed'>
						{t('assignments.nameColumn')}
					</Text>
					<Text size='xs' tt='uppercase' fw={600} c='dimmed'>
						{t('assignments.profileColumn')}
					</Text>
					<Text size='xs' tt='uppercase' fw={600} c='dimmed' ta='right'>
						{t('assignments.actionColumn')}
					</Text>
				</div>

				<div className={classes.rows}>
					{selectedVoiceAssignments.map((assignment, index) => {
						const voice = voiceById.get(assignment.voiceId);
						const voiceName = voice?.voice.name ?? assignment.voiceId;
						const voiceData = voice?.voice;
						const language = voiceData?.language ?? '';
						const gender = voiceData?.gender ?? '';
						const flagEmoji = getLanguageFlagEmoji(language);
						const inputProps = form.getInputProps(`voices.${index}.voiceName`);
						const customName = normalizeCampaignVoiceName(assignment.voiceName);
						const isPlaying = playingVoiceId === assignment.voiceId;
						const previewUrl = voiceData?.previewUrl || '';
						const codes = issueMap.get(assignment.voiceId) ?? new Set<string>();
						const hasQuoteIssue = codes.has('singleQuote');
						const hasDuplicateIssue = codes.has('duplicate');
						const nameError = hasQuoteIssue
							? t('assignments.singleQuoteWarning')
							: hasDuplicateIssue
								? t('assignments.duplicateNameWarning')
								: undefined;

						return (
							<Paper
								key={assignment.voiceId}
								withBorder
								radius='md'
								p='sm'
								className={classes.row}
							>
								<div className={classes.indexCell}>
									<IconGripVertical size={14} className={classes.dragIcon} />
									<Text size='xs' c='dimmed' fw={600}>
										{index + 1}
									</Text>
								</div>

								<Group gap='sm' wrap='nowrap' className={classes.voiceCell}>
									<Avatar
										src={
											(gender || '').toLowerCase() === 'female'
												? '/images/avatar-f-do.png'
												: '/images/avatar-m-do.png'
										}
										alt={voiceName}
										radius='xl'
										size={36}
										className={classes.avatar}
									/>
									<Stack gap={2} className={classes.voiceCopy}>
										<Group gap={6} wrap='nowrap'>
											<Text size='sm' fw={600} className={classes.voiceName}>
												{voiceName}
											</Text>
											<ActionIcon
												variant='subtle'
												color={isPlaying ? 'blue' : 'gray'}
												size='sm'
												radius='xl'
												disabled={!previewUrl}
												onClick={() => onPlay(assignment.voiceId, previewUrl)}
												aria-label={
													isPlaying ? t('card.pause') : t('selected.play')
												}
											>
												{isPlaying ? (
													<IconPlayerPauseFilled size={12} />
												) : (
													<IconPlayerPlayFilled size={12} />
												)}
											</ActionIcon>
										</Group>
										<Text size='xs' c='dimmed' className={classes.voiceMeta}>
											{flagEmoji}
											{language ? ` ${language}` : ''}
											{gender ? ` · ${gender}` : ''}
										</Text>
									</Stack>
								</Group>

								<div className={classes.inputCell}>
									<TextInput
										{...inputProps}
										aria-label={t('assignments.fieldLabel')}
										placeholder={t('assignments.placeholder', {
											voiceName,
										})}
										size='sm'
										rightSection={
											<Text size='xs' c='dimmed' className={classes.charCount}>
												{customName.length}
											</Text>
										}
										rightSectionWidth={52}
										error={nameError}
										className={classes.input}
									/>
								</div>

								<div className={classes.profileCell}>
									<Group gap={6} wrap='wrap' className={classes.profileGroup}>
										<Badge size='sm' variant='light' color='gray'>
											{language || t('assignments.profileUnknown')}
										</Badge>
										<Badge
											size='sm'
											variant='light'
											color={
												(gender || '').toLowerCase() === 'female'
													? 'pink'
													: (gender || '').toLowerCase() === 'male'
														? 'blue'
														: 'gray'
											}
										>
											{gender || t('gender.other')}
										</Badge>
									</Group>
								</div>

								<div className={classes.actionCell}>
									<ActionIcon
										variant='subtle'
										color='gray'
										size='sm'
										radius='xl'
										onClick={() => onRemove(assignment.voiceId)}
										aria-label={t('selected.remove')}
										className={classes.removeButton}
									>
										<IconX size={12} />
									</ActionIcon>
								</div>

								{(hasQuoteIssue || hasDuplicateIssue) && (
									<div className={classes.issueRow}>
										<Text size='xs' c='dimmed'>
											{hasQuoteIssue
												? t('assignments.singleQuoteHint')
												: t('assignments.duplicateNameHint')}
										</Text>
									</div>
								)}
							</Paper>
						);
					})}
				</div>
			</div>

			<Group justify='space-between' align='center' className={classes.footer}>
				<Button
					type='button'
					variant='light'
					leftSection={<IconPlus size={14} />}
					onClick={onAddVoice}
					size='xs'
				>
					{t('assignments.addVoice')}
				</Button>

				<Group gap='xs'>
					<Text size='xs' c='dimmed'>
						{t('assignments.countSummary', {
							count: assignmentStats.effectiveNameCount,
							customCount: assignmentStats.customNameCount,
						})}
					</Text>
					<Button type='button' variant='subtle' onClick={onClearAll} size='xs'>
						{t('selected.clearAll')}
					</Button>
				</Group>
			</Group>
		</Paper>
	);
};

export default VoiceAssignmentsList;
