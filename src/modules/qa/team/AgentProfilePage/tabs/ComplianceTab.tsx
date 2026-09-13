import { Badge, Group, Progress, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import type { AgentProfile } from '../../types';
import { COMPLIANCE_AREA_META, COMPLIANCE_AREA_ORDER } from '../../constants';
import { getScoreColor } from '../../helpers';
import { ScoreRing } from '../../components/ScoreRing';
import { TrendDelta } from '../../components/TrendDelta';

interface ComplianceTabProps {
	profile: AgentProfile;
}

export function ComplianceTab({ profile }: ComplianceTabProps) {
	const { t } = useTranslation('qa.team');
	const { compliance } = profile;
	const totalViolations = compliance.areas.reduce((s, a) => s + a.violations, 0);
	const totalWarnings = compliance.areas.reduce((s, a) => s + a.warnings, 0);

	return (
		<Stack gap='md'>
			<SectionCard padding='lg'>
				<Group gap='xl' align='center'>
					<ScoreRing value={compliance.overall} />
					<Stack gap={4}>
						<Text fw={600}>{t('compliance.overall')}</Text>
						<Group gap='xs'>
							<Badge variant='light' color={totalViolations > 0 ? 'red' : 'gray'}>{totalViolations} {t('compliance.violations')}</Badge>
							<Badge variant='light' color={totalWarnings > 0 ? 'yellow' : 'gray'}>{totalWarnings} {t('compliance.warnings')}</Badge>
						</Group>
					</Stack>
				</Group>
			</SectionCard>

			<SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
				{COMPLIANCE_AREA_ORDER.map((key) => {
					const meta = COMPLIANCE_AREA_META[key];
					const area = compliance.areas.find((a) => a.key === key)!;
					return (
						<SectionCard
							key={key}
							title={meta.label}
							icon={IconShieldCheck}
							headerActions={<Badge color={getScoreColor(area.score)} variant='light' size='lg'>{area.score}%</Badge>}
						>
							<Progress value={area.score} color={meta.color} size='sm' mb='sm' />
							<Group gap='xs' mb='xs'>
								<Badge variant='light' color='red'>{area.violations} {t('compliance.violations')}</Badge>
								<Badge variant='light' color='yellow'>{area.warnings} {t('compliance.warnings')}</Badge>
							</Group>
							<TrendDelta delta={area.delta} trend={area.delta > 0 ? 'up' : area.delta < 0 ? 'down' : 'flat'} unit='%' />
							<Text size='xs' c='dimmed' mt='xs'>{meta.items.join(' · ')}</Text>
						</SectionCard>
					);
				})}
			</SimpleGrid>

			<SectionCard title={t('compliance.timeline')}>
				<BarChart
					h={240}
					data={compliance.timeline}
					dataKey='label'
					type='stacked'
					series={[
						{ name: 'violations', color: 'red.6' },
						{ name: 'warnings', color: 'yellow.6' },
					]}
					withLegend
				/>
			</SectionCard>

			<SectionCard title={t('compliance.flagged')}>
				{compliance.flaggedItems.length === 0 ? (
					<EmptyState message={t('compliance.noFlagged')} />
				) : (
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{t('compliance.columns.item')}</Table.Th>
								<Table.Th>{t('compliance.columns.area')}</Table.Th>
								<Table.Th>{t('compliance.columns.count')}</Table.Th>
								<Table.Th>{t('compliance.columns.lastSeen')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{compliance.flaggedItems.map((item) => (
								<Table.Tr key={item.item}>
									<Table.Td>{item.item}</Table.Td>
									<Table.Td><Badge color={COMPLIANCE_AREA_META[item.area].color} size='sm'>{COMPLIANCE_AREA_META[item.area].label}</Badge></Table.Td>
									<Table.Td>{item.count}</Table.Td>
									<Table.Td>{item.lastSeen}</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				)}
			</SectionCard>
		</Stack>
	);
}
