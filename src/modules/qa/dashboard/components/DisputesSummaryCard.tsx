import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Group, Progress, Stack, Text } from '@mantine/core';
import {
	IconArrowRight,
	IconChevronRight,
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useDisputesStore, selectCases } from '~/stores/qa/disputesStore';
import { casesForRole } from '~/modules/qa/disputes/cases/helpers';
import { STATUS_COLOR } from '~/modules/qa/disputes/cases/constants';
import { buildDisputesSummary } from '~/modules/qa/disputes/cases/weekSummary';
import { disputesListPath, type InboxRole } from '~/modules/qa/inbox/constants';
import DrillRow from './DrillRow';
import styles from '../Dashboard.module.css';

interface DisputesSummaryCardProps {
	/** Scopes the disputes counted and where the links lead. */
	role: InboxRole;
}

/** Plain-text signed count: "+2", "−1". */
const signed = (value: number) =>
	value > 0 ? `+${value}` : `−${Math.abs(value)}`;

/** General view of disputes for a manager: how many are open, how many were decided this week and how, against last week. */
export const DisputesSummaryCard: React.FC<DisputesSummaryCardProps> = ({
	role,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const navigate = useNavigate();
	const cases = useDisputesStore(selectCases);
	const summary = useMemo(
		() => buildDisputesSummary(casesForRole(cases, role)),
		[cases, role]
	);
	const { open, oldestOpenDays, thisWeek, delta, acceptanceRate } = summary;
	const listPath = disputesListPath(role);
	const TrendIcon =
		delta > 0 ? IconTrendingUp : delta < 0 ? IconTrendingDown : IconMinus;

	return (
		<SectionCard
			title={t('roleDashboard.disputesSummary.title')}
			description={t('roleDashboard.disputesSummary.description')}
			fullHeight
			headerActions={
				<Button
					variant='subtle'
					size='xs'
					rightSection={<IconArrowRight size={14} />}
					onClick={() => navigate(listPath)}
				>
					{t('roleDashboard.disputesSummary.manage')}
				</Button>
			}
		>
			<Stack gap='md'>
				<DrillRow
					onClick={
						open > 0 ? () => navigate(`${listPath}?status=open`) : undefined
					}
					hint={t('drill.hint')}
				>
					<Stack gap={2}>
						<Group justify='space-between' align='baseline' wrap='nowrap'>
							<Group gap='xs' align='baseline'>
								<Text className={styles.scoreValue}>{open}</Text>
								<Text size='sm' c='dimmed'>
									{t('roleDashboard.disputesSummary.openNow')}
								</Text>
							</Group>
							{open > 0 && <IconChevronRight size={14} />}
						</Group>
						<Text size='xs' c='dimmed'>
							{oldestOpenDays === null
								? t('roleDashboard.disputesSummary.noneOpen')
								: t('roleDashboard.attention.disputes.hint', {
										days: oldestOpenDays,
									})}
						</Text>
					</Stack>
				</DrillRow>

				<Divider />

				<Stack gap='xs'>
					<Group justify='space-between' wrap='nowrap'>
						<Text size='sm' fw={500}>
							{t('roleDashboard.disputesSummary.managedThisWeek')}
						</Text>
						<Group gap={6} wrap='nowrap'>
							<Text size='sm' fw={600}>
								{thisWeek.managed}
							</Text>
							<Group gap={2} wrap='nowrap' c='dimmed'>
								<TrendIcon size={14} />
								<Text size='xs' c='dimmed'>
									{delta === 0
										? t('roleDashboard.disputesSummary.sameAsLastWeek')
										: t('roleDashboard.disputesSummary.vsLastWeek', {
												delta: signed(delta),
											})}
								</Text>
							</Group>
						</Group>
					</Group>

					{thisWeek.managed === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('roleDashboard.disputesSummary.noneManaged')}
						</Text>
					) : (
						<>
							<Progress.Root size='sm'>
								<Progress.Section
									value={(thisWeek.accepted / thisWeek.managed) * 100}
									color={STATUS_COLOR.accepted}
									aria-label={t('roleDashboard.disputesSummary.accepted', {
										count: thisWeek.accepted,
									})}
								/>
								<Progress.Section
									value={(thisWeek.rejected / thisWeek.managed) * 100}
									color={STATUS_COLOR.rejected}
									aria-label={t('roleDashboard.disputesSummary.rejected', {
										count: thisWeek.rejected,
									})}
								/>
							</Progress.Root>
							<Text size='xs' c='dimmed'>
								{[
									t('roleDashboard.disputesSummary.accepted', {
										count: thisWeek.accepted,
									}),
									t('roleDashboard.disputesSummary.rejected', {
										count: thisWeek.rejected,
									}),
									t('roleDashboard.disputesSummary.acceptance', {
										rate: acceptanceRate,
									}),
									...(thisWeek.partial > 0
										? [
												t('roleDashboard.disputesSummary.partial', {
													count: thisWeek.partial,
												}),
											]
										: []),
								].join(' · ')}
							</Text>
						</>
					)}
				</Stack>
			</Stack>
		</SectionCard>
	);
};

export default DisputesSummaryCard;
