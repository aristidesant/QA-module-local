import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberInput, Stack, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { BUSINESS_SIGNAL_KEYS, DEFAULT_SETTINGS } from '../../constants';
import { validateBands } from '../../helpers';
import { useSettingsDraft } from '../../useSettingsDraft';
import { ScoreBandsEditor } from '../../components/ScoreBandsEditor';
import { SettingsActions } from '../../components/SettingsActions';
import type { BusinessSignalKey, BusinessThresholds } from '../../types';

interface SignalRow {
	key: BusinessSignalKey;
}

export const BusinessTab: React.FC = () => {
	const { t } = useTranslation('qa.settings');
	const stored = useSettingsStore(selectThresholds).business;
	const saveThresholds = useSettingsStore((s) => s.saveThresholds);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<BusinessThresholds>(stored);

	const rows: SignalRow[] = BUSINESS_SIGNAL_KEYS.map((key) => ({ key }));
	const columns: BaseTableColumnDef<SignalRow>[] = [
		{
			id: 'signal',
			header: t('business.columns.signal'),
			cell: ({ row }) => (
				<Text size='sm' fw={500}>
					{t(`business.signals.${row.original.key}`)}
				</Text>
			),
		},
		{
			id: 'alertShare',
			header: t('business.columns.alertShare'),
			cell: ({ row }) => (
				<NumberInput
					size='xs'
					w={110}
					aria-label={t(`business.signals.${row.original.key}`)}
					value={draft.signalAlertShare[row.original.key]}
					onChange={(v) =>
						setDraft({
							...draft,
							signalAlertShare: {
								...draft.signalAlertShare,
								[row.original.key]:
									typeof v === 'number'
										? v
										: draft.signalAlertShare[row.original.key],
							},
						})
					}
					min={0}
					max={100}
					rightSection={<Text size='xs'>%</Text>}
				/>
			),
		},
	];

	return (
		<Stack gap='lg'>
			<ScoreBandsEditor
				title={t('business.bandsTitle')}
				description={t('business.bandsDescription')}
				value={draft.bands}
				onChange={(bands) => setDraft({ ...draft, bands })}
			/>
			<SectionCard
				title={t('business.signalsTitle')}
				description={t('business.signalsDescription')}
			>
				<BaseTable<SignalRow>
					columns={columns}
					data={rows}
					getRowId={(row) => row.key}
					density='compact'
				/>
			</SectionCard>
			<SettingsActions
				dirty={dirty}
				invalid={validateBands(draft.bands) !== null}
				onSave={() => {
					saveThresholds('business', draft);
					notifySuccess(t('saved'));
				}}
				onDiscard={discard}
				onReset={() => fillWith(DEFAULT_SETTINGS.thresholds.business)}
			/>
		</Stack>
	);
};

export default BusinessTab;
