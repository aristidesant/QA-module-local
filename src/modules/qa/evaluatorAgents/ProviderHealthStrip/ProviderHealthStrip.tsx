import {
	ActionIcon,
	Alert,
	Badge,
	Group,
	Loader,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconRefresh,
	IconServerBolt,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import { PROVIDER_HEALTH_STATUS_COLORS } from '~/modules/qa/constants/badgeColors';
import type {
	LlmProvider,
	LlmProviderHealthResult,
	LlmProviderHealthStatus,
} from '~/models/qa';
import { useHealthQuery } from '~/queries/qa/healthQueries';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './ProviderHealthStrip.module.css';

const PROVIDERS: LlmProvider[] = ['OPENAI', 'GEMINI', 'BEDROCK'];

function getProviderStatus(
	health: LlmProviderHealthResult | undefined
): LlmProviderHealthStatus {
	return health?.status ?? 'disabled';
}

export default function ProviderHealthStrip() {
	const { t } = useTranslation('qa.evaluatorAgents');
	const healthQuery = useHealthQuery();
	const providers = healthQuery.data?.ai?.providers;

	return (
		<SectionCard
			contentSpacing='sm'
			description={t('health.description')}
			headerActions={
				<Tooltip label={t('health.refresh')}>
					<ActionIcon
						aria-label={t('health.refresh')}
						className={classes.refreshButton}
						loading={healthQuery.isFetching}
						onClick={() => void healthQuery.refetch()}
						radius='md'
						variant='light'
					>
						<IconRefresh size={16} />
					</ActionIcon>
				</Tooltip>
			}
			icon={IconServerBolt}
			title={t('health.title')}
		>
			{healthQuery.isLoading ? (
				<Group justify='center' py='sm'>
					<Loader size='sm' />
				</Group>
			) : null}

			{healthQuery.isError ? (
				<Alert
					color='red'
					icon={<IconAlertTriangle size={16} />}
					title={t('health.errorTitle')}
					variant='light'
				>
					{getErrorMessage(healthQuery.error)}
				</Alert>
			) : null}

			{!healthQuery.isLoading && !healthQuery.isError ? (
				<div className={classes.grid}>
					{PROVIDERS.map((provider) => {
						const health = providers?.[provider];
						const status = getProviderStatus(health);

						return (
							<Stack className={classes.providerCard} gap={4} key={provider}>
								<Group justify='space-between' wrap='nowrap'>
									<Text fw={700} size='sm'>
										{t(`providers.${provider.toLowerCase()}`)}
									</Text>
									<Badge
										color={PROVIDER_HEALTH_STATUS_COLORS[status]}
										variant='light'
									>
										{t(`health.status.${status}`)}
									</Badge>
								</Group>
								<Text c='dimmed' size='xs'>
									{health?.configured
										? t('health.configured')
										: t('health.notConfigured')}
								</Text>
								{health?.latencyMs != null ? (
									<Text c='dimmed' size='xs'>
										{t('health.latency', { latency: health.latencyMs })}
									</Text>
								) : null}
								{health?.error ? (
									<Text c='red' lineClamp={2} size='xs'>
										{health.error}
									</Text>
								) : null}
							</Stack>
						);
					})}
				</div>
			) : null}
		</SectionCard>
	);
}
