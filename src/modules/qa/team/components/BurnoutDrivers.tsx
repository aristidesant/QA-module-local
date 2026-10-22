import { useMemo } from 'react';
import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { TriggerRule } from '~/models/qa';
import type { BurnoutAssessment } from '~/modules/qa/analytics/helpers';
import type {
	BurnoutDriver,
	BurnoutDriverStatus,
} from '~/modules/qa/analytics/types';
import {
	describeCondition,
	formatMetricValue,
} from '~/modules/qa/triggers/helpers';
import styles from './BurnoutDrivers.module.css';

/** Highest level first, so the rule that sets the agent's level leads the list. */
const RULE_LEVEL_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

const DRIVER_COLOR: Record<BurnoutDriverStatus, string> = {
	BREACHED: 'red',
	NEAR: 'yellow',
	OK: 'gray',
};

const ALERT = 'var(--mantine-color-red-text)';

interface BurnoutDriversProps {
	assessment: BurnoutAssessment;
	rules: TriggerRule[];
	/** Only what explains the level: the conditions that match or are close to matching. */
	compact?: boolean;
}

/** Why the agent is at their burnout level: the configured rules, their conditions and today's value on each. */
export function BurnoutDrivers({
	assessment,
	rules,
	compact = false,
}: BurnoutDriversProps) {
	const { t } = useTranslation('qa.team');
	const { t: tTriggers } = useTranslation('qa.triggers');

	/** What the agent has right now for one condition, in the unit the rule uses. */
	const driverValue = (d: BurnoutDriver): string => {
		if (d.currentValue === null) return '—';
		const c = d.condition;
		if (c.mode === 'PERCENT_CHANGE' || c.mode === 'BASELINE_DEVIATION')
			return `${d.currentValue > 0 ? '+' : ''}${d.currentValue}%`;
		if (c.mode === 'CONSECUTIVE')
			return t('burnoutTab.drivers.streak', { count: d.currentValue });
		return formatMetricValue(c.metricId, d.currentValue);
	};

	/** Conditions grouped by rule: the rules the agent meets first, highest level first. */
	const groups = useMemo(() => {
		const byRule = new Map<string, BurnoutDriver[]>();
		for (const d of assessment.drivers)
			byRule.set(d.ruleId, [...(byRule.get(d.ruleId) ?? []), d]);
		return [...byRule.entries()]
			.map(([ruleId, drivers]) => ({
				ruleId,
				drivers,
				rule: rules.find((r) => r.id === ruleId),
				matched: assessment.matchedRuleIds.includes(ruleId),
			}))
			.sort(
				(a, b) =>
					Number(b.matched) - Number(a.matched) ||
					RULE_LEVEL_RANK[a.rule?.burnoutLevel ?? 'LOW'] -
						RULE_LEVEL_RANK[b.rule?.burnoutLevel ?? 'LOW']
			);
	}, [assessment, rules]);

	const matchedGroups = groups.filter((g) => g.matched);
	const visibleGroups = compact
		? groups
				.map((g) => ({
					...g,
					drivers: g.drivers.filter((d) => d.status !== 'OK'),
				}))
				.filter((g) => g.drivers.length > 0)
		: groups;

	if (groups.length === 0)
		return (
			<Text size='sm' c='dimmed'>
				{t('burnoutTab.drivers.empty')}
			</Text>
		);

	return (
		<Stack gap='md'>
			<Text size='sm' fw={500}>
				{matchedGroups.length > 0
					? t('burnoutTab.drivers.why.at', {
							count: matchedGroups.length,
							level: t(`burnout.${assessment.level}`),
							rules: matchedGroups
								.map((g) => g.rule?.name ?? g.ruleId)
								.join(', '),
						})
					: t('burnoutTab.drivers.why.none')}
				{assessment.near > 0 &&
					` ${t('burnoutTab.drivers.why.near', { count: assessment.near })}`}
			</Text>
			{visibleGroups.map(({ ruleId, drivers, rule, matched }) => (
				<Paper key={ruleId} withBorder radius='md' p='md'>
					<Stack gap='sm'>
						<Stack gap={2}>
							<Group gap='xs' wrap='wrap'>
								<Text fw={600}>{rule?.name ?? ruleId}</Text>
								<Badge
									size='xs'
									variant={matched ? 'light' : 'outline'}
									color={matched ? 'red' : 'gray'}
								>
									{matched
										? t('burnoutTab.drivers.matched')
										: t('burnoutTab.drivers.notMet')}
								</Badge>
							</Group>
							<Text size='xs' c='dimmed'>
								{[
									t(
										`burnoutTab.drivers.rule.logic${rule?.conditionLogic ?? 'ALL'}`
									),
									rule?.burnoutLevel
										? t('burnoutTab.drivers.rule.sets', {
												level: t(`burnout.${rule.burnoutLevel.toLowerCase()}`),
											})
										: null,
									t('burnoutTab.drivers.rule.progress', {
										matching: assessment.drivers.filter(
											(d) => d.ruleId === ruleId && d.status === 'BREACHED'
										).length,
										total: assessment.drivers.filter((d) => d.ruleId === ruleId)
											.length,
									}),
								]
									.filter(Boolean)
									.join(' · ')}
							</Text>
						</Stack>
						<Stack gap='xs'>
							{drivers.map((d) => (
								<Group
									key={d.id}
									justify='space-between'
									align='center'
									wrap='nowrap'
									className={styles.driver}
									data-status={d.status}
								>
									<Text size='sm'>
										{describeCondition(tTriggers, d.condition)}
									</Text>
									<Group gap='md' wrap='nowrap'>
										<Stack gap={0} align='flex-end'>
											<Text size='xs' c='dimmed'>
												{t('burnoutTab.drivers.now')}
											</Text>
											<Text
												size='sm'
												fw={700}
												c={d.status === 'BREACHED' ? ALERT : undefined}
											>
												{driverValue(d)}
											</Text>
										</Stack>
										<Badge
											size='xs'
											variant='light'
											color={DRIVER_COLOR[d.status]}
										>
											{t(`burnoutTab.driverStatus.${d.status}`)}
										</Badge>
									</Group>
								</Group>
							))}
						</Stack>
					</Stack>
				</Paper>
			))}
		</Stack>
	);
}
