import { useMemo } from 'react';
import {
	ActionIcon,
	Avatar,
	Button,
	Group,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import {
	IconMicrophone,
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconPlus,
	IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import { getCampaignVoiceAssignmentIssues } from '~/modules/campaigns/utils/campaignVoiceAssignments';
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

	const selectedVoiceAssignments = useMemo(
		() => form.values.voices ?? [],
		[form.values.voices]
	);
	const assignmentIssues = useMemo(
		() => getCampaignVoiceAssignmentIssues(selectedVoiceAssignments, voices),
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
			<div className={classes.emptyState}>
				<div className={classes.emptyIcon}>
					<IconMicrophone size={22} />
				</div>
				<Stack gap={4} align='center'>
					<Text size='sm' fw={600}>
						{t('assignments.emptyTitle')}
					</Text>
					<Text size='xs' c='dimmed' ta='center'>
						{t('assignments.emptyDescription')}
					</Text>
				</Stack>
				<Button
					type='button'
					variant='light'
					leftSection={<IconPlus size={14} />}
					onClick={onAddVoice}
					size='xs'
				>
					{t('assignments.addVoice')}
				</Button>
			</div>
		);
	}

	return (
		<div className={classes.wrapper}>
			<div className={classes.rows}>
				{selectedVoiceAssignments.map((assignment, index) => {
					const voice = voiceById.get(assignment.voiceId);
					const voiceData = voice?.voice;
					const voiceName = voiceData?.name ?? assignment.voiceId;
					const language = voiceData?.language ?? '';
					const gender = voiceData?.gender ?? '';
					const flagEmoji = getLanguageFlagEmoji(language);
					const inputProps = form.getInputProps(`voices.${index}.voiceName`);
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
						<div key={assignment.voiceId} className={classes.row}>
							<div className={classes.voiceHeader}>
								<Group gap='sm' wrap='nowrap' className={classes.voiceIdentity}>
									<Avatar
										src={
											gender.toLowerCase() === 'female'
												? '/images/avatar-f-do.png'
												: '/images/avatar-m-do.png'
										}
										alt={voiceName}
										radius='xl'
										size={36}
									/>
									<Stack gap={2} className={classes.voiceCopy}>
										<Text size='sm' fw={600} className={classes.voiceName}>
											{voiceName}
										</Text>
										<Text size='xs' c='dimmed'>
											{flagEmoji}
											{language ? ` ${language}` : ''}
											{gender ? ` · ${gender}` : ''}
										</Text>
									</Stack>
								</Group>

								<Group gap={4} wrap='nowrap'>
									<ActionIcon
										variant='subtle'
										color={isPlaying ? 'blue' : 'gray'}
										size='md'
										disabled={!previewUrl}
										onClick={() => onPlay(assignment.voiceId, previewUrl)}
										aria-label={
											isPlaying ? t('card.pause') : t('selected.play')
										}
									>
										{isPlaying ? (
											<IconPlayerPauseFilled size={13} />
										) : (
											<IconPlayerPlayFilled size={13} />
										)}
									</ActionIcon>
									<ActionIcon
										variant='subtle'
										color='gray'
										size='md'
										onClick={() => onRemove(assignment.voiceId)}
										aria-label={t('selected.remove')}
										className={classes.removeButton}
									>
										<IconX size={14} />
									</ActionIcon>
								</Group>
							</div>

							<TextInput
								{...inputProps}
								label={t('assignments.fieldLabel')}
								placeholder={t('assignments.placeholder', { voiceName })}
								size='sm'
								error={nameError}
							/>
						</div>
					);
				})}
			</div>

			{selectedVoiceAssignments.length > 1 && (
				<div className={classes.footer}>
					<Button
						type='button'
						variant='subtle'
						color='gray'
						onClick={onClearAll}
						size='xs'
					>
						{t('selected.clearAll')}
					</Button>
				</div>
			)}
		</div>
	);
};

export default VoiceAssignmentsList;
