import { useState } from 'react';
import {
	Stack,
	Text,
	Group,
	Table,
	Divider,
	UnstyledButton,
	Collapse,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import type { InvoiceSnapshot } from '~/models/InvoiceModel';
import styles from './InvoiceSnapshotCard.module.css';

interface InfoFieldProps {
	label: string;
	value?: string | null;
}

function InfoField({ label, value }: InfoFieldProps) {
	if (!value) return null;
	return (
		<div className={styles.infoBlock}>
			<Text className={styles.label}>{label}</Text>
			<Text className={styles.value}>{value}</Text>
		</div>
	);
}

interface InvoiceSnapshotCardProps {
	snapshot: InvoiceSnapshot;
}

const InvoiceSnapshotCard: React.FC<InvoiceSnapshotCardProps> = ({
	snapshot,
}) => {
	const { t } = useTranslation('billing');
	const [executionOpen, setExecutionOpen] = useState(false);

	const { issuer, receiver, poc, summaryLines, executionDetails, totals } =
		snapshot;

	return (
		<Stack gap='md'>
			<div className={styles.grid}>
				<SectionCard
					title={t('snapshot.issuerInfo')}
					padding='sm'
					contentSpacing='xs'
				>
					<InfoField label='Name' value={issuer.name} />
					<InfoField label='RNC' value={issuer.rnc} />
					<InfoField label='Email' value={issuer.email} />
					<InfoField label='Phone' value={issuer.phone} />
					<InfoField label='Address' value={issuer.address} />
					<InfoField label='Website' value={issuer.website} />
				</SectionCard>
				<SectionCard
					title={t('snapshot.receiverInfo')}
					padding='sm'
					contentSpacing='xs'
				>
					<InfoField label='Name' value={receiver.name} />
					<InfoField label='RNC' value={receiver.rnc} />
					<InfoField label='Email' value={receiver.email} />
					<InfoField label='Phone' value={receiver.phone} />
					<InfoField label='Address' value={receiver.address} />
					<InfoField label='Website' value={receiver.website} />
				</SectionCard>
			</div>

			<div className={styles.grid}>
				<SectionCard
					title={t('snapshot.pocIssuer')}
					padding='sm'
					contentSpacing='xs'
				>
					<InfoField label='Name' value={poc.issuer.name} />
					<InfoField label='Email' value={poc.issuer.email} />
				</SectionCard>
				<SectionCard
					title={t('snapshot.pocReceiver')}
					padding='sm'
					contentSpacing='xs'
				>
					<InfoField label='Name' value={poc.receiver.name} />
					<InfoField label='Email' value={poc.receiver.email} />
				</SectionCard>
			</div>

			<SectionCard title={t('snapshot.summaryLines')} padding='sm'>
				{summaryLines.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('snapshot.noSummaryLines')}
					</Text>
				) : (
					<Table striped withTableBorder>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{t('snapshot.columns.campaign')}</Table.Th>
								<Table.Th ta='right'>{t('snapshot.columns.agents')}</Table.Th>
								<Table.Th ta='right'>{t('snapshot.columns.uptime')}</Table.Th>
								<Table.Th ta='right'>{t('snapshot.columns.calls')}</Table.Th>
								<Table.Th ta='right'>
									{t('snapshot.columns.hourlyRate')}
								</Table.Th>
								<Table.Th ta='right'>{t('snapshot.columns.total')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{summaryLines.map((line) => (
								<Table.Tr key={line.campaignId}>
									<Table.Td>{line.campaignName}</Table.Td>
									<Table.Td ta='right'>{line.activeAiAgents}</Table.Td>
									<Table.Td ta='right'>{line.uptimeFormatted}</Table.Td>
									<Table.Td ta='right'>{line.callsCount}</Table.Td>
									<Table.Td ta='right'>{line.hourlyRateFormatted}</Table.Td>
									<Table.Td ta='right'>{line.totalFormatted}</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				)}
			</SectionCard>

			{executionDetails.length > 0 && (
				<SectionCard padding='sm'>
					<UnstyledButton
						onClick={() => setExecutionOpen((o) => !o)}
						className={styles.collapseButton}
					>
						<Group justify='space-between'>
							<Text size='sm' fw={500}>
								{t('snapshot.executionDetails')}
							</Text>
							{executionOpen ? (
								<IconChevronUp size={16} />
							) : (
								<IconChevronDown size={16} />
							)}
						</Group>
					</UnstyledButton>
					<Collapse expanded={executionOpen} mt='sm'>
						<Table striped withTableBorder>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('snapshot.columns.campaign')}</Table.Th>
									<Table.Th>{t('snapshot.columns.date')}</Table.Th>
									<Table.Th ta='right'>{t('snapshot.columns.agents')}</Table.Th>
									<Table.Th ta='right'>{t('snapshot.columns.uptime')}</Table.Th>
									<Table.Th ta='right'>{t('snapshot.columns.calls')}</Table.Th>
									<Table.Th>{t('snapshot.columns.start')}</Table.Th>
									<Table.Th>{t('snapshot.columns.end')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{executionDetails.map((detail, i) => (
									<Table.Tr key={i}>
										<Table.Td>{detail.campaignName}</Table.Td>
										<Table.Td>{detail.executionDate}</Table.Td>
										<Table.Td ta='right'>{detail.activeAiAgents}</Table.Td>
										<Table.Td ta='right'>{detail.uptimeFormatted}</Table.Td>
										<Table.Td ta='right'>{detail.callsCount}</Table.Td>
										<Table.Td>
											{new Date(detail.startTimestamp).toLocaleString()}
										</Table.Td>
										<Table.Td>
											{new Date(detail.endTimestamp).toLocaleString()}
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Collapse>
				</SectionCard>
			)}

			<SectionCard title={t('snapshot.totals')} padding='sm'>
				<div className={styles.totalsGrid}>
					<Text size='sm'>{t('snapshot.subtotal')}</Text>
					<Text size='sm' ta='right'>
						{totals.subtotalFormatted}
					</Text>
					<Text size='sm'>
						{t('snapshot.tax')} ({totals.taxRate}%)
					</Text>
					<Text size='sm' ta='right'>
						{totals.taxTotalFormatted}
					</Text>
					<Divider className={styles.divider} />
					<Text size='sm' fw={700} className={styles.totalRow}>
						{t('snapshot.total')}
					</Text>
					<Text size='sm' fw={700} ta='right' className={styles.totalRow}>
						{totals.totalFormatted}
					</Text>
				</div>
			</SectionCard>
		</Stack>
	);
};

export default InvoiceSnapshotCard;
