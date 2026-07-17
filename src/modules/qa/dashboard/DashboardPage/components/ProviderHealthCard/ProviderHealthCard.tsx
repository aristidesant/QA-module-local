import { Badge, Group, Paper, Skeleton, Text } from '@mantine/core';
import { IconHeartRateMonitor } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import {
	OVERALL_HEALTH_STATUS_COLORS,
	PROVIDER_HEALTH_STATUS_COLORS,
} from '~/modules/qa/constants/badgeColors';
import type { HealthResponse, LlmProvider } from '~/models/qa';
import classes from './ProviderHealthCard.module.css';

const PROVIDER_LABELS: Record<LlmProvider, string> = {
	OPENAI: 'OpenAI',
	GEMINI: 'Gemini',
	BEDROCK: 'Bedrock',
};

export interface ProviderHealthCardProps {
	health?: HealthResponse;
	loading: boolean;
	className?: string;
}

export default function ProviderHealthCard({
	health,
	loading,
	className,
}: ProviderHealthCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const ai = health?.ai;

	if (!loading && !ai) return null;

	const providers = Object.entries(ai?.providers ?? {}) as Array<
		[LlmProvider, NonNullable<NonNullable<typeof ai>['providers'][LlmProvider]>]
	>;

	return (
		<SectionCard
			className={className}
			headerActions={
				ai ? (
					<Badge
						color={OVERALL_HEALTH_STATUS_COLORS[ai.status]}
						variant='light'
					>
						{t(`health.overall.${ai.status}`)}
					</Badge>
				) : undefined
			}
			icon={IconHeartRateMonitor}
			title={t('health.title')}
		>
			{loading && !ai ? (
				<Group gap='xs'>
					<Skeleton height={40} width={160} />
					<Skeleton height={40} width={160} />
				</Group>
			) : (
				<Group gap='xs'>
					{providers.map(([provider, result]) => (
						<Paper
							className={classes.provider}
							key={provider}
							p='xs'
							radius='md'
							withBorder
						>
							<Group gap='xs' wrap='nowrap'>
								<Text fw={600} size='sm'>
									{PROVIDER_LABELS[provider]}
								</Text>
								<Badge
									color={PROVIDER_HEALTH_STATUS_COLORS[result.status]}
									size='sm'
									variant='light'
								>
									{result.configured
										? t(`health.provider.${result.status}`)
										: t('health.notConfigured')}
								</Badge>
								{result.latencyMs != null ? (
									<Text c='dimmed' size='xs'>
										{t('health.latency', { ms: result.latencyMs })}
									</Text>
								) : null}
							</Group>
						</Paper>
					))}
				</Group>
			)}
		</SectionCard>
	);
}
