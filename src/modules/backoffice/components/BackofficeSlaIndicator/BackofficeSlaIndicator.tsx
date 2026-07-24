import { Badge, Group, Progress, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { BackofficeCase } from '~/models/backoffice/BackofficeCaseModel';

type BackofficeSlaNamespace = 'backoffice-cases' | 'backoffice-supervisor';

interface BackofficeSlaIndicatorProps {
	caseData: BackofficeCase;
	namespace: BackofficeSlaNamespace;
	compact?: boolean;
}

const SLA_COLORS = {
	ON_TRACK: 'green',
	AT_RISK: 'yellow',
	CRITICAL: 'orange',
	BREACHED: 'red',
} as const;

const hasSla = (caseData: BackofficeCase) =>
	caseData.slaStatus !== undefined ||
	caseData.slaTargetMinutes !== undefined ||
	caseData.elapsedMinutes !== undefined ||
	caseData.slaPercentage !== undefined ||
	caseData.isBreached !== undefined;

const formatMinutes = (
	value: number | undefined,
	locale: string,
	fallback: string
) =>
	value === undefined
		? fallback
		: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

const formatPercentage = (
	value: number | undefined,
	locale: string,
	fallback: string
) =>
	value === undefined
		? fallback
		: `${new Intl.NumberFormat(locale, {
				maximumFractionDigits: 2,
			}).format(value)}%`;

const BackofficeSlaIndicator = ({
	caseData,
	namespace,
	compact = false,
}: BackofficeSlaIndicatorProps) => {
	const { t, i18n } = useTranslation(namespace);

	if (!hasSla(caseData)) return null;

	const status = caseData.slaStatus;
	const color = caseData.slaColor ?? (status ? SLA_COLORS[status] : 'gray');
	const label =
		caseData.slaLabel ??
		(status ? t(`sla.statuses.${status}`) : t('common.notAvailable'));
	const percentage = caseData.slaPercentage;
	const notAvailable = t('common.notAvailable');

	if (compact) {
		return (
			<Stack gap={2} align='flex-start'>
				<Badge color={color} variant='light' size='sm'>
					{label}
				</Badge>
				{percentage !== undefined && (
					<Text size='xs' c='dimmed'>
						{formatPercentage(percentage, i18n.language, notAvailable)}
					</Text>
				)}
			</Stack>
		);
	}

	return (
		<Stack gap='xs'>
			<Group justify='space-between' align='center' gap='xs'>
				<Text size='sm' fw={600}>
					{label}
				</Text>
				<Badge color={color} variant='light' size='sm'>
					{formatPercentage(percentage, i18n.language, notAvailable)}
				</Badge>
			</Group>
			<Progress
				value={Math.min(100, Math.max(0, percentage ?? 0))}
				color={color}
				size='sm'
				aria-label={t('sla.progressLabel')}
			/>
			<Group gap='md'>
				<Text size='xs' c='dimmed'>
					{t('sla.target', {
						value: formatMinutes(
							caseData.slaTargetMinutes,
							i18n.language,
							notAvailable
						),
					})}
				</Text>
				<Text size='xs' c='dimmed'>
					{t('sla.elapsed', {
						value: formatMinutes(
							caseData.elapsedMinutes,
							i18n.language,
							notAvailable
						),
					})}
				</Text>
			</Group>
			{caseData.isBreached !== undefined && (
				<Text size='xs' c={caseData.isBreached ? 'red' : 'dimmed'}>
					{t(caseData.isBreached ? 'sla.breached' : 'sla.withinTarget')}
				</Text>
			)}
		</Stack>
	);
};

export default BackofficeSlaIndicator;
