import { Alert, Loader, MultiSelect, Text } from '@mantine/core';
import { IconAlertCircle, IconMicrophone } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import classes from './CampaignVoicePoolSelector.module.css';

interface CampaignVoicePoolSelectorProps {
	value: string[];
	onChange: (voiceIds: string[]) => void;
	label: string;
	description: string;
	placeholder: string;
	hint?: string;
	noVoicesMessage: string;
	noMatchesMessage: string;
	loadErrorTitle: string;
	loadErrorDescription: string;
	allowedVoiceIds?: string[];
	disabled?: boolean;
	required?: boolean;
	clearable?: boolean;
}

const CampaignVoicePoolSelector: React.FC<CampaignVoicePoolSelectorProps> = ({
	value,
	onChange,
	label,
	description,
	placeholder,
	hint,
	noVoicesMessage,
	noMatchesMessage,
	loadErrorTitle,
	loadErrorDescription,
	allowedVoiceIds,
	disabled,
	required,
	clearable = true,
}) => {
	const { data: voices = [], isLoading, isError } = useGetAllAgentVoices();
	const hasAllowedVoiceIds = Array.isArray(allowedVoiceIds);

	const allowedVoiceIdSet = useMemo(() => {
		if (hasAllowedVoiceIds) {
			return new Set(allowedVoiceIds);
		}

		return undefined;
	}, [allowedVoiceIds, hasAllowedVoiceIds]);

	const voiceOptions = useMemo(
		() =>
			voices
				.filter(({ voice }) =>
					allowedVoiceIdSet ? allowedVoiceIdSet.has(voice.id) : true
				)
				.map(({ voice }) => ({
					value: voice.id,
					label: [voice.name, voice.language, voice.gender]
						.filter(Boolean)
						.join(' · '),
				})),
		[allowedVoiceIdSet, voices]
	);

	let helperMessage = hint;
	if (!isLoading && voiceOptions.length === 0) {
		helperMessage = noVoicesMessage;
	}

	return (
		<div className={classes.container}>
			{isError && (
				<Alert
					variant='light'
					color='red'
					icon={<IconAlertCircle size={16} />}
					title={loadErrorTitle}
				>
					{loadErrorDescription}
				</Alert>
			)}

			<MultiSelect
				label={label}
				description={description}
				placeholder={placeholder}
				data={voiceOptions}
				value={value}
				onChange={onChange}
				leftSection={<IconMicrophone size={16} />}
				rightSection={isLoading ? <Loader size={16} /> : undefined}
				searchable
				clearable={clearable}
				disabled={disabled || isLoading || isError || voiceOptions.length === 0}
				nothingFoundMessage={noMatchesMessage}
				size='sm'
				withAsterisk={required}
			/>

			{helperMessage && (
				<Text size='xs' c='dimmed' className={classes.hint}>
					{helperMessage}
				</Text>
			)}
		</div>
	);
};

export default CampaignVoicePoolSelector;
