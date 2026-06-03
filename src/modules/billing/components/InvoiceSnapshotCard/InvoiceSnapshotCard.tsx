import { useState } from 'react';
import {
	Badge,
	Collapse,
	Divider,
	Group,
	Stack,
	Table,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import type {
	ClientSnapshot,
	InvoiceSnapshot,
	InvoiceTotals,
	PocSnapshot,
} from '~/models/InvoiceModel';
import {
	EMPTY_VALUE,
	formatInvoiceDateTime,
	formatInvoicePeriod,
} from '~/modules/billing/utils';
import styles from './InvoiceSnapshotCard.module.css';

interface InfoFieldProps {
	label: string;
	value?: string | number | null;
}

function InfoField({ label, value }: InfoFieldProps) {
	const displayValue =
		value === null || value === undefined || value === '' ? EMPTY_VALUE : value;

	return (
		<div className={styles.infoBlock}>
			<Text className={styles.label}>{label}</Text>
			<Text className={styles.value}>{displayValue}</Text>
		</div>
	);
}

interface PartyPanelProps {
	title: string;
	party: ClientSnapshot;
}

function PartyPanel({ title, party }: PartyPanelProps) {
	const { t } = useTranslation('billing');

	return (
		<SectionCard title={title} padding='sm' contentSpacing='xs'>
			<Group className={styles.partyHeader} justify='space-between' gap='xs'>
				<Text className={styles.partyName}>{party.name || EMPTY_VALUE}</Text>
				{party.rnc && (
					<Badge size='sm' variant='light' color='gray'>
						{t('snapshot.fields.rnc')} {party.rnc}
					</Badge>
				)}
			</Group>
			<div className={styles.infoGrid}>
				<InfoField label={t('snapshot.fields.name')} value={party.name} />
				<InfoField label={t('snapshot.fields.rnc')} value={party.rnc} />
				<InfoField label={t('snapshot.fields.email')} value={party.email} />
				<InfoField label={t('snapshot.fields.phone')} value={party.phone} />
				<InfoField label={t('snapshot.fields.address')} value={party.address} />
				<InfoField label={t('snapshot.fields.website')} value={party.website} />
			</div>
		</SectionCard>
	);
}

interface PocPanelProps {
	title: string;
	poc: PocSnapshot;
}

function PocPanel({ title, poc }: PocPanelProps) {
	const { t } = useTranslation('billing');

	return (
		<SectionCard title={title} padding='sm' contentSpacing='xs'>
			<div className={styles.infoGrid}>
				<InfoField label={t('snapshot.fields.name')} value={poc.name} />
				<InfoField label={t('snapshot.fields.email')} value={poc.email} />
			</div>
		</SectionCard>
	);
}

interface TotalsPanelProps {
	totals: InvoiceTotals;
	hourlyRateFormatted: string;
	currency: string;
}

function TotalsPanel({
	totals,
	hourlyRateFormatted,
	currency,
}: TotalsPanelProps) {
	const { t } = useTranslation('billing');

	return (
		<SectionCard
			title={t('snapshot.totals')}
			padding='sm'
			contentSpacing='sm'
			className={styles.totalsPanel}
		>
			<div className={styles.totalHero}>
				<Text className={styles.label}>{t('snapshot.total')}</Text>
				<Text className={styles.totalAmount}>{totals.totalFormatted}</Text>
			</div>
			<div className={styles.totalsGrid}>
				<Text className={styles.label}>{t('snapshot.subtotal')}</Text>
				<Text className={styles.value} ta='right'>
					{totals.subtotalFormatted}
				</Text>
				<Text className={styles.label}>
					{t('snapshot.tax')} ({totals.taxRate}%)
				</Text>
				<Text className={styles.value} ta='right'>
					{totals.taxTotalFormatted}
				</Text>
				<Text className={styles.label}>{t('snapshot.columns.hourlyRate')}</Text>
				<Text className={styles.value} ta='right'>
					{hourlyRateFormatted || EMPTY_VALUE}
				</Text>
				<Text className={styles.label}>{t('detail.metadata.currency')}</Text>
				<Text className={styles.value} ta='right'>
					{currency || EMPTY_VALUE}
				</Text>
			</div>
		</SectionCard>
	);
}

export interface InvoiceSnapshotCardProps {
	snapshot: InvoiceSnapshot;
}

const InvoiceSnapshotCard: React.FC<InvoiceSnapshotCardProps> = ({
	snapshot,
}) => {
	const { t } = useTranslation('billing');
	const [executionOpen, setExecutionOpen] = useState(false);

	const {
		invoice,
		issuer,
		receiver,
		poc,
		summaryLines,
		executionDetails,
		totals,
	} = snapshot;

	return (
		<Stack gap='md'>
			<div className={styles.reviewGrid}>
				<SectionCard
					title={t('snapshot.invoiceBasics')}
					padding='sm'
					contentSpacing='sm'
				>
					<Group gap='xs'>
						<Badge size='sm' variant='light'>
							{invoice.currency}
						</Badge>
						<Badge size='sm' variant='outline' color='gray'>
							{t('detail.review.taxRate')}: {invoice.taxRate}%
						</Badge>
					</Group>
					<div className={styles.infoGrid}>
						<InfoField
							label={t('detail.metadata.invoiceNumber')}
							value={invoice.number}
						/>
						<InfoField
							label={t('detail.metadata.period')}
							value={formatInvoicePeriod(
								invoice.periodStart,
								invoice.periodEnd
							)}
						/>
						<InfoField
							label={t('detail.metadata.currency')}
							value={invoice.currency}
						/>
						<InfoField
							label={t('detail.review.hourlyRate')}
							value={invoice.hourlyRateFormatted}
						/>
					</div>
				</SectionCard>
				<TotalsPanel
					totals={totals}
					hourlyRateFormatted={invoice.hourlyRateFormatted}
					currency={invoice.currency}
				/>
			</div>

			<div className={styles.grid}>
				<PartyPanel title={t('snapshot.issuerInfo')} party={issuer} />
				<PartyPanel title={t('snapshot.receiverInfo')} party={receiver} />
			</div>

			<div className={styles.grid}>
				<PocPanel title={t('snapshot.pocIssuer')} poc={poc.issuer} />
				<PocPanel title={t('snapshot.pocReceiver')} poc={poc.receiver} />
			</div>

			<SectionCard
				title={t('snapshot.summaryLines')}
				padding='sm'
				contentSpacing='sm'
			>
				{summaryLines.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('snapshot.noSummaryLines')}
					</Text>
				) : (
					<Table.ScrollContainer minWidth={760}>
						<Table striped withTableBorder withColumnBorders={false}>
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
										<Table.Td>{line.campaignName || EMPTY_VALUE}</Table.Td>
										<Table.Td ta='right'>{line.activeAiAgents}</Table.Td>
										<Table.Td ta='right'>{line.uptimeFormatted}</Table.Td>
										<Table.Td ta='right'>{line.callsCount}</Table.Td>
										<Table.Td ta='right'>{line.hourlyRateFormatted}</Table.Td>
										<Table.Td ta='right'>{line.totalFormatted}</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>
				)}

				{executionDetails.length > 0 && (
					<>
						<Divider className={styles.divider} />
						<UnstyledButton
							onClick={() => setExecutionOpen((open) => !open)}
							className={styles.collapseButton}
							aria-expanded={executionOpen}
						>
							<Group justify='space-between' gap='xs'>
								<Group gap='xs'>
									<Text size='sm' fw={600}>
										{executionOpen
											? t('snapshot.hideExecutionDetails')
											: t('snapshot.showExecutionDetails')}
									</Text>
									<Badge size='sm' variant='light' color='gray'>
										{executionDetails.length}
									</Badge>
								</Group>
								{executionOpen ? (
									<IconChevronUp size={16} />
								) : (
									<IconChevronDown size={16} />
								)}
							</Group>
						</UnstyledButton>
						<Collapse expanded={executionOpen}>
							<Table.ScrollContainer minWidth={900}>
								<Table striped withTableBorder withColumnBorders={false}>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>{t('snapshot.columns.campaign')}</Table.Th>
											<Table.Th>{t('snapshot.columns.date')}</Table.Th>
											<Table.Th ta='right'>
												{t('snapshot.columns.agents')}
											</Table.Th>
											<Table.Th ta='right'>
												{t('snapshot.columns.uptime')}
											</Table.Th>
											<Table.Th ta='right'>
												{t('snapshot.columns.calls')}
											</Table.Th>
											<Table.Th>{t('snapshot.columns.start')}</Table.Th>
											<Table.Th>{t('snapshot.columns.end')}</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{executionDetails.map((detail) => (
											<Table.Tr
												key={`${detail.campaignId}-${detail.executionDate}-${detail.startTimestamp}`}
											>
												<Table.Td>
													{detail.campaignName || EMPTY_VALUE}
												</Table.Td>
												<Table.Td>{detail.executionDate}</Table.Td>
												<Table.Td ta='right'>{detail.activeAiAgents}</Table.Td>
												<Table.Td ta='right'>{detail.uptimeFormatted}</Table.Td>
												<Table.Td ta='right'>{detail.callsCount}</Table.Td>
												<Table.Td>
													{formatInvoiceDateTime(detail.startTimestamp)}
												</Table.Td>
												<Table.Td>
													{formatInvoiceDateTime(detail.endTimestamp)}
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</Table.ScrollContainer>
						</Collapse>
					</>
				)}
			</SectionCard>
		</Stack>
	);
};

export default InvoiceSnapshotCard;
