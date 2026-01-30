import React, { useEffect } from 'react';
import {
	Stack,
	TextInput,
	Textarea,
	Text,
	Group,
	ActionIcon,
	Button,
	Select,
	Switch,
	SegmentedControl,
	Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX, IconSettings } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import { useGetAllAgents } from '~/queries/agentQueries';
import SubagentForm from './SubagentForm';
import ToolSection from './ToolSection';
import { Tabs } from '@mantine/core';

interface WorkflowNodeConfigProps {
	nodeId: string;
	onClose: () => void;
}

const WorkflowNodeConfig: React.FC<WorkflowNodeConfigProps> = ({
	nodeId,
	onClose,
}) => {
	const { values, setFieldValue } = useCampaignFormContext();
	const { data: agentsData, isLoading: isLoadingAgents } = useGetAllAgents();
	const workflow = values.agentConfig?.workflow;
	const node = workflow?.nodes?.[nodeId];

	const form = useForm({
		initialValues: {
			label: '',
			agentId: '',
			delayMs: 0,
			transferMessage: '',
			enableTransferredAgentFirstMessage: false,
			additionalPrompt: '',
			phoneNumber: '',
			transferType: 'conference',
			destinationType: 'phone',
			tools: [] as string[],
			activeTab: 'tools',
		},
	});

	// Sync form with node data
	useEffect(() => {
		if (!node) return;

		const newValues: any = {};

		if (node.type === 'standalone_agent') {
			newValues.agentId = node.agentId || '';
			newValues.delayMs = node.delayMs || 0;
			newValues.transferMessage = node.transferMessage || '';
			newValues.enableTransferredAgentFirstMessage =
				node.enableTransferredAgentFirstMessage || false;
		} else if (node.type === 'override_agent') {
			newValues.label = node.label || '';
			newValues.additionalPrompt = node.additionalPrompt || '';
		} else if (node.type === 'phone_number') {
			newValues.phoneNumber = node.transferDestination?.phoneNumber || '';
			newValues.transferType = node.transferType || 'conference';
			newValues.destinationType = node.transferDestination?.type || 'phone';
		} else if (node.type === 'tool') {
			newValues.tools =
				node.tools?.map((t: { toolId: string }) => t.toolId) || [];
		}

		form.setValues(newValues);
	}, [node]);

	if (!node) {
		return (
			<SectionCard title='Node Configuration'>
				<Text c='dimmed' size='sm'>
					Select a node to configure.
				</Text>
			</SectionCard>
		);
	}

	// Use actual subagent form if it's override_agent
	if (node.type === 'override_agent') {
		return <SubagentForm key={nodeId} nodeId={nodeId} onClose={onClose} />;
	}

	const handleSave = (values: typeof form.values) => {
		if (!workflow || !workflow.nodes[nodeId]) return;

		const updatedNode = { ...workflow.nodes[nodeId] };

		if (updatedNode.type === 'standalone_agent') {
			updatedNode.agentId = values.agentId;
			updatedNode.delayMs = values.delayMs;
			updatedNode.transferMessage = values.transferMessage;
			updatedNode.enableTransferredAgentFirstMessage =
				values.enableTransferredAgentFirstMessage;
		} else if (updatedNode.type === 'override_agent') {
			updatedNode.label = values.label;
			updatedNode.additionalPrompt = values.additionalPrompt;
		} else if (updatedNode.type === 'phone_number') {
			updatedNode.transferType = values.transferType;
			updatedNode.transferDestination = {
				type: values.destinationType as 'phone',
				phoneNumber: values.phoneNumber,
			};
		} else if (updatedNode.type === 'tool') {
			updatedNode.tools = values.tools.map((id) => ({ toolId: id }));
		}

		setFieldValue(`agentConfig.workflow.nodes.${nodeId}`, updatedNode);
	};

	const headerActions = (
		<ActionIcon variant='subtle' color='gray' onClick={onClose}>
			<IconX size={18} />
		</ActionIcon>
	);

	if (node.type === 'tool') {
		const handleToolsChange = (toolIds: string[]) => {
			form.setFieldValue('tools', toolIds);
			const updatedNode = { ...(workflow?.nodes[nodeId] as any) };
			updatedNode.tools = toolIds.map((id) => ({ toolId: id }));
			setFieldValue(`agentConfig.workflow.nodes.${nodeId}`, updatedNode);
		};

		return (
			<SectionCard
				title={node.label || 'Tool dispatch'}
				headerActions={headerActions}
				padding='sm'
				icon={IconSettings}
			>
				<Tabs
					value={form.values.activeTab}
					onChange={(val) => form.setFieldValue('activeTab', val as string)}
					variant='outline'
					mb='md'
				>
					<Tabs.List>
						<Tabs.Tab value='tools'>Tools</Tabs.Tab>
						<Tabs.Tab value='edges'>Edges</Tabs.Tab>
					</Tabs.List>
				</Tabs>

				{form.values.activeTab === 'tools' && (
					<ToolSection
						selectedToolIds={form.values.tools}
						onToolsChange={handleToolsChange}
					/>
				)}

				{form.values.activeTab === 'edges' && (
					<Stack gap='xs'>
						<Text size='sm' fw={500}>
							Outgoing Transitions
						</Text>
						<Text size='xs' c='dimmed'>
							Edit transitions directly on the canvas by clicking the labels.
						</Text>
					</Stack>
				)}
			</SectionCard>
		);
	}

	return (
		<SectionCard
			title={`Configure ${node.type}`}
			description={`Edit settings for this workflow step.`}
			headerActions={headerActions}
			padding='sm'
		>
			<form onSubmit={form.onSubmit(handleSave)}>
				<Stack gap='sm'>
					{node.type === 'standalone_agent' && (
						<>
							<Select
								label='Transfer to'
								placeholder='Select an agent'
								data={
									agentsData?.data?.map((agent) => ({
										value: agent.id,
										label: agent.name,
									})) || []
								}
								searchable
								nothingFoundMessage='No agents found'
								disabled={isLoadingAgents}
								{...form.getInputProps('agentId')}
							/>
							<TextInput
								label='Delay before transfer (milliseconds)'
								placeholder='0'
								type='number'
								{...form.getInputProps('delayMs')}
							/>
							<Textarea
								label='Transfer Message'
								placeholder='Enter message to say during transfer (optional).'
								minRows={3}
								{...form.getInputProps('transferMessage')}
							/>
							<Group justify='space-between' mt='xs'>
								<Text size='sm'>Enable First Message</Text>
								<Switch
									{...form.getInputProps('enableTransferredAgentFirstMessage', {
										type: 'checkbox',
									})}
								/>
							</Group>
						</>
					)}

					{node.type === 'phone_number' && (
						<>
							<Stack gap='xs'>
								<Text size='sm' fw={500}>
									Transfer type
								</Text>
								<SegmentedControl
									fullWidth
									data={[
										{ label: 'Conference', value: 'conference' },
										{
											label: (
												<Group gap={4} wrap='nowrap'>
													<Text size='sm'>SIP REFER</Text>
													<Badge size='xs' variant='light' color='gray'>
														New
													</Badge>
												</Group>
											),
											value: 'sip_refer',
										},
									]}
									{...form.getInputProps('transferType')}
								/>
							</Stack>

							<Select
								label='Destination type'
								data={[{ label: 'Phone Number', value: 'phone' }]}
								{...form.getInputProps('destinationType')}
							/>

							<TextInput
								label='Phone Number'
								placeholder='+15551234567'
								{...form.getInputProps('phoneNumber')}
							/>
						</>
					)}

					{node.type === 'start' && (
						<Text size='sm' c='dimmed'>
							The start node has no configuration.
						</Text>
					)}

					{node.type === 'end' && (
						<Text size='sm' c='dimmed'>
							The end node terminates the workflow.
						</Text>
					)}

					{node.type !== 'start' && node.type !== 'end' && (
						<Group justify='flex-end' mt='md'>
							<Button type='submit' size='sm'>
								Apply Changes
							</Button>
						</Group>
					)}
				</Stack>
			</form>
		</SectionCard>
	);
};

export default WorkflowNodeConfig;
