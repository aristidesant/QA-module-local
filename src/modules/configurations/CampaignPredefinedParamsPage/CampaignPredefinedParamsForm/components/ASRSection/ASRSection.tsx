import { Select, Stack, TagsInput } from '@mantine/core';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import { ASR_PROVIDERS, ASR_QUALITY, AUDIO_FORMATS } from '../../formConfig';

export const ASRSection: React.FC = () => {
	const { form } = useFormContext();

	return (
		<Stack gap='lg' mt='md'>
			<Select
				label='Provider'
				placeholder='Select ASR provider'
				required
				data={ASR_PROVIDERS}
				{...form.getInputProps('asrProvider')}
				searchable
			/>
			<Select
				label='Quality'
				placeholder='Select quality'
				required
				data={ASR_QUALITY}
				{...form.getInputProps('asrQuality')}
			/>
			<Select
				label='Input Audio Format'
				placeholder='Select format'
				required
				data={AUDIO_FORMATS}
				{...form.getInputProps('asrUserInputAudioFormat')}
			/>
			<TagsInput
				label='Keywords'
				placeholder='Type and press Enter'
				description='Add keywords to improve transcription accuracy'
				{...form.getInputProps('asrKeywords')}
			/>
		</Stack>
	);
};

export default ASRSection;
