import { Stack, Text, Select, TextInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import type { WorkflowEdge } from '~/models/AgentWorkflowModel';

interface WorkflowEdgeConfigProps {
	edgeId: string;
	onClose: () => void;
	initialTab?: 'forward' | 'backward';
}

function WorkflowEdgeConfig({
	edgeId,
	onClose,
	initialTab: _initialTab,
}: WorkflowEdgeConfigProps) {
	const { values, setFieldValue } = useCampaignFormContext();
	const workflow = values.agentConfig?.workflow;
	const edge = workflow?.edges?.[edgeId] as WorkflowEdge | undefined;

	const form = useForm({
		initialValues: {
			conditionType: edge?.forwardCondition?.type || 'unconditional',
			conditionLabel: (edge?.forwardCondition as any)?.label || '',
			conditionValue: (edge?.forwardCondition as any)?.condition || '',
		},
	});

	const handleSave = (formValues: typeof form.values) => {
		if (!workflow || !edge) return;

		let forwardCondition: WorkflowEdge['forwardCondition'];

		if (formValues.conditionType === 'unconditional') {
			forwardCondition = { type: 'unconditional' };
		} else if (formValues.conditionType === 'llm') {
			forwardCondition = {
				type: 'llm',
				condition: formValues.conditionValue,
				label: formValues.conditionLabel,
			};
		} else if (formValues.conditionType === 'result') {
			forwardCondition = {
				type: 'result',
				successful: formValues.conditionValue === 'true',
			};
		} else {
			forwardCondition = { type: 'unconditional' };
		}

		const updatedEdge: WorkflowEdge = {
			...edge,
			forwardCondition,
		};

		setFieldValue(`agentConfig.workflow.edges.${edgeId}`, updatedEdge);
	};

	if (!edge) {
		return (
			<SectionCard title='Edge Configuration'>
				<Text c='dimmed' size='sm'>
					Edge not found.
				</Text>
			</SectionCard>
		);
	}

	return (
		<SectionCard
			title='Edge Configuration'
			headerActions={
				<Button variant='subtle' color='gray' size='xs' onClick={onClose}>
					<IconX size={16} />
				</Button>
			}
			padding='sm'
		>
			<form onSubmit={form.onSubmit(handleSave)}>
				<Stack gap='sm'>
					<Select
						label='Condition Type'
						data={[
							{ value: 'unconditional', label: 'Always (Unconditional)' },
							{ value: 'llm', label: 'LLM Condition' },
							{ value: 'result', label: 'Tool Result' },
						]}
						{...form.getInputProps('conditionType')}
					/>

					{form.values.conditionType === 'llm' && (
						<>
							<TextInput
								label='Label'
								placeholder='e.g., User wants to schedule'
								{...form.getInputProps('conditionLabel')}
							/>
							<TextInput
								label='Condition'
								placeholder='Describe when this path should be taken'
								{...form.getInputProps('conditionValue')}
							/>
						</>
					)}

					{form.values.conditionType === 'result' && (
						<Select
							label='Tool Result'
							data={[
								{ value: 'true', label: 'Successful' },
								{ value: 'false', label: 'Failed' },
							]}
							{...form.getInputProps('conditionValue')}
						/>
					)}

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

export default WorkflowEdgeConfig;
