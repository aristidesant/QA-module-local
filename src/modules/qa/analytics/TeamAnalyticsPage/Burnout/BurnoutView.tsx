import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Group,
	Progress,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { describeCondition } from '~/modules/qa/triggers/helpers';
import { assessBurnout, burnoutCandidates } from '../../helpers';
import type { BurnoutDriver } from '../../types';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import styles from '../TeamAnalyticsPage.module.css';

const MAX_VISIBLE_DRIVERS = 2;

const BurnoutView = () => {
	const { t } = useTranslation('qa.teamAnalytics');
	const { t: tTriggers } = useTranslation('qa.triggers');
	const navigate = useNavigate();
	const { role } = useTeamAnalyticsData();
	const triggerRules = useTriggerRulesStore(selectTriggerRules);

	const candidates = useMemo(() => {
		return burnoutCandidates(role, triggerRules).map((agent) => {
			const assessment = assessBurnout(agent.id, triggerRules);
			return {
				agent,
				risk: assessment,
				breached: assessment.drivers.filter((d) => d.status === 'BREACHED'),
				near: assessment.drivers.filter((d) => d.status === 'NEAR'),
			};
		});
	}, [role, triggerRules]);

	/** Drivers are the conditions of the burnout rules, labelled as in the rule editor. */
	const driverLabel = (driver: BurnoutDriver) =>
		describeCondition(tTriggers, driver.condition);

	const header = (
		<Group justify='space-between' align='flex-start' wrap='nowrap'>
			<div>
				<Text fw={600} size='sm'>
					{t('burnout.title')}
				</Text>
				<Text size='sm' c='dimmed'>
					{t(`burnout.listDescription.${role}`)}
				</Text>
			</div>
			<Button
				variant='subtle'
				size='xs'
				leftSection={<IconSettings size={14} />}
				onClick={() =>
					navigate(
						role === 'qa-manager'
							? '/qa/qa-manager/triggers'
							: '/qa/supervisor/triggers'
					)
				}
			>
				{t('burnout.manageRules')}
			</Button>
		</Group>
	);

	if (candidates.length === 0) {
		return (
			<Stack gap='md'>
				{header}
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('burnout.empty')}
				</Text>
			</Stack>
		);
	}

	const rows = candidates.map(({ agent, risk, breached, near }) => {
		const visible = breached.slice(0, MAX_VISIBLE_DRIVERS);
		const hidden = breached.slice(MAX_VISIBLE_DRIVERS);
		const riskColor = risk.level === BurnoutRiskLevel.HIGH ? 'red' : 'orange';

		return (
			<Table.Tr key={agent.id}>
				<Table.Td>
					<Text fw={500} size='sm'>
						{agent.name}
					</Text>
				</Table.Td>
				{role === 'qa-manager' && (
					<Table.Td>
						<Text size='sm' c='dimmed'>
							{agent.supervisorName}
						</Text>
					</Table.Td>
				)}
				<Table.Td className={styles.levelColumn}>
					<Badge color={riskColor} variant='light' size='sm'>
						{risk.level === BurnoutRiskLevel.HIGH
							? t('burnout.levelHigh')
							: t('burnout.levelMedium')}
					</Badge>
				</Table.Td>
				<Table.Td className={styles.riskColumn}>
					<Group gap='xs' wrap='nowrap'>
						<Progress
							value={risk.percentage}
							color={riskColor}
							size='sm'
							className={styles.riskBar}
						/>
						<Text size='sm' fw={600}>
							{risk.percentage}%
						</Text>
					</Group>
				</Table.Td>
				<Table.Td>
					<Group gap={4} wrap='wrap'>
						{visible.map((driver) => (
							<Tooltip key={driver.id} label={driver.ruleName} withArrow>
								<Badge variant='outline' size='sm' color='red' tt='none'>
									{driverLabel(driver)}
								</Badge>
							</Tooltip>
						))}
						{hidden.length > 0 && (
							<Tooltip label={hidden.map(driverLabel).join(', ')} withArrow>
								<Badge variant='light' size='sm' color='red'>
									{t('filters.chips.more', { count: hidden.length })}
								</Badge>
							</Tooltip>
						)}
						{near.length > 0 && (
							<Tooltip label={near.map(driverLabel).join(', ')} withArrow>
								<Badge variant='light' size='sm' color='yellow' tt='none'>
									{t('burnout.driverStatus.NEAR')} ({near.length})
								</Badge>
							</Tooltip>
						)}
						{breached.length === 0 && near.length === 0 && (
							<Text size='sm' c='dimmed'>
								{t('common.na')}
							</Text>
						)}
					</Group>
				</Table.Td>
			</Table.Tr>
		);
	});

	return (
		<Stack gap='md'>
			{header}

			<div className={styles.tableSurface}>
				<Table striped highlightOnHover verticalSpacing='sm' miw={860}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('burnout.columns.agent')}</Table.Th>
							{role === 'qa-manager' && (
								<Table.Th>{t('burnout.columns.supervisor')}</Table.Th>
							)}
							<Table.Th className={styles.levelColumn}>
								{t('burnout.columns.level')}
							</Table.Th>
							<Table.Th className={styles.riskColumn}>
								{t('burnout.columns.risk')}
							</Table.Th>
							<Table.Th>{t('burnout.columns.drivers')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</div>
		</Stack>
	);
};

export default BurnoutView;
