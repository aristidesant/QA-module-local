import { Group, Stack, Text } from '@mantine/core';
import { IconChartLine } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
import { ImpactBadge } from '../components/ImpactBadge';
import {
	summarizeSessionImpacts,
	type SessionImpactRow,
} from '../postCoaching';
import { SCORECARD_DIMENSION_META } from '../scorecard';

const ROWS_SHOWN = 5;

interface SessionImpactCardProps {
	rows: SessionImpactRow[];
	onOpen: (sessionId: string) => void;
}

/** How the agent's scorecard moved the week after each coaching session. */
export function SessionImpactCard({ rows, onOpen }: SessionImpactCardProps) {
	const { t } = useTranslation(['qa.lms', 'qa.coaching']);
	const summary = summarizeSessionImpacts(rows)[0];

	return (
		<SectionCard
			title={t('qa.lms:agent.coaching.impact.title')}
			description={t('qa.lms:agent.coaching.impact.description')}
			icon={IconChartLine}
		>
			{rows.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('qa.lms:agent.coaching.impact.empty')}
				</Text>
			) : (
				<Stack gap='sm'>
					<Group gap='xs'>
						<Text size='sm' fw={600}>
							{t('qa.lms:agent.coaching.impact.summary', {
								improved: summary.improved,
								same: summary.same,
								declined: summary.declined,
							})}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('qa.lms:agent.coaching.impact.measured', {
								count: summary.measured,
							})}
						</Text>
					</Group>
					<Stack gap={4}>
						{rows.slice(0, ROWS_SHOWN).map((row) => (
							<Group
								key={row.sessionId}
								justify='space-between'
								wrap='nowrap'
								gap='sm'
								className={pointerStyles.pointer}
								onClick={() => onOpen(row.sessionId)}
							>
								<Stack gap={0} flex={1} miw={0}>
									<Text size='sm' fw={500} lineClamp={1}>
										{row.topic}
									</Text>
									<Text size='xs' c='dimmed'>
										{dayjs(row.day).format('D MMM YYYY')} ·{' '}
										{row.dimension
											? t(
													`qa.coaching:${SCORECARD_DIMENSION_META[row.dimension].labelKey}`
												)
											: t('qa.lms:agent.coaching.impact.overall')}
									</Text>
								</Stack>
								{row.before !== null && row.after !== null && (
									<Text size='sm' ff='monospace'>
										{row.before} → {row.after}
									</Text>
								)}
								<ImpactBadge verdict={row.verdict} />
							</Group>
						))}
					</Stack>
				</Stack>
			)}
		</SectionCard>
	);
}

export default SessionImpactCard;
