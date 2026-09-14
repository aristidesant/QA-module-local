import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	TagsInput,
	Text,
	TextInput,
} from '@mantine/core';
import dayjs from 'dayjs';
import type {
	ReportFrequency,
	ReportSchedule,
} from '~/models/qa/reportBuilder';
import { FREQUENCIES } from '../constants';
import { nextRunAt } from '../helpers';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

interface ScheduleEditorProps {
	schedule: ReportSchedule | null;
	onChange: (schedule: ReportSchedule | null) => void;
}

const DEFAULT_SCHEDULE: Omit<ReportSchedule, 'nextRunAt'> = {
	enabled: true,
	frequency: 'WEEKLY',
	dayOfWeek: 1,
	time: '08:00',
	recipients: [],
};

/** Recurring delivery of a report definition. */
export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
	schedule,
	onChange,
}) => {
	const { t } = useTranslation('qa.reports');

	/** Any edit re-derives the next run so the preview never goes stale. */
	const patch = (changes: Partial<ReportSchedule>) => {
		const base = schedule ?? {
			...DEFAULT_SCHEDULE,
			nextRunAt: nextRunAt(
				DEFAULT_SCHEDULE.frequency,
				DEFAULT_SCHEDULE.dayOfWeek,
				DEFAULT_SCHEDULE.time
			),
		};
		const merged = { ...base, ...changes };
		onChange({
			...merged,
			nextRunAt: nextRunAt(merged.frequency, merged.dayOfWeek, merged.time),
		});
	};

	return (
		<Stack gap='md'>
			<Switch
				label={t('output.enabled')}
				checked={schedule?.enabled ?? false}
				onChange={(event) =>
					event.currentTarget.checked
						? patch({ enabled: true })
						: onChange(null)
				}
			/>

			{schedule && (
				<>
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='sm'>
						<Select
							label={t('output.frequency')}
							data={FREQUENCIES.map((value) => ({
								value,
								label: t(`output.frequencies.${value}`),
							}))}
							value={schedule.frequency}
							onChange={(value) =>
								value && patch({ frequency: value as ReportFrequency })
							}
							allowDeselect={false}
						/>

						{schedule.frequency === 'MONTHLY' ? (
							<NumberInput
								label={t('output.dayOfMonth')}
								min={1}
								max={28}
								value={schedule.dayOfWeek}
								onChange={(value) => patch({ dayOfWeek: Number(value) || 1 })}
							/>
						) : (
							<Select
								label={t('output.dayOfWeek')}
								data={WEEKDAYS.map((day) => ({
									value: String(day),
									label: t(`output.days.${day}`),
								}))}
								value={String(schedule.dayOfWeek)}
								onChange={(value) =>
									value && patch({ dayOfWeek: Number(value) })
								}
								allowDeselect={false}
							/>
						)}

						<TextInput
							label={t('output.time')}
							type='time'
							value={schedule.time}
							onChange={(event) => patch({ time: event.currentTarget.value })}
						/>
					</SimpleGrid>

					<TagsInput
						label={t('output.recipients')}
						placeholder={t('output.recipientsPlaceholder')}
						value={schedule.recipients}
						onChange={(recipients) => patch({ recipients })}
					/>

					<Text size='xs' c='dimmed'>
						{t('output.nextRun', {
							date: dayjs(schedule.nextRunAt).format('DD MMM YYYY · HH:mm'),
						})}
					</Text>
				</>
			)}
		</Stack>
	);
};

export default ScheduleEditor;
