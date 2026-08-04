import { Grid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import {
	IconBrain,
	IconMoodSmile,
	IconTrendingUp,
	IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { SentimentKpis } from '../../utils/types';

interface KpiRowProps {
	kpis: SentimentKpis | null;
	loading: boolean;
}

interface KpiCardProps {
	icon: React.ReactNode;
	label: string;
	value: string;
	loading: boolean;
}

function KpiCard({ icon, label, value, loading }: KpiCardProps) {
	return (
		// inline-style-allow: kpi card styling with css variables
		<div
			style={{
				padding: 'var(--mantine-spacing-md)',
				borderRadius: 'var(--mantine-radius-md)',
				backgroundColor: 'var(--mantine-color-white)',
				border: '1px solid var(--mantine-color-gray-2)',
			}}
		>
			<Stack gap='xs'>
				{/* inline-style-allow: flex layout for icon and label */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 'var(--mantine-spacing-sm)',
					}}
				>
					<ThemeIcon variant='light' size='lg' radius='md'>
						{icon}
					</ThemeIcon>
					{loading ? (
						<Skeleton height={16} width={100} />
					) : (
						<Text size='sm' c='dimmed'>
							{label}
						</Text>
					)}
				</div>
				{loading ? (
					<Skeleton height={28} width={80} />
				) : (
					<Text fw={700} size='lg'>
						{value}
					</Text>
				)}
			</Stack>
		</div>
	);
}

export default function KpiRow({ kpis, loading }: KpiRowProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	if (loading && !kpis) {
		return (
			<Grid>
				{Array.from({ length: 4 }).map((_, i) => (
					<Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
						<KpiCard icon={<></>} label='' value='' loading={true} />
					</Grid.Col>
				))}
			</Grid>
		);
	}

	if (!kpis) return null;

	return (
		<Grid>
			<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
				<KpiCard
					icon={<IconMoodSmile size={20} />}
					label={t('kpis.avgSentiment')}
					value={`${(kpis.avgSentimentScore * 100).toFixed(0)}%`}
					loading={loading}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
				<KpiCard
					icon={<IconUsers size={20} />}
					label={t('kpis.totalEvaluations')}
					value={kpis.totalEvaluations.toString()}
					loading={loading}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
				<KpiCard
					icon={<IconTrendingUp size={20} />}
					label={t('kpis.recoveryRate')}
					value={`${kpis.recoveryRate.toFixed(0)}%`}
					loading={loading}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
				<KpiCard
					icon={<IconBrain size={20} />}
					label={t('kpis.avgEmpathy')}
					value={`${kpis.avgEmpathyScore.toFixed(0)}`}
					loading={loading}
				/>
			</Grid.Col>
		</Grid>
	);
}
