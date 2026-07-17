import { Badge, NumberInput, Select, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import { normalizeCampaignType } from './GeneralSection.helpers';
import styles from './GeneralSection.module.css';

const DELAY_OPTIONS = [
	{ value: '0', labelKey: 'general.delayOptions.noDelay' },
	{ value: '900', labelKey: 'general.delayOptions.fifteenMinutes' },
	{ value: '1800', labelKey: 'general.delayOptions.thirtyMinutes' },
	{ value: '3600', labelKey: 'general.delayOptions.oneHour' },
	{ value: '7200', labelKey: 'general.delayOptions.twoHours' },
	{ value: '14400', labelKey: 'general.delayOptions.fourHours' },
	{ value: '28800', labelKey: 'general.delayOptions.eightHours' },
	{ value: '86400', labelKey: 'general.delayOptions.oneDay' },
];

const DELAY_VALUES = DELAY_OPTIONS.map((option) => Number(option.value));

function snapDelay(seconds?: number): string {
	const normalizedSeconds = seconds ?? 0;
	let closest = DELAY_VALUES[0];

	for (const candidate of DELAY_VALUES) {
		if (
			Math.abs(normalizedSeconds - candidate) <
			Math.abs(normalizedSeconds - closest)
		) {
			closest = candidate;
		}
	}

	return String(closest);
}

const ExecutionDefaultsSection = () => {
	const { t } = useTranslation(['campaign.form.general']);
	const form = useCampaignFormContext();
	const isOutbound = normalizeCampaignType(form.values.type) !== 'INBOUND';
	const delayValue = snapDelay(form.values.defaultWaveExecutionDelaySeconds);

	return (
		<section className={styles.subsection}>
			<div className={styles.subsectionHeader}>
				<h6 className={styles.subsectionTitle}>
					{t('general.execution.title')}
				</h6>
			</div>

			<div className={styles.executionStack}>
				<div className={styles.executionSection}>
					<div className={styles.executionHeader}>
						<Badge variant='light' color='green' size='sm'>
							{isOutbound
								? t('general.execution.outboundBadge')
								: t('general.execution.inboundBadge')}
						</Badge>
						<Text className={styles.executionTitle}>
							{isOutbound
								? t('general.execution.waveTitle')
								: t('general.execution.inboundTitle')}
						</Text>
					</div>

					{isOutbound ? (
						<div className={styles.waveGrid}>
							<NumberInput
								label={t('general.defaultWaves')}
								min={1}
								clampBehavior='strict'
								allowDecimal={false}
								allowNegative={false}
								step={1}
								placeholder={t('general.enterNumberOfWaves')}
								withAsterisk
								size='sm'
								{...form.getInputProps('defaultMaxWaves')}
							/>

							<Select
								label={t('general.defaultWaveDelay')}
								data={DELAY_OPTIONS.map((option) => ({
									value: option.value,
									label: t(option.labelKey),
								}))}
								value={delayValue}
								onChange={(value) =>
									form.setFieldValue(
										'defaultWaveExecutionDelaySeconds',
										value ? Number(value) : 0
									)
								}
								allowDeselect={false}
								size='sm'
							/>
						</div>
					) : (
						<Text size='sm' c='dimmed'>
							{t('general.execution.inboundBody')}
						</Text>
					)}
				</div>
			</div>
		</section>
	);
};

export default ExecutionDefaultsSection;
