import { Stack, Text, TextInput, Textarea, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../campaignFormFunctions';

interface SubagentFormProps {
	nodeId: string;
	onClose: () => void;
}

function SubagentForm({ nodeId, onClose }: SubagentFormProps) {
	const { values, setFieldValue } = useCampaignFormContext();
	const workflow = values.agentConfig?.workflow;
	const node = workflow?.nodes?.[nodeId];

	const form = useForm({
		initialValues: {
			label: (node as any)?.label || '',
			additionalPrompt: (node as any)?.additionalPrompt || '',
		},
	});

	const handleSave = (formValues: typeof form.values) => {
		if (!workflow || !node) return;

		const updatedNode = {
			...node,
			label: formValues.label,
			additionalPrompt: formValues.additionalPrompt,
		};

		setFieldValue(`agentConfig.workflow.nodes.${nodeId}`, updatedNode);
	};

	if (!node) {
		return (
			<SectionCard title='Subagent Configuration'>
				<Text c='dimmed' size='sm'>
					Node not found.
				</Text>
			</SectionCard>
		);
	}

	return (
		<SectionCard
			title={(node as any).label || 'Subagent'}
			headerActions={
				<Button variant='subtle' color='gray' size='xs' onClick={onClose}>
					<IconX size={16} />
				</Button>
			}
			padding='sm'
		>
			<form onSubmit={form.onSubmit(handleSave)}>
				<Stack gap='sm'>
					<TextInput
						label='Label'
						placeholder='Enter a label for this subagent'
						{...form.getInputProps('label')}
					/>
					<Textarea
						label='Additional Prompt'
						placeholder='Enter additional instructions for this subagent'
						minRows={4}
						{...form.getInputProps('additionalPrompt')}
					/>
					<Group justify='flex-end' mt='md'>
						<Button type='submit' size='sm'>
							Apply Changes
						</Button>
					</Group>
				</Stack>
			</form>
		</SectionCard>
	);
}

export default SubagentForm;
