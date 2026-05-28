import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Alert,
	Box,
	Button,
	Card,
	Flex,
	Grid,
	Select,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconAddressBook,
	IconAlertCircle,
	IconClock,
	IconRefresh,
	IconPhoneCall,
	IconTargetArrow,
	IconSpeakerphone,
} from '@tabler/icons-react';
import { useContactListMetrics } from '~/modules/queries/metricsQueries';
import styles from './ContactListMetrics.module.css';
import SectionCard from '~/components/SectionCard';
import SummaryPanel from './SummaryPanel';
import StatBoard from './StatBoard';
import type { SpecificMetric } from '~/models/LiveMetrics';
import { modals } from '@mantine/modals';
import SIPTrunk from '~/components/SIPTrunk';

type ContactListMetricsProps = {
	contactGroupId?: number | string;
};

const formatNumber = (value?: number) => {
	if (!Number.isFinite(value ?? Number.NaN)) {
		return '0';
	}
	return value!.toLocaleString();
};

const parsePercentageValue = (value?: string | number) => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}
	if (!value) {
		return 0;
	}
	const numericValue = Number.parseFloat(value.replace('%', ''));
	return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatTimeToMinutes = (seconds: number) => {
	if (!Number.isFinite(seconds)) return '0.0 mins';
	const minutes = seconds / 60;
	return `${minutes.toFixed(1)} mins`;
};

const MetricsSkeleton = () => (
	<Stack gap='md' className={styles.wrapper}>
		<Card
			withBorder
			padding='md'
			className={`${styles.overviewCard} ${styles.skeletonCard}`}
		>
			<Stack gap='md'>
				<Flex
					align='center'
					justify='space-between'
					className={styles.overviewHeader}
					wrap='wrap'
					gap='lg'
				>
					<Stack gap='xs'>
						<Skeleton height={10} width='120px' radius='xl' />
						<Skeleton height={22} width='240px' radius='sm' />
						<Skeleton height={12} width='180px' radius='xl' />
					</Stack>
					<Skeleton height={36} width={140} radius='xl' />
				</Flex>
				<SimpleGrid
					cols={{ base: 1, sm: 3 }}
					spacing='sm'
					className={styles.overviewHighlights}
				>
					{Array.from({ length: 3 }).map((_, index) => (
						<Flex
							key={`overview-skeleton-${index.toString()}`}
							align='center'
							gap='md'
						>
							<Skeleton height={64} width={64} radius='50%' />
							<Stack gap='xs' flex={1}>
								<Skeleton height={10} width='60%' radius='xl' />
								<Skeleton height={18} width='40%' radius='sm' />
								<Skeleton height={10} width='50%' radius='xl' />
							</Stack>
						</Flex>
					))}
				</SimpleGrid>
			</Stack>
		</Card>
		<Card
			withBorder
			padding='md'
			className={`${styles.statBoard} ${styles.skeletonCard}`}
		>
			<Stack gap='md'>
				<Flex align='center' justify='space-between'>
					<Box>
						<Skeleton height={12} width='160px' radius='xl' mb={6} />
						<Skeleton height={10} width='220px' radius='xl' />
					</Box>
					<Skeleton height={12} width={100} radius='xl' />
				</Flex>
				<SimpleGrid
					cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
					spacing={{ base: 'sm', sm: 'md' }}
					className={styles.statGrid}
				>
					{Array.from({ length: 5 }).map((_, index) => (
						<Card
							key={`metric-skeleton-${index.toString()}`}
							withBorder
							padding='sm'
							className={styles.skeletonCard}
						>
							<Stack gap='xs'>
								<Skeleton height={12} width='45%' radius='xl' />
								<Skeleton height={22} width='60%' radius='sm' />
								<Skeleton height={10} width='70%' radius='xl' />
							</Stack>
						</Card>
					))}
				</SimpleGrid>
			</Stack>
		</Card>
		<Grid gap='md' className={styles.detailGrid}>
			<Grid.Col span={{ base: 12, lg: 8 }}>
				<SimpleGrid
					cols={{ base: 1, sm: 2 }}
					spacing={{ base: 'sm', sm: 'md' }}
				>
					{Array.from({ length: 2 }).map((_, index) => (
						<Card
							key={`chart-skeleton-${index.toString()}`}
							withBorder
							padding='md'
							className={styles.skeletonCard}
						>
							<Stack gap='md'>
								<Box>
									<Skeleton height={14} width='50%' radius='xl' mb='xs' />
									<Skeleton height={10} width='60%' radius='xl' />
								</Box>
								<Skeleton height={200} radius='md' />
							</Stack>
						</Card>
					))}
				</SimpleGrid>
			</Grid.Col>
			<Grid.Col span={{ base: 12, lg: 4 }}>
				<Card withBorder padding='md' className={styles.skeletonCard}>
					<Stack gap='md'>
						<Box>
							<Skeleton height={14} width='40%' radius='xl' mb='xs' />
							<Skeleton height={10} width='60%' radius='xl' />
						</Box>
						<Stack gap='sm'>
							{Array.from({ length: 4 }).map((_, index) => (
								<Box key={`specific-skeleton-${index.toString()}`}>
									<Flex justify='space-between' align='center' mb='xs'>
										<Skeleton height={12} width='50%' radius='xl' />
										<Skeleton height={16} width='20%' radius='sm' />
									</Flex>
									<Skeleton height={8} radius='xl' />
								</Box>
							))}
						</Stack>
					</Stack>
				</Card>
			</Grid.Col>
		</Grid>
	</Stack>
);

const ContactListMetrics = ({ contactGroupId }: ContactListMetricsProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const [timeRange, setTimeRange] = useState<string>('since_creation');

	const TIME_RANGE_OPTIONS = useMemo(
		() => [
			{ value: '5m', label: t('metrics.timeRanges.5m') },
			{ value: '15m', label: t('metrics.timeRanges.15m') },
			{ value: '1h', label: t('metrics.timeRanges.1h') },
			{ value: 'today', label: t('metrics.timeRanges.today') },
			{
				value: 'since_creation',
				label: t('metrics.timeRanges.since_creation'),
			},
		],
		[t]
	);

	const contactGroupNumeric = useMemo(() => {
		if (contactGroupId === undefined || contactGroupId === null) {
			return 0;
		}
		const parsed = Number(contactGroupId);
		return Number.isFinite(parsed) ? parsed : 0;
	}, [contactGroupId]);

	const { data, isLoading, isError, isRefetching, refetch } =
		useContactListMetrics(contactGroupNumeric, timeRange);

	const general = data?.kpis.general;
	const specifics = (data?.kpis.specifics ?? []) as SpecificMetric[];

	const ahtMetric = specifics.find((s) => s.key === 'averageHandleTimeSeconds');

	const contactRateValue = parsePercentageValue(general?.contactRate);
	const effectivenessRateValue = parsePercentageValue(
		general?.effectivenessRate
	);
	const noContactRateValue = parsePercentageValue(general?.noContactRate);

	const statCards = useMemo(() => {
		if (!general) {
			return [];
		}

		return [
			{
				key: 'totalRecords',
				title: t('metrics.stats.totalRecords'),
				value: formatNumber(general.totalRecords),
				subtitle: t('metrics.stats.totalRecordsDesc'),
				icon: <IconAddressBook size={20} />,
			},
			{
				key: 'contactsAttempted',
				title: t('metrics.stats.contacted'),
				value: formatNumber(general.contacts),
				subtitle: t('metrics.stats.contactedDesc'),
				icon: <IconPhoneCall size={20} />,
			},
			...(ahtMetric
				? [
						{
							key: 'aht',
							title: t('metrics.stats.aht'),
							value: formatTimeToMinutes(ahtMetric.value),
							subtitle: t('metrics.stats.ahtDesc'),
							icon: <IconClock size={20} />,
						},
					]
				: []),
		];
	}, [general, ahtMetric, t]);

	const overviewHighlights = useMemo(
		() => [
			{
				key: 'contact-rate',
				label: t('metrics.stats.contactRate'),
				description: t('metrics.stats.contactRateDesc'),
				value: contactRateValue,
				color: 'green.5',
			},
			{
				key: 'effectiveness-rate',
				label: t('metrics.stats.effectivenessRate'),
				description: t('metrics.stats.effectivenessRateDesc'),
				value: effectivenessRateValue,
				color: 'blue.5',
			},
			{
				key: 'no-contact-rate',
				label: t('metrics.stats.noContactRate'),
				description: t('metrics.stats.noContactRateDesc'),
				value: noContactRateValue,
				color: 'orange.5',
			},
		],
		[contactRateValue, effectivenessRateValue, noContactRateValue, t]
	);

	const quickStats = useMemo(() => {
		if (!general) {
			return [];
		}

		return [
			{
				key: 'effectiveContacts',
				label: t('metrics.stats.effective'),
				value: general.effectiveContacts,
				description: t('metrics.stats.effectiveDesc'),
				color: 'var(--mantine-color-green-6)',
			},
			{
				key: 'ineffectiveContacts',
				label: t('metrics.stats.noEffective'),
				value: general.noEffectiveContacts,
				description: t('metrics.stats.noEffectiveDesc'),
				color: 'var(--mantine-color-yellow-6)',
			},
			{
				key: 'noContact',
				label: t('metrics.stats.noContact'),
				value: general.noContact,
				description: t('metrics.stats.noContactDesc'),
				color: 'var(--mantine-color-orange-6)',
			},
			{
				key: 'dnc',
				label: t('metrics.stats.dnc'),
				value: general.dnc,
				description: t('metrics.stats.dncDesc'),
				color: 'var(--mantine-color-red-6)',
			},
		];
	}, [general, t]);

	if (contactGroupNumeric === 0) {
		return (
			<Alert
				variant='light'
				color='gray'
				icon={<IconAlertCircle size={18} />}
				title={t('metrics.alerts.noSelection')}
			>
				{t('metrics.alerts.noSelectionDesc')}
			</Alert>
		);
	}

	if (isLoading) {
		return <MetricsSkeleton />;
	}

	if (isError) {
		return (
			<Alert
				variant='light'
				color='red'
				icon={<IconAlertCircle size={18} />}
				title={t('metrics.alerts.unableToLoad')}
			>
				<Flex align='center' justify='space-between' gap='md'>
					<Text size='sm' c='dimmed'>
						{t('metrics.alerts.unableToLoadDesc')}
					</Text>
					<Button
						variant='light'
						color='red'
						onClick={() => {
							void refetch();
						}}
						leftSection={<IconTargetArrow size={16} />}
						loading={isRefetching}
					>
						{t('status.tryAgain')}
					</Button>
				</Flex>
			</Alert>
		);
	}

	if (!general) {
		return (
			<Alert
				variant='light'
				color='gray'
				icon={<IconAlertCircle size={18} />}
				title={t('metrics.alerts.notAvailable')}
			>
				<Text size='sm' c='dimmed'>
					{t('metrics.alerts.notAvailableDesc')}
				</Text>
			</Alert>
		);
	}

	return (
		<SectionCard
			title={t('metrics.title')}
			description={t('metrics.description')}
			headerActions={
				<Flex gap='sm' align='center'>
					<Select
						value={timeRange}
						onChange={(value) => setTimeRange(value || 'since_creation')}
						data={TIME_RANGE_OPTIONS}
						leftSection={<IconClock size={16} />}
						size='sm'
						w={180}
					/>
					<ActionIcon
						color='blue'
						onClick={() => {
							void refetch();
						}}
						loading={isRefetching}
						size='sm'
					>
						<IconRefresh size={16} />
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							modals.open({
								modalId: 'sip-trunk-info-modal',
								fullScreen: true,
								title: t('metrics.sipTrunkInfo'),
								children: <SIPTrunk />,
							});
						}}
					>
						<IconSpeakerphone size={16} />
					</ActionIcon>
				</Flex>
			}
		>
			<Stack gap='md' className={styles.wrapper}>
				<StatBoard statCards={statCards} />
				<SummaryPanel
					overviewHighlights={overviewHighlights}
					quickStats={quickStats}
				/>
				{/* <Grid gap='md' className={styles.detailGrid}> */}
				{/* <Grid.Col span={{ base: 12, lg: hasSpecifics ? 8 : 12 }}>
						<BreakdownSection breakdownCards={breakdownCards} />
					</Grid.Col>
					{hasSpecifics ? (
						<Grid.Col span={{ base: 12, lg: 4 }}>
							<SpecificsSection
								displayedSpecifics={displayedSpecifics}
								maxSpecificValue={maxSpecificValue}
							/>
						</Grid.Col>
					) : null}
				</Grid> */}
			</Stack>
		</SectionCard>
	);
};

export default ContactListMetrics;
