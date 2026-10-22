import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, NumberInput, Stack, Switch, Table, Text } from '@mantine/core';
import { VOICE_FAMILIES, VOICE_SIGNALS } from '~/modules/qa/burnout/constants';
import type {
	BurnoutSignalConfig,
	BurnoutThresholds,
	VoiceSignalKey,
} from '~/modules/qa/burnout/types';

interface BurnoutSignalsTableProps {
	value: BurnoutThresholds['signals'];
	onChange: (value: BurnoutThresholds['signals']) => void;
}

const toNumber = (value: string | number, fallback: number) =>
	typeof value === 'number' ? value : Number(value) || fallback;

/** Every voice signal grouped by family: switch, weight, absolute limit and allowed drift from the agent's own baseline. */
export const BurnoutSignalsTable: React.FC<BurnoutSignalsTableProps> = ({
	value,
	onChange,
}) => {
	const { t } = useTranslation(['qa.settings', 'qa.burnout']);

	const update = (key: VoiceSignalKey, patch: Partial<BurnoutSignalConfig>) =>
		onChange({ ...value, [key]: { ...value[key], ...patch } });

	return (
		<Stack gap='xl'>
			{VOICE_FAMILIES.map((family) => {
				const signals = VOICE_SIGNALS.filter((s) => s.family === family);
				const totalWeight = signals
					.filter((s) => value[s.key].enabled)
					.reduce((sum, s) => sum + value[s.key].weight, 0);
				return (
					<Stack key={family} gap='xs'>
						<Stack gap={0}>
							<Text fw={600}>
								{t(`families.${family}`, { ns: 'qa.burnout' })}
							</Text>
							<Text size='xs' c='dimmed'>
								{t(`familyHints.${family}`, { ns: 'qa.burnout' })} ·{' '}
								{t('burnout.familyWeight', { value: totalWeight })}
							</Text>
						</Stack>
						<Table verticalSpacing='xs' withRowBorders>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('burnout.columns.signal')}</Table.Th>
									<Table.Th w={100}>{t('burnout.columns.weight')}</Table.Th>
									<Table.Th w={150}>{t('burnout.columns.limit')}</Table.Th>
									<Table.Th w={130}>{t('burnout.columns.deviation')}</Table.Th>
									<Table.Th w={110}>{t('burnout.columns.confidence')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{signals.map((signal) => {
									const config = value[signal.key];
									return (
										<Table.Tr key={signal.key}>
											<Table.Td>
												<Switch
													checked={config.enabled}
													onChange={(e) =>
														update(signal.key, {
															enabled: e.currentTarget.checked,
														})
													}
													label={t(`signals.${signal.key}.label`, {
														ns: 'qa.burnout',
													})}
													description={t(`signals.${signal.key}.description`, {
														ns: 'qa.burnout',
													})}
												/>
											</Table.Td>
											<Table.Td>
												<NumberInput
													size='xs'
													value={config.weight}
													onChange={(v) =>
														update(signal.key, {
															weight: toNumber(v, config.weight),
														})
													}
													min={1}
													max={5}
													disabled={!config.enabled}
													aria-label={t('burnout.columns.weight')}
												/>
											</Table.Td>
											<Table.Td>
												<NumberInput
													size='xs'
													value={config.threshold}
													onChange={(v) =>
														update(signal.key, {
															threshold: toNumber(v, config.threshold),
														})
													}
													min={0}
													decimalScale={signal.decimals}
													step={signal.decimals ? 0.1 : 1}
													leftSection={
														<Text size='xs' c='dimmed'>
															{signal.worse === 'lower' ? '<' : '>'}
														</Text>
													}
													rightSection={
														<Text size='xs' c='dimmed'>
															{signal.unit}
														</Text>
													}
													rightSectionWidth={56}
													disabled={!config.enabled}
													aria-label={t('burnout.columns.limit')}
												/>
											</Table.Td>
											<Table.Td>
												<NumberInput
													size='xs'
													value={config.deviationPct}
													onChange={(v) =>
														update(signal.key, {
															deviationPct: toNumber(v, config.deviationPct),
														})
													}
													min={5}
													max={300}
													step={5}
													suffix=' %'
													disabled={!config.enabled}
													aria-label={t('burnout.columns.deviation')}
												/>
											</Table.Td>
											<Table.Td>
												<Badge
													size='xs'
													variant={
														signal.confidence === 'high' ? 'light' : 'outline'
													}
													color='gray'
												>
													{t(`burnout.confidence.${signal.confidence}`)}
												</Badge>
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					</Stack>
				);
			})}
		</Stack>
	);
};

export default BurnoutSignalsTable;
