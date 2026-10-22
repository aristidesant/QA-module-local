import { Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import {
	BURNOUT_FAMILIES,
	VOICE_SIGNAL_BY_KEY,
} from '~/modules/qa/burnout/constants';
import type {
	BurnoutSignalResult,
	BurnoutSignalStatus,
	VoiceSignalKey,
} from '~/modules/qa/burnout/types';
import styles from './BurnoutSignals.module.css';

const STATUS_COLOR: Record<BurnoutSignalStatus, string> = {
	ACTIVE: 'red',
	NEAR: 'yellow',
	OK: 'gray',
	NO_DATA: 'gray',
};

const ALERT = 'var(--mantine-color-red-text)';
const COMPACT_ROWS = 6;

interface BurnoutSignalsProps {
	signals: BurnoutSignalResult[];
	/** Only the signals that are active or near, without trend lines. */
	compact?: boolean;
	/** Text when no signal is active or near, in compact mode. */
	emptyLabel?: string;
	/** `call`: one call against the agent's usual level, so a signal is "off usual" rather than "active". */
	scope?: 'agent' | 'call';
}

/** Why the agent is at their burnout level: every voice signal now, against the agent's own usual level. */
export function BurnoutSignals({
	signals,
	compact = false,
	emptyLabel,
	scope = 'agent',
}: BurnoutSignalsProps) {
	const { t } = useTranslation('qa.burnout');

	const format = (
		signal: BurnoutSignalResult,
		value: number | null,
		extraDecimals = 0
	) => {
		if (value === null) return '—';
		if (signal.family === 'context') return t('ui.days', { count: value });
		const def = VOICE_SIGNAL_BY_KEY[signal.key as VoiceSignalKey];
		return `${value.toFixed(def.decimals + extraDecimals)} ${def.unit}`;
	};

	const renderRow = (signal: BurnoutSignalResult) => {
		const active = signal.status === 'ACTIVE';
		// The change as it happened, up or down, whatever direction is the worse one.
		const change =
			signal.value !== null && signal.baseline
				? ((signal.value - signal.baseline) / signal.baseline) * 100
				: null;
		return (
			<Group
				key={signal.key}
				justify='space-between'
				align='center'
				wrap='nowrap'
				gap='sm'
				className={styles.row}
				data-status={signal.status}
			>
				<Stack gap={0} flex={1} miw={0}>
					<Text size='sm' fw={500}>
						{t(`signals.${signal.key}.label`)}
					</Text>
					<Text size='xs' c='dimmed'>
						{signal.streak
							? t(`ui.streakRule.${signal.key}`, {
									limit: signal.streak.dayLimit,
								})
							: signal.baseline === null
								? t('ui.noUsual')
								: t('ui.usual', { value: format(signal, signal.baseline, 1) })}
					</Text>
				</Stack>
				{!compact && (
					<Sparkline
						className={styles.sparkline}
						w={90}
						h={28}
						data={signal.trend}
						curveType='monotone'
						color={active ? 'red.6' : 'gray.6'}
						fillOpacity={0}
						connectNulls
					/>
				)}
				<Stack gap={0} align='flex-end'>
					<Text size='xs' c='dimmed'>
						{t('ui.now')}
					</Text>
					<Text size='sm' fw={700} c={active ? ALERT : undefined}>
						{format(signal, signal.value)}
					</Text>
				</Stack>
				<Tooltip
					label={signal.streak ? t('ui.streakHint') : t('ui.changeHint')}
					withArrow
				>
					<Text size='sm' w={56} ta='right' c={active ? ALERT : 'dimmed'}>
						{signal.streak
							? t('ui.ofDays', { count: signal.streak.minDays })
							: change === null
								? '—'
								: `${change > 0 ? '↑' : change < 0 ? '↓' : ''} ${Math.abs(Math.round(change))}%`.trim()}
					</Text>
				</Tooltip>
				<Badge size='xs' variant='light' color={STATUS_COLOR[signal.status]}>
					{scope === 'call'
						? t(`ui.callStatus.${signal.status}`)
						: t(`status.${signal.status}`)}
				</Badge>
			</Group>
		);
	};

	if (compact) {
		const relevant = signals
			.filter((s) => s.status === 'ACTIVE' || s.status === 'NEAR')
			.sort(
				(a, b) =>
					Number(b.status === 'ACTIVE') - Number(a.status === 'ACTIVE') ||
					(b.deviationPct ?? 0) - (a.deviationPct ?? 0)
			)
			.slice(0, COMPACT_ROWS);
		return relevant.length === 0 ? (
			<Text size='sm' c='dimmed'>
				{emptyLabel ?? t('ui.none')}
			</Text>
		) : (
			<Stack gap='xs'>{relevant.map(renderRow)}</Stack>
		);
	}

	return (
		<Stack gap='md'>
			{BURNOUT_FAMILIES.map((family) => {
				const inFamily = signals.filter((s) => s.family === family);
				if (inFamily.length === 0) return null;
				const activeCount = inFamily.filter(
					(s) => s.status === 'ACTIVE'
				).length;
				return (
					<Paper key={family} withBorder radius='md' p='md'>
						<Stack gap='sm'>
							<Group justify='space-between' wrap='nowrap'>
								<Stack gap={0}>
									<Text fw={600}>{t(`families.${family}`)}</Text>
									<Text size='xs' c='dimmed'>
										{t(`familyHints.${family}`)}
									</Text>
								</Stack>
								<Badge
									size='xs'
									variant={activeCount > 0 ? 'light' : 'outline'}
									color={activeCount > 0 ? 'red' : 'gray'}
								>
									{t('ui.activeOf', {
										active: activeCount,
										total: inFamily.length,
									})}
								</Badge>
							</Group>
							<Stack gap='xs'>{inFamily.map(renderRow)}</Stack>
						</Stack>
					</Paper>
				);
			})}
		</Stack>
	);
}
