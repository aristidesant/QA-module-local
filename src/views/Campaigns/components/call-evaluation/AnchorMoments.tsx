import {
	ActionIcon,
	Badge,
	Group,
	Paper,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconHeadset,
	IconMapPin,
	IconPlayerPlay,
	IconUser,
} from '@tabler/icons-react';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
import { SectionCard } from '~/components/SectionCard';
import { MaskedText } from '~/modules/qa/privacy/components/MaskedText';
import type { TimelineAnchor } from '../../types';
import { ANCHOR_STATUS_COLOR, ANCHOR_STATUS_VARIANT } from './anchors';
import cardStyles from './MomentCard.module.css';

interface AnchorMomentsProps {
	title: string;
	description: string;
	anchors: TimelineAnchor[];
	activeAnchorId: string | null;
	onJump: (anchor: TimelineAnchor) => void;
	emptyLabel: string;
	/** Call detail only: a reveal shows the real data there. */
	callId?: string;
}

/** The findings of a tab in call order: click one to play the recording from there. */
export function AnchorMoments({
	title,
	description,
	anchors,
	activeAnchorId,
	onJump,
	emptyLabel,
	callId,
}: AnchorMomentsProps) {
	const attention = anchors.filter((a) => a.status === 'alert').length;
	return (
		<SectionCard
			title={title}
			description={description}
			icon={IconMapPin}
			headerActions={
				<Group gap='xs'>
					<Badge variant='light' color='gray'>
						{anchors.length} moments
					</Badge>
					{attention > 0 && (
						<Badge variant='light' color='red'>
							{attention} need attention
						</Badge>
					)}
				</Group>
			}
		>
			{anchors.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{emptyLabel}
				</Text>
			) : (
				<Stack gap='xs'>
					{anchors.map((anchor) => (
						<Paper
							key={anchor.id}
							withBorder
							radius='sm'
							p='xs'
							className={`${cardStyles.card} ${pointerStyles.pointer}`}
							data-active={anchor.id === activeAnchorId || undefined}
							onClick={() => onJump(anchor)}
						>
							<Group justify='space-between' wrap='nowrap' align='flex-start'>
								<Stack gap={4}>
									<Group gap='xs' wrap='wrap'>
										<Badge
											size='sm'
											tt='none'
											variant={ANCHOR_STATUS_VARIANT[anchor.status]}
											color={ANCHOR_STATUS_COLOR[anchor.status]}
										>
											{anchor.tag}
										</Badge>
										<Group gap={4} wrap='nowrap'>
											{anchor.speaker === 'agent' ? (
												<IconHeadset size={12} />
											) : (
												<IconUser size={12} />
											)}
											<Text size='xs' c='dimmed'>
												{anchor.speaker === 'agent' ? 'Agent' : 'Customer'} ·{' '}
												{anchor.timestamp}
											</Text>
										</Group>
									</Group>
									<Text size='xs' c='dimmed'>
										{anchor.label}
									</Text>
									<Text size='sm' fs='italic'>
										"
										<MaskedText
											text={anchor.highlight ?? anchor.quote}
											callId={callId}
										/>
										"
									</Text>
								</Stack>
								<Tooltip label='Play from here' withArrow>
									<ActionIcon
										size='sm'
										variant='subtle'
										aria-label='Play from here'
										onClick={(e) => {
											e.stopPropagation();
											onJump(anchor);
										}}
									>
										<IconPlayerPlay size={14} />
									</ActionIcon>
								</Tooltip>
							</Group>
						</Paper>
					))}
				</Stack>
			)}
		</SectionCard>
	);
}
