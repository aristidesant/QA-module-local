import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Divider, Group, Stack, Text } from '@mantine/core';
import type { ReportDraft, ReportFormat } from '~/models/qa/reportBuilder';
import { FORMATS } from '../../constants';
import ScheduleEditor from '../ScheduleEditor';

interface OutputStepProps {
	draft: ReportDraft;
	onChange: (patch: Partial<ReportDraft>) => void;
	formatsError?: string;
}

/** File formats to offer, and whether the report delivers itself. */
export const OutputStep: React.FC<OutputStepProps> = ({
	draft,
	onChange,
	formatsError,
}) => {
	const { t } = useTranslation('qa.reports');

	return (
		<Stack gap='md'>
			<Checkbox.Group
				label={t('output.formats')}
				error={formatsError}
				value={draft.formats}
				onChange={(formats) => onChange({ formats: formats as ReportFormat[] })}
			>
				<Group gap='lg' mt='xs'>
					{FORMATS.map((format) => (
						<Checkbox key={format} value={format} label={format} />
					))}
				</Group>
			</Checkbox.Group>

			<Divider />

			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('output.schedule')}
				</Text>
				<ScheduleEditor
					schedule={draft.schedule}
					onChange={(schedule) => onChange({ schedule })}
				/>
			</div>
		</Stack>
	);
};

export default OutputStep;
