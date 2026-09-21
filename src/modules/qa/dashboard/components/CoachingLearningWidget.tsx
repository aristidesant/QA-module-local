import {
	Badge,
	Group,
	Paper,
	Progress,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { IconBook2, IconMessageCircle2 } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type {
	CoachingSessionRecord,
	LmsAssignment,
	LmsContent,
} from '~/models/qa';
import { isOverdue, needsResponse } from '~/modules/qa/lms/helpers';
import cardStyles from '~/modules/qa/lms/components/Cards.module.css';
import classes from './CoachingLearningWidget.module.css';

export interface PendingLearningItem {
	assignment: LmsAssignment;
	content: LmsContent | undefined;
}

interface CoachingLearningWidgetProps {
	/** Most recent completed coaching session, or null if the agent hasn't had one yet. */
	lastSession: CoachingSessionRecord | null;
	/** Mandatory assignments not yet completed, most urgent first. */
	pendingLearning: PendingLearningItem[];
	onOpenCoaching: () => void;
	onOpenLearning: (contentId: string) => void;
}

/**
 * Agent dashboard widget: what the agent was last coached on, and what
 * assigned material is still pending (with progress), so both threads
 * of "things I owe my coach" stay visible from the dashboard.
 */
export function CoachingLearningWidget({
	lastSession,
	pendingLearning,
	onOpenCoaching,
	onOpenLearning,
}: CoachingLearningWidgetProps) {
	return (
		<Stack gap='lg'>
			<Stack gap={8}>
				<Group gap={6}>
					<ThemeIcon size='sm' variant='light' color='gray'>
						<IconMessageCircle2 size={14} />
					</ThemeIcon>
					<Text fw={600} size='sm'>
						Last coaching
					</Text>
				</Group>
				{lastSession ? (
					<Paper
						withBorder
						p='sm'
						radius='md'
						className={cardStyles.clickable}
						onClick={onOpenCoaching}
					>
						<Stack gap={4}>
							<Group justify='space-between' align='flex-start' wrap='nowrap'>
								<Text size='sm' fw={500}>
									{lastSession.topic}
								</Text>
								<Text size='xs' c='dimmed' className={classes.noShrink}>
									{dayjs(lastSession.date).format('D MMM')}
								</Text>
							</Group>
							<Text size='xs' c='dimmed'>
								with {lastSession.coachName}
							</Text>
							<Text size='sm'>
								{lastSession.outcome ??
									lastSession.talkingPoints[0] ??
									'No summary recorded for this session.'}
							</Text>
						</Stack>
					</Paper>
				) : (
					<Text size='sm' c='dimmed'>
						No completed coaching sessions yet.
					</Text>
				)}
			</Stack>

			<Stack gap={8}>
				<Group gap={6}>
					<ThemeIcon size='sm' variant='light' color='gray'>
						<IconBook2 size={14} />
					</ThemeIcon>
					<Text fw={600} size='sm'>
						Pending learning
					</Text>
				</Group>
				{pendingLearning.length === 0 ? (
					<Text size='sm' c='dimmed'>
						Nothing pending right now.
					</Text>
				) : (
					<Stack gap='xs'>
						{pendingLearning.map(({ assignment, content }) => {
							const overdue = isOverdue(assignment);
							const pending = needsResponse(assignment);
							return (
								<Paper
									key={assignment.id}
									withBorder
									p='sm'
									radius='md'
									className={cardStyles.clickable}
									onClick={() => onOpenLearning(assignment.contentId)}
								>
									<Stack gap={4}>
										<Group
											justify='space-between'
											align='flex-start'
											wrap='nowrap'
										>
											<Text size='sm' fw={500} flex={1} miw={0}>
												{content?.title ?? assignment.contentId}
											</Text>
											{pending ? (
												<Badge size='xs' color='yellow' variant='light'>
													Needs response
												</Badge>
											) : (
												<Text
													size='xs'
													c={overdue ? 'red' : 'dimmed'}
													fw={overdue ? 600 : 400}
													className={classes.noShrink}
												>
													{overdue ? 'Overdue' : 'Due'}{' '}
													{dayjs(assignment.dueDate).format('D MMM')}
												</Text>
											)}
										</Group>
										{!pending && (
											<Stack gap={2}>
												<Progress
													value={assignment.progress}
													size='sm'
													radius='xl'
													color={overdue ? 'red' : undefined}
												/>
												<Text size='xs' c='dimmed'>
													{assignment.progress}% complete
												</Text>
											</Stack>
										)}
									</Stack>
								</Paper>
							);
						})}
					</Stack>
				)}
			</Stack>
		</Stack>
	);
}

export default CoachingLearningWidget;
