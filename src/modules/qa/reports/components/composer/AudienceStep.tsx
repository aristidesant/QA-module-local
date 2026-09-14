import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Switch, TextInput, Textarea } from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import type { ReportAudience, ReportDraft } from '~/models/qa/reportBuilder';
import { CLIENT_SECTIONS } from '../../constants';

interface AudienceStepProps {
	draft: ReportDraft;
	onChange: (patch: Partial<ReportDraft>) => void;
	nameError?: string;
	clientError?: string;
}

/** Who reads the report, and how it is titled. */
export const AudienceStep: React.FC<AudienceStepProps> = ({
	draft,
	onChange,
	nameError,
	clientError,
}) => {
	const { t } = useTranslation('qa.reports');

	const setAudience = (audience: ReportAudience) => {
		if (audience === 'client') {
			// Internal-only sections cannot travel to a client.
			onChange({
				audience,
				clientName: draft.clientName ?? '',
				showAgentNames: false,
				sections: draft.sections.filter((section) =>
					CLIENT_SECTIONS.includes(section)
				),
			});
			return;
		}
		onChange({ audience, clientName: null, showAgentNames: true });
	};

	return (
		<Stack gap='md'>
			<AppSegmentedControl
				fullWidth
				value={draft.audience}
				onChange={(value) => setAudience(value as ReportAudience)}
				data={[
					{ value: 'internal', label: t('audience.internal') },
					{ value: 'client', label: t('audience.client') },
				]}
			/>

			{draft.audience === 'client' && (
				<>
					<TextInput
						label={t('audience.clientName')}
						placeholder={t('audience.clientNamePlaceholder')}
						value={draft.clientName ?? ''}
						error={clientError}
						onChange={(event) =>
							onChange({ clientName: event.currentTarget.value })
						}
					/>
					<Switch
						label={t('audience.showAgentNames')}
						description={t('audience.showAgentNamesHint')}
						checked={draft.showAgentNames}
						onChange={(event) =>
							onChange({ showAgentNames: event.currentTarget.checked })
						}
					/>
				</>
			)}

			<TextInput
				label={t('audience.name')}
				placeholder={t('audience.namePlaceholder')}
				value={draft.name}
				error={nameError}
				onChange={(event) => onChange({ name: event.currentTarget.value })}
			/>
			<Textarea
				label={t('audience.description')}
				placeholder={t('audience.descriptionPlaceholder')}
				autosize
				minRows={2}
				value={draft.description}
				onChange={(event) =>
					onChange({ description: event.currentTarget.value })
				}
			/>
		</Stack>
	);
};

export default AudienceStep;
