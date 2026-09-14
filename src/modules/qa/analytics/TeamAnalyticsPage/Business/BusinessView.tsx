import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Card,
	Group,
	Progress,
	SimpleGrid,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { aggregateBusiness } from '../../helpers';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import styles from '../TeamAnalyticsPage.module.css';

const BusinessView = () => {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, previousCalls, filters } = useTeamAnalyticsData();

	const summary = useMemo(
		() => aggregateBusiness(calls, previousCalls, filters.granularity),
		[calls, previousCalls, filters.granularity]
	);

	const na = t('common.na');

	if (calls.length === 0) {
		return (
			<Text size='sm' c='dimmed' py='xl' ta='center'>
				{t('business.empty')}
			</Text>
		);
	}

	return (
		<Stack gap='xl'>
			<section>
				<Text fw={600} size='sm'>
					{t('business.conversionTrend')}
				</Text>
				<Text size='sm' c='dimmed' mb='md'>
					{t('business.conversionTrendDescription')}
				</Text>
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
					<Card withBorder p='md'>
						<Text size='sm' c='dimmed'>
							{t('business.offered')}
						</Text>
						<Text fw={700} size='lg'>
							{summary.conversionTrend.reduce((s, p) => s + p.offered, 0)}
						</Text>
					</Card>
					<Card withBorder p='md'>
						<Text size='sm' c='dimmed'>
							{t('business.converted')}
						</Text>
						<Text fw={700} size='lg'>
							{summary.conversionTrend.reduce((s, p) => s + p.converted, 0)}
						</Text>
					</Card>
					<Card withBorder p='md'>
						<Text size='sm' c='dimmed'>
							{t('kpis.conversionRate')}
						</Text>
						<Text fw={700} size='lg'>
							{summary.overallRate === null
								? na
								: t('business.overallRate', { rate: summary.overallRate })}
						</Text>
						{summary.bestTimeSlot && (
							<Text size='xs' c='dimmed'>
								{t('business.bestSlot')}: {summary.bestTimeSlot.slot} ·{' '}
								{t('business.bestSlotRate', {
									rate: summary.bestTimeSlot.rate,
								})}
							</Text>
						)}
					</Card>
				</SimpleGrid>
			</section>

			<section>
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
					{summary.signals.map((signal) => (
						<Card key={signal.kind} withBorder p='md'>
							<Text size='sm' fw={500}>
								{t(`business.signals.${signal.kind}`)}
							</Text>
							<Group gap='xs' align='baseline'>
								<Text fw={700} size='lg'>
									{signal.share}%
								</Text>
								<Text size='xs' c='dimmed'>
									{t('business.signalCalls', { count: signal.count })}
								</Text>
							</Group>
						</Card>
					))}
				</SimpleGrid>
			</section>

			{summary.reasons.length > 0 && (
				<section>
					<Text fw={600} size='sm' mb='md'>
						{t('business.reasons')}
					</Text>
					<Stack gap='sm'>
						{summary.reasons.map((reason) => (
							<Card key={reason.key} withBorder p='md'>
								<Group justify='space-between' mb='xs'>
									<Text size='sm' fw={500}>
										{t(`business.reasonLabels.${reason.key}`)}
									</Text>
									<Badge size='sm' variant='light'>
										{t('business.signalCalls', { count: reason.count })}
									</Badge>
								</Group>
								<Group gap='sm' wrap='nowrap'>
									<Progress value={reason.share} size='sm' flex={1} />
									<Text size='sm' fw={500} className={styles.percentValue}>
										{reason.share}%
									</Text>
								</Group>
							</Card>
						))}
					</Stack>
				</section>
			)}

			{summary.products.length > 0 && (
				<section>
					<Text fw={600} size='sm' mb='md'>
						{t('business.products')}
					</Text>
					<div className={styles.tableSurface}>
						<Table striped highlightOnHover verticalSpacing='sm' miw={480}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('business.columns.product')}</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.offered')}
									</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.converted')}
									</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.rate')}
									</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{summary.products.map((product) => (
									<Table.Tr key={product.product}>
										<Table.Td>
											<Text size='sm' fw={500}>
												{product.product}
											</Text>
										</Table.Td>
										<Table.Td align='right'>{product.offered}</Table.Td>
										<Table.Td align='right'>{product.converted}</Table.Td>
										<Table.Td align='right'>
											<Text size='sm' fw={600}>
												{product.rate}%
											</Text>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
				</section>
			)}

			{summary.byAgent.length > 0 && (
				<section>
					<Text fw={600} size='sm'>
						{t('business.byAgentTitle')}
					</Text>
					<Text size='sm' c='dimmed' mb='md'>
						{t('business.byAgentDescription')}
					</Text>
					<div className={styles.tableSurface}>
						<Table striped highlightOnHover verticalSpacing='sm' miw={720}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('business.columns.agent')}</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.calls')}
									</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.early')}
									</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.unhandled')}
									</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.competitor')}
									</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.mistargeted')}
									</Table.Th>
									<Table.Th align='right'>
										{t('business.columns.conversion')}
									</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{summary.byAgent.map((row) => (
									<Table.Tr key={row.agentId}>
										<Table.Td>
											<Text size='sm' fw={500}>
												{row.agentName}
											</Text>
										</Table.Td>
										<Table.Td align='right'>{row.calls}</Table.Td>
										<Table.Td align='right'>{row.early}%</Table.Td>
										<Table.Td align='right'>{row.unhandled}%</Table.Td>
										<Table.Td align='right'>{row.competitor}%</Table.Td>
										<Table.Td align='right'>{row.mistargeted}%</Table.Td>
										<Table.Td align='right'>
											<Text size='sm' fw={600}>
												{row.conversion === null ? na : `${row.conversion}%`}
											</Text>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
				</section>
			)}

			{summary.competitors.length > 0 && (
				<section>
					<Text fw={600} size='sm' mb='md'>
						{t('business.competitors')}
					</Text>
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
						{summary.competitors.map((competitor) => (
							<Card key={competitor.name} withBorder p='md'>
								<Text size='sm' fw={500}>
									{competitor.name}
								</Text>
								<Text fw={700} size='lg'>
									{competitor.count}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('business.competitorShare', { share: competitor.share })}
								</Text>
							</Card>
						))}
					</SimpleGrid>
				</section>
			)}
		</Stack>
	);
};

export default BusinessView;
