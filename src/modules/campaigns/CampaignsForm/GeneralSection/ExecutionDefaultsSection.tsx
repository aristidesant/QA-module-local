import { Badge, NumberInput, Select, Text } from '@mantine/core';
import { IconLanguage, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
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
	const { t } = useTranslation([
		'campaign.form.general',
		'campaign.form.agents',
	]);
	const form = useCampaignFormContext();
	const isOutbound = normalizeCampaignType(form.values.type) !== 'INBOUND';
	const currentLanguage =
		form.values.agentConfig?.conversationConfig?.agent?.language || '';
	const languageOptions = [
		{
			value: 'en',
			label: t('form.agent.basic.languages.en', {
				ns: 'campaign.form.agents',
			}),
		},
		{
			value: 'es',
			label: t('form.agent.basic.languages.es', {
				ns: 'campaign.form.agents',
			}),
		},
	];

	const handleLanguageChange = (value: string | null) => {
		if (!value) {
			return;
		}

		form.setFieldValue('agentConfig.conversationConfig.agent.language', value);
	};

	const delayValue = snapDelay(form.values.defaultWaveExecutionDelaySeconds);

	return (
		<SectionCard
			title={t('general.execution.title', {
				ns: 'campaign.form.general',
			})}
			description={
				isOutbound
					? t('general.execution.description', {
							ns: 'campaign.form.general',
						})
					: t('general.execution.descriptionInbound', {
							ns: 'campaign.form.general',
						})
			}
			icon={IconSettings}
			contentSpacing='sm'
		>
			<div className={styles.executionStack}>
				<div className={styles.executionSection}>
					<div className={styles.executionHeader}>
						<IconLanguage size={16} />
						<Text className={styles.executionTitle}>
							{t('form.agent.basic.language', {
								ns: 'campaign.form.agents',
							})}
						</Text>
					</div>
					<Select
						placeholder={t('form.agent.basic.languagePlaceholder', {
							ns: 'campaign.form.agents',
						})}
						value={currentLanguage}
						onChange={handleLanguageChange}
						data={languageOptions}
						searchable
						nothingFoundMessage={t('form.agent.basic.noLanguageFound', {
							ns: 'campaign.form.agents',
						})}
						leftSection={<IconLanguage size={14} />}
						size='sm'
						className={styles.executionField}
					/>
				</div>

				<div className={styles.executionSection}>
					<div className={styles.executionHeader}>
						<Badge variant='light' color='green' size='sm'>
							{isOutbound
								? t('general.execution.outboundBadge', {
										ns: 'campaign.form.general',
									})
								: t('general.execution.inboundBadge', {
										ns: 'campaign.form.general',
									})}
						</Badge>
						<Text className={styles.executionTitle}>
							{isOutbound
								? t('general.execution.waveTitle', {
										ns: 'campaign.form.general',
									})
								: t('general.execution.inboundTitle', {
										ns: 'campaign.form.general',
									})}
							</Text>
					</div>

					{isOutbound ? (
						<div className={styles.waveGrid}>
							<NumberInput
								label={t('general.defaultWaves', {
									ns: 'campaign.form.general',
								})}
								min={1}
								clampBehavior='strict'
								allowDecimal={false}
								allowNegative={false}
								step={1}
								placeholder={t('general.enterNumberOfWaves', {
									ns: 'campaign.form.general',
								})}
								withAsterisk
								size='sm'
								{...form.getInputProps('defaultMaxWaves')}
							/>

							<Select
								label={t('general.defaultWaveDelay', {
									ns: 'campaign.form.general',
								})}
								data={DELAY_OPTIONS.map((option) => ({
									value: option.value,
									label: t(option.labelKey, { ns: 'campaign.form.general' }),
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
							{t('general.execution.inboundBody', {
								ns: 'campaign.form.general',
							})}
						</Text>
					)}
				</div>
			</div>
		</SectionCard>
	);
};

export default ExecutionDefaultsSection;
