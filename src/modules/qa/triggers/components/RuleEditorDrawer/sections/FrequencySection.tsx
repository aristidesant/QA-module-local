import { Grid, NumberInput, Stack, Switch } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import type { UseFormReturnType } from '@mantine/form';
import { type RuleFormValues } from '~/modules/qa/triggers/helpers';
import { SectionCard } from '~/components/SectionCard';

interface FrequencySectionProps {
	form: UseFormReturnType<RuleFormValues>;
}

export function FrequencySection({ form }: FrequencySectionProps) {
	const { t } = useTranslation('qa.triggers');

	return (
		<SectionCard
			title={t('editor.sections.frequency')}
			description={t('editor.sections.frequencyDescription')}
		>
			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<NumberInput
						label={t('editor.fields.cooldown')}
						min={0}
						max={30}
						step={1}
						value={form.values.cooldownDays}
						onChange={(v) =>
							form.setFieldValue('cooldownDays', typeof v === 'number' ? v : (Number(v) || 0))
						}
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6 }}>
					<Stack gap={0}>
						<Switch
							label={t('editor.fields.noLimit')}
							checked={!form.values.maxPerWeekEnabled}
							onChange={(e) =>
								form.setFieldValue(
									'maxPerWeekEnabled',
									!e.currentTarget.checked
								)
							}
						/>
						{form.values.maxPerWeekEnabled && (
							<NumberInput
								label={t('editor.fields.maxPerWeek')}
								min={1}
								max={20}
								step={1}
								value={form.values.maxPerWeek}
								onChange={(v) =>
									form.setFieldValue(
										'maxPerWeek',
										typeof v === 'number' ? v : (Number(v) || 2)
									)
								}
								mt='sm'
							/>
						)}
					</Stack>
				</Grid.Col>
			</Grid>

			<Stack gap='xs' mt='md'>
				<Switch
					label={t('editor.fields.quietHours')}
					checked={form.values.quietHoursEnabled}
					onChange={(e) =>
						form.setFieldValue(
							'quietHoursEnabled',
							e.currentTarget.checked
						)
					}
				/>

				{form.values.quietHoursEnabled && (
					<Grid>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TimeInput
								label={t('editor.fields.quietFrom')}
								value={form.values.quietHoursFrom}
								onChange={(v) =>
									form.setFieldValue(
										'quietHoursFrom',
										v.target.value
									)
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TimeInput
								label={t('editor.fields.quietTo')}
								value={form.values.quietHoursTo}
								onChange={(v) =>
									form.setFieldValue(
										'quietHoursTo',
										v.target.value
									)
								}
							/>
						</Grid.Col>
					</Grid>
				)}
			</Stack>
		</SectionCard>
	);
}
