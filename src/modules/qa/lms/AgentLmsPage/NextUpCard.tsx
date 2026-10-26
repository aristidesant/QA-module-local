import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import type { AgentProfile } from '~/modules/qa/team/types';
import areaClasses from '../components/area.module.css';
import { AreaMark } from '../components/AreaMark';
import { AreaScoreTile } from '../components/AreaScoreTile';
import rowClasses from '../components/LearningRow.module.css';
import { LMS_FORMAT_META } from '../constants';
import { dueLabel, effectiveStatus } from '../helpers';
import classes from './NextUpCard.module.css';

interface NextUpCardProps {
	assignment: LmsAssignment;
	content: LmsContent;
	profile: AgentProfile | undefined;
	onOpen: () => void;
}

/** The single item to start with: its reason leads, the agent's score for that area sits beside it. */
export function NextUpCard({
	assignment,
	content,
	profile,
	onOpen,
}: NextUpCardProps) {
	const { t } = useTranslation('qa.lms');
	const overdue = effectiveStatus(assignment) === 'OVERDUE';
	const inProgress = assignment.progress > 0;

	// SectionCard forwards className but not data attributes, so the hue variable
	// lives on this wrapper and both the hero bar and the sparkline inherit it.
	return (
		<div className={areaClasses.area} data-area={content.area}>
			<SectionCard padding='lg' className={classes.hero} id='next-up'>
				<div className={classes.grid}>
					<Stack gap='sm'>
						<Text size='xs' c='dimmed'>
							{t('agent.nextUp.caption')}
						</Text>
						<Title order={3}>{content.title}</Title>
						<Text size='md'>{assignment.reason}</Text>
						<Group gap='md' wrap='wrap'>
							<AreaMark
								area={content.area}
								subItem={content.subItem}
								size='sm'
							/>
							<Text size='sm' c='dimmed'>
								{t('player.facts', {
									format: t(LMS_FORMAT_META[content.format].labelKey),
									minutes: content.durationMin,
								})}
							</Text>
							<Text
								size='sm'
								c='dimmed'
								className={overdue ? rowClasses.due : undefined}
							>
								{dueLabel(t, assignment)}
							</Text>
						</Group>
						<Group>
							<Button size='sm' onClick={onOpen}>
								{t(inProgress ? 'agent.nextUp.continue' : 'agent.nextUp.start')}
							</Button>
						</Group>
					</Stack>
					<div className={classes.score}>
						<AreaScoreTile area={content.area} profile={profile} />
					</div>
				</div>
			</SectionCard>
		</div>
	);
}
