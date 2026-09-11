import { Checkbox, Grid, Group, Select, Stack, Switch } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import type { UseFormReturnType } from '@mantine/form';
import { DAYS_OF_WEEK, EVALUATION_AREAS, TIMEZONES } from '~/modules/qa/triggers/constants';
import { type RuleFormValues } from '~/modules/qa/triggers/helpers';
import { SectionCard } from '~/components/SectionCard';

interface ScheduleSectionProps {
	form: UseFormReturnType<RuleFormValues>;
}

export function ScheduleSection({ form }: ScheduleSectionProps) {
	const { t } = useTranslation('qa.triggers');

	const dayOptions = DAYS_OF_WEEK.map((day) => ({
		label: t(`days.${day}`),
		value: day,
	}));

	const tzOptions = TIMEZONES.map((tz) => ({
		label: tz,
		value: tz,
	}));

	return (
		<SectionCard title={t('editor.sections.schedule')}>
			<Grid>
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Select
						label={t('editor.fields.dayOfWeek')}
						data={dayOptions}
						value={form.values.schedule.dayOfWeek}
						onChange={(v) =>
							v &&
							form.setFieldValue('schedule.dayOfWeek', v as any)
						}
						searchable
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<TimeInput
						label={t('editor.fields.time')}
						value={form.values.schedule.time}
						onChange={(v) =>
							form.setFieldValue('schedule.time', v.target.value)
						}
						{...(form.errors['schedule.time']
							? { error: t('editor.validation.timeRequired') }
							: {})}
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<Select
						label={t('editor.fields.timezone')}
						data={tzOptions}
						value={form.values.schedule.timezone}
						onChange={(v) =>
							v &&
							form.setFieldValue('schedule.timezone', v)
						}
						searchable
					/>
				</Grid.Col>
			</Grid>

			<Stack gap='xs' mt='md'>
				<div>
					<label style={{ fontSize: 'var(--mantine-font-size-sm)', fontWeight: 500 }}>
						{t('editor.fields.includedAreas')}
					</label>
					<Group mt={8}>
						{EVALUATION_AREAS.map((area) => (
							<Checkbox
								key={area}
								label={t(`areas.${area}`)}
								checked={form.values.schedule.includedAreas.includes(
									area
								)}
								onChange={(e) => {
									const current =
										form.values.schedule.includedAreas;
									const next = e.currentTarget.checked
										? [...current, area]
										: current.filter((a) => a !== area);
									form.setFieldValue(
										'schedule.includedAreas',
										next
									);
								}}
							/>
						))}
					</Group>
				</div>

				<Switch
					label={t('editor.fields.teamComparison')}
					checked={form.values.schedule.includeTeamComparison}
					onChange={(e) =>
						form.setFieldValue(
							'schedule.includeTeamComparison',
							e.currentTarget.checked
						)
					}
				/>
			</Stack>
		</SectionCard>
	);
}
