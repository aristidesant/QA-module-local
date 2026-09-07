import React, { useState } from 'react';
import {
	Card,
	Stack,
	Text,
	Group,
	Button,
	TextInput,
	Textarea,
	Select,
	MultiSelect,
	NumberInput,
	Tabs,
	Table,
	Badge,
	ActionIcon,
	Modal,
	SimpleGrid,
	Alert,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import type { TriggerConfiguration, TriggerType, TriggerConfigScope, TriggerAction } from '~/models/qa';

interface TriggersConfigPanelProps {
	triggers?: TriggerConfiguration[];
	onSaveTrigger?: (trigger: Partial<TriggerConfiguration>) => void;
	onDeleteTrigger?: (triggerId: number) => void;
	supervisorId?: number;
}

export const TriggersConfigPanel: React.FC<TriggersConfigPanelProps> = ({
	triggers = [],
	onSaveTrigger,
	onDeleteTrigger,
	supervisorId,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [formData, setFormData] = useState<{
		name: string;
		description: string;
		triggerType: string;
		scope: string;
		conditions: any[];
		actions: string[];
		priority: string;
		status: string;
	}>({
		name: '',
		description: '',
		triggerType: 'QA',
		scope: 'TEAM',
		conditions: [{ field: 'qaScore', condition: 'LESS_THAN', value: 75 }],
		actions: ['ALERT'],
		priority: 'HIGH',
		status: 'ACTIVE',
	});

	const handleOpenModal = (trigger?: TriggerConfiguration) => {
		if (trigger) {
			setEditingId(trigger.id);
			setFormData({
				name: trigger.name,
				description: trigger.description || '',
				triggerType: trigger.triggerType,
				scope: trigger.scope,
				conditions: trigger.conditions as any,
				actions: trigger.actions,
				priority: trigger.priority || 'MEDIUM',
				status: trigger.status,
			});
		} else {
			setEditingId(null);
			setFormData({
				name: '',
				description: '',
				triggerType: 'QA',
				scope: 'TEAM',
				conditions: [{ field: 'qaScore', condition: 'LESS_THAN', value: 75 }] as any,
				actions: ['ALERT'],
				priority: 'HIGH',
				status: 'ACTIVE',
			});
		}
		setIsModalOpen(true);
	};

	const handleSave = () => {
		const triggerData: Partial<TriggerConfiguration> = {
			id: editingId || undefined,
			name: formData.name,
			description: formData.description,
			triggerType: formData.triggerType as TriggerType,
			scope: formData.scope as TriggerConfigScope,
			conditions: formData.conditions,
			actions: formData.actions as TriggerAction[],
			priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH',
			status: formData.status as 'ACTIVE' | 'INACTIVE',
		};
		onSaveTrigger?.(triggerData);
		setIsModalOpen(false);
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'HIGH':
				return 'red';
			case 'MEDIUM':
				return 'yellow';
			case 'LOW':
				return 'blue';
			default:
				return 'gray';
		}
	};

	return (
		<Stack gap="md">
			<Alert icon={<IconAlertCircle size={16} />} title="QA Triggers" color="blue">
				Configure automatic alerts and rules for your team's QA performance. These triggers will apply to all team members.
			</Alert>

			<Card p="lg" radius="md" withBorder>
				<Stack gap="md">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text fw={600} size="md">
								QA Trigger Rules
							</Text>
							<Text size="xs" c="dimmed">
								Set conditions to automatically alert or recognize team members
							</Text>
						</div>
						<Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
							New Trigger
						</Button>
					</Group>

					<Tabs defaultValue="active">
						<Tabs.List>
							<Tabs.Tab value="active">Active Triggers</Tabs.Tab>
							<Tabs.Tab value="inactive">Inactive Triggers</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value="active" pt="md">
							<div style={{ overflowX: 'auto' }}>
								<Table striped>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Name</Table.Th>
											<Table.Th>Type</Table.Th>
											<Table.Th>Scope</Table.Th>
											<Table.Th>Actions</Table.Th>
											<Table.Th>Priority</Table.Th>
											<Table.Th ta="right">Options</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{triggers
											.filter((t) => t.status === 'ACTIVE')
											.map((trigger) => (
												<Table.Tr key={trigger.id}>
													<Table.Td>
														<div>
															<Text fw={500} size="sm">
																{trigger.name}
															</Text>
															<Text size="xs" c="dimmed">
																{trigger.description}
															</Text>
														</div>
													</Table.Td>
													<Table.Td>
														<Badge size="sm" variant="light">
															{trigger.triggerType}
														</Badge>
													</Table.Td>
													<Table.Td>
														<Text size="sm">{trigger.scope}</Text>
													</Table.Td>
													<Table.Td>
														<Group gap="xs">
															{trigger.actions.map((action) => (
																<Badge key={action} size="xs" variant="dot">
																	{action}
																</Badge>
															))}
														</Group>
													</Table.Td>
													<Table.Td>
														<Badge color={getPriorityColor(trigger.priority || 'MEDIUM')} variant="light">
															{trigger.priority}
														</Badge>
													</Table.Td>
													<Table.Td ta="right">
														<Group gap="xs" justify="flex-end">
															<ActionIcon size="sm" variant="subtle" onClick={() => handleOpenModal(trigger)}>
																<IconEdit size={16} />
															</ActionIcon>
															<ActionIcon size="sm" variant="subtle" color="red" onClick={() => onDeleteTrigger?.(trigger.id)}>
																<IconTrash size={16} />
															</ActionIcon>
														</Group>
													</Table.Td>
												</Table.Tr>
											))}
									</Table.Tbody>
								</Table>
							</div>
						</Tabs.Panel>

						<Tabs.Panel value="inactive" pt="md">
							<div style={{ overflowX: 'auto' }}>
								<Table striped>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Name</Table.Th>
											<Table.Th>Type</Table.Th>
											<Table.Th ta="right">Actions</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{triggers
											.filter((t) => t.status === 'INACTIVE')
											.map((trigger) => (
												<Table.Tr key={trigger.id}>
													<Table.Td>
														<Text fw={500} size="sm">
															{trigger.name}
														</Text>
													</Table.Td>
													<Table.Td>
														<Badge size="sm" variant="light">
															{trigger.triggerType}
														</Badge>
													</Table.Td>
													<Table.Td ta="right">
														<ActionIcon size="sm" variant="subtle" color="red" onClick={() => onDeleteTrigger?.(trigger.id)}>
															<IconTrash size={16} />
														</ActionIcon>
													</Table.Td>
												</Table.Tr>
											))}
									</Table.Tbody>
								</Table>
							</div>
						</Tabs.Panel>
					</Tabs>
				</Stack>
			</Card>

			<Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Trigger' : 'Create New Trigger'} size="lg">
				<Stack gap="md">
					<TextInput
						label="Trigger Name"
						placeholder="e.g., Low QA Score Alert"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
						required
					/>

					<Textarea
						label="Description"
						placeholder="What does this trigger do?"
						value={formData.description}
						onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
						rows={2}
					/>

					<SimpleGrid cols={2}>
						<Select label="Trigger Type" data={['QA', 'SENTIMENT', 'COMPLIANCE', 'AUTO_FAILS']} value={formData.triggerType} onChange={(value) => setFormData({ ...formData, triggerType: value || 'QA' })} />

						<Select label="Scope" data={['TEAM', 'GLOBAL', 'CAMPAIGN']} value={formData.scope} onChange={(value) => setFormData({ ...formData, scope: value || 'TEAM' })} disabled={supervisorId !== undefined} />
					</SimpleGrid>

					<div style={{ padding: 'var(--mantine-spacing-md)', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
						<Text fw={600} size="sm" mb="xs">
							Condition
						</Text>
						<SimpleGrid cols={3} spacing="sm">
							<TextInput label="Field" value={formData.conditions[0]?.field || ''} disabled />
							<Select
								label="Condition"
								data={['LESS_THAN', 'GREATER_THAN', 'EQUALS']}
								value={formData.conditions[0]?.condition}
								onChange={(value) => {
									const newConditions = [...formData.conditions];
									newConditions[0] = { ...newConditions[0], condition: value || 'LESS_THAN' };
									setFormData({ ...formData, conditions: newConditions });
								}}
							/>
							<NumberInput
								label="Threshold"
								value={formData.conditions[0]?.value as number || 0}
								onChange={(value) => {
									const newConditions = [...formData.conditions];
									newConditions[0] = { ...newConditions[0], value: typeof value === 'number' ? value : 0 };
									setFormData({ ...formData, conditions: newConditions });
								}}
							/>
						</SimpleGrid>
					</div>

					<MultiSelect label="Actions" data={['ALERT', 'AUTO_RECOGNIZE', 'ESCALATE']} value={formData.actions} onChange={(value) => setFormData({ ...formData, actions: value })} />

					<SimpleGrid cols={2}>
						<Select label="Priority" data={['LOW', 'MEDIUM', 'HIGH']} value={formData.priority} onChange={(value) => setFormData({ ...formData, priority: value || 'MEDIUM' })} />

						<Select label="Status" data={['ACTIVE', 'INACTIVE']} value={formData.status} onChange={(value) => setFormData({ ...formData, status: value || 'ACTIVE' })} />
					</SimpleGrid>

					<Group justify="flex-end">
						<Button variant="light" onClick={() => setIsModalOpen(false)}>
							Cancel
						</Button>
						<Button leftSection={<IconCheck size={16} />} onClick={handleSave}>
							Save Trigger
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
};
