import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import { CRITICAL_ISSUES } from '~/modules/qa/coaching/components/QuietIndicators';
import queueStyles from '~/modules/qa/coaching/components/Queue.module.css';
import { Caption } from '~/modules/qa/coaching/components/SessionBrief';
import { weakestDimension } from '~/modules/qa/coaching/helpers';
import { WEEKLY_RULE_ID } from '~/modules/qa/coaching/weeklyBatch';
import { DIMENSION_META, DIMENSION_ORDER } from '~/modules/qa/team/constants';
import { TrendDelta } from '~/modules/qa/team/components/TrendDelta';
import type { AgentProfile } from '~/modules/qa/team/types';
import styles from './AutomatedCoachingMessage.module.css';

interface AutomatedCoachingMessageProps {
	session: CoachingSessionRecord;
	profile: AgentProfile;
}

/**
 * The weekly automated coaching message as scannable data: a greeting, last
 * week's score per dimension (neutral tiles) and the
 * focus the agent should work on. The attached material is not repeated here;
 * the "Learning material" card below it already lists it.
 */
export function AutomatedCoachingMessage({
	session,
	profile,
}: AutomatedCoachingMessageProps) {
	const { t } = useTranslation(['qa.inbox', 'qa.team', 'qa.calls']);
	const firstName = profile.agent.name.split(' ')[0];
	const weakest = weakestDimension(profile);
	const byKey = new Map(profile.dimensions.map((d) => [d.key, d]));
	const brief = session.brief;
	const finding = brief?.findings[0];
	// A rule that fired on its own reads differently from the Monday review.
	const triggered = session.ruleId !== WEEKLY_RULE_ID;
	const copy = (key: string) =>
		triggered
			? `details.automated.triggered.${key}`
			: `details.automated.${key}`;

	return (
		<SectionCard icon={IconSparkles} title={t(copy('title'))} padding='md'>
			<Stack gap='md'>
				<Text size='sm'>
					{t(copy('greeting'), {
						name: firstName,
						rule: session.topic,
					})}
				</Text>

				<Stack gap='xs'>
					<Caption>{t(copy('scores'))}</Caption>
					<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='xs'>
						{DIMENSION_ORDER.map((key) => {
							const meta = DIMENSION_META[key];
							const d = byKey.get(key);
							if (!d) return null;
							const Icon = meta.icon;
							return (
								<Stack
									key={key}
									gap={6}
									className={styles.tile}
									data-focus={key === weakest?.key ? '' : undefined}
								>
									<Group gap={6} wrap='nowrap'>
										<Icon
											size={14}
											color='var(--mantine-color-dimmed)'
											aria-hidden
										/>
										<Caption>{t(meta.labelKey, { ns: 'qa.team' })}</Caption>
									</Group>
									<Text size='xl' fw={700} lh={1.1}>
										{d.score}
										<Text span size='sm' fw={500} c='dimmed'>
											{meta.unit}
										</Text>
									</Text>
									<TrendDelta
										delta={d.delta}
										trend={d.trend}
										unit={meta.unit}
										suffix={t('details.automated.vsLastWeek')}
									/>
								</Stack>
							);
						})}
					</SimpleGrid>
				</Stack>

				{weakest && (
					<Stack
						gap={4}
						className={styles.focus}
						data-color={DIMENSION_META[weakest.key].color}
					>
						<Caption>{t(copy('focusLabel'))}</Caption>
						<Text size='md' fw={600}>
							{t(DIMENSION_META[weakest.key].labelKey, { ns: 'qa.team' })}
						</Text>
						<Text size='sm' lh={1.6} maw='68ch'>
							{t(copy('focusTip'))}
						</Text>
					</Stack>
				)}

				{brief && finding && (
					<Stack gap={6}>
						<Caption>{t('details.automated.critical')}</Caption>
						<Group gap='sm'>
							<Badge
								size='sm'
								variant={
									CRITICAL_ISSUES.has(finding.issue) ? 'light' : 'outline'
								}
								color={CRITICAL_ISSUES.has(finding.issue) ? 'red' : 'gray'}
							>
								{t(`issues.${finding.issue as CallIssueKey}`, {
									ns: 'qa.calls',
								})}
							</Badge>
							<Text size='xs' c='dimmed'>
								{t('details.coaching.problemOf', {
									count: finding.calls,
									total: brief.calls,
								})}
							</Text>
						</Group>
					</Stack>
				)}

				{brief?.approach && (
					<Stack gap={4}>
						<Caption>{t('details.coaching.approach')}</Caption>
						<Text size='sm' className={queueStyles.preWrap}>
							{brief.approach}
						</Text>
					</Stack>
				)}

				{brief?.example && (
					<Stack gap={4}>
						<Caption>{t('details.coaching.example')}</Caption>
						<Text size='sm' c='dimmed' className={queueStyles.preWrap}>
							{brief.example}
						</Text>
					</Stack>
				)}
			</Stack>
		</SectionCard>
	);
}

export default AutomatedCoachingMessage;
