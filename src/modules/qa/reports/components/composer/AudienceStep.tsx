import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Stack, Switch, TextInput, Textarea } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import type { ReportAudience, ReportDraft } from '~/models/qa/reportBuilder';
import { CLIENT_SECTIONS } from '../../constants';

interface AudienceStepProps {
	draft: ReportDraft;
	onChange: (patch: Partial<ReportDraft>) => void;
	nameError?: string;
	clientError?: string;
}

/** How the report is titled, and who reads it. */
export const AudienceStep: React.FC<AudienceStepProps> = ({
	draft,
	onChange,
	nameError,
	clientError,
}) => {
	const { t } = useTranslation('qa.reports');
	/** Internal sections dropped by the last switch to a client audience, so the loss is said out loud. */
	const [removed, setRemoved] = useState(0);

	const setAudience = (audience: ReportAudience) => {
		if (audience === 'client') {
			// Internal-only sections cannot travel to a client.
			const kept = draft.sections.filter((section) =>
				CLIENT_SECTIONS.includes(section)
			);
			setRemoved(draft.sections.length - kept.length);
			onChange({
				audience,
				clientName: draft.clientName ?? '',
				showAgentNames: false,
				sections: kept,
			});
			return;
		}
		setRemoved(0);
		onChange({ audience, clientName: null, showAgentNames: true });
	};

	return (
		<Stack gap='md'>
			<TextInput
				label={t('audience.name')}
				placeholder={t('audience.namePlaceholder')}
				value={draft.name}
				error={nameError}
				onChange={(event) => onChange({ name: event.currentTarget.value })}
			/>

			<AppSegmentedControl
				fullWidth
				value={draft.audience}
				onChange={(value) => setAudience(value as ReportAudience)}
				data={[
					{ value: 'internal', label: t('audience.internal') },
					{ value: 'client', label: t('audience.client') },
				]}
			/>

			{draft.audience === 'client' && removed > 0 && (
				<Alert variant='light' color='gray' icon={<IconInfoCircle size={16} />}>
					{t('audience.removedInternal', { count: removed })}
				</Alert>
			)}

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
