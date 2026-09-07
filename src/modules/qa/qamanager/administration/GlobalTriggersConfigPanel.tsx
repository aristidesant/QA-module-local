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

interface GlobalTriggersConfigPanelProps {
	globalTriggers?: TriggerConfiguration[];
	campaignOverrides?: Record<number, TriggerConfiguration[]>;
	onSaveGlobalTrigger?: (trigger: Partial<TriggerConfiguration>) => void;
	onSaveOverride?: (campaignId: number, trigger: Partial<TriggerConfiguration>) => void;
	onDeleteTrigger?: (triggerId: number) => void;
	campaigns?: Array<{ id: number; name: string }>;
}

export const GlobalTriggersConfigPanel: React.FC<GlobalTriggersConfigPanelProps> = ({
	globalTriggers = [],
	campaignOverrides = {},
	onSaveGlobalTrigger,
	onSaveOverride,
	onDeleteTrigger,
	campaigns = [],
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
	const [formData, setFormData] = useState<{
		name: string;
		description: string;
		triggerType: TriggerType;
		scope: TriggerConfigScope;
		conditions: any[];
		actions: TriggerAction[];
		priority: string;
		status: string;
	}>({
		name: '',
		description: '',
		triggerType: 'QA',
		scope: 'GLOBAL',
		conditions: [{ field: 'qaScore', condition: 'LESS_THAN', value: 75 }],
		actions: ['ALERT'],
		priority: 'HIGH',
		status: 'ACTIVE',
	});

	const handleOpenModal = (trigger?: TriggerConfiguration, campaignId?: number) => {
		if (campaignId) {
			setSelectedCampaign(campaignId);
		}
		if (trigger) {
			setEditingId(trigger.id);
			setFormData({
				name: trigger.name,
				description: trigger.description || '',
				triggerType: trigger.triggerType,
				scope: trigger.scope,
				conditions: trigger.conditions,
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
				scope: selectedCampaign ? 'CAMPAIGN' : 'GLOBAL',
				conditions: [{ field: 'qaScore', condition: 'LESS_THAN', value: 75 }],
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
			triggerType: formData.triggerType,
			scope: formData.scope,
			conditions: formData.conditions,
			actions: formData.actions,
			priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH',
			status: formData.status as 'ACTIVE' | 'INACTIVE',
		};

		if (selectedCampaign) {
			onSaveOverride?.(selectedCampaign, triggerData);
		} else {
			onSaveGlobalTrigger?.(triggerData);
		}
		setIsModalOpen(false);
		setSelectedCampaign(null);
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
			<Alert icon={<IconAlertCircle size={16} />} title="Global QA Triggers" color="blue">
				Configure platform-wide QA trigger rules. Campaign-specific overrides will take precedence over global rules.
			</Alert>

			<Tabs defaultValue="global">
				<Tabs.List>
					<Tabs.Tab value="global">Global Rules</Tabs.Tab>
					<Tabs.Tab value="overrides">Campaign Overrides</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="global" pt="md">
					<Card p="lg" radius="md" withBorder>
						<Stack gap="md">
							<Group justify="space-between">
								<div>
									<Text fw={600} size="md">
										Global Trigger Rules
									</Text>
									<Text size="xs" c="dimmed">
										Apply to all campaigns unless overridden
									</Text>
								</div>
								<Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
									New Global Rule
								</Button>
							</Group>

							<div style={{ overflowX: 'auto' }}>
								<Table striped highlightOnHover>
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
										{globalTriggers
											.filter((t) => t.scope === 'GLOBAL')
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
														<Badge size="sm">{trigger.scope}</Badge>
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
						</Stack>
					</Card>
				</Tabs.Panel>

				<Tabs.Panel value="overrides" pt="md">
					<Stack gap="md">
						{campaigns.map((campaign) => (
							<Card key={campaign.id} p="lg" radius="md" withBorder>
								<Stack gap="md">
									<Group justify="space-between">
										<div>
											<Text fw={600}>{campaign.name}</Text>
											<Text size="xs" c="dimmed">
												Campaign-specific trigger overrides
											</Text>
										</div>
										<Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => handleOpenModal(undefined, campaign.id)}>
											Add Override
										</Button>
									</Group>

									{(campaignOverrides[campaign.id]?.length ?? 0) > 0 ? (
										<div style={{ overflowX: 'auto' }}>
											<Table striped highlightOnHover>
												<Table.Thead>
													<Table.Tr>
														<Table.Th>Name</Table.Th>
														<Table.Th>Actions</Table.Th>
														<Table.Th ta="right">Options</Table.Th>
													</Table.Tr>
												</Table.Thead>
												<Table.Tbody>
													{campaignOverrides[campaign.id]?.map((trigger) => (
														<Table.Tr key={trigger.id}>
															<Table.Td>
																<Text fw={500} size="sm">
																	{trigger.name}
																</Text>
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
															<Table.Td ta="right">
																<Group gap="xs" justify="flex-end">
																	<ActionIcon size="sm" variant="subtle" onClick={() => handleOpenModal(trigger, campaign.id)}>
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
									) : (
										<Text size="sm" c="dimmed" ta="center" p="md">
											No overrides. Uses global rules.
										</Text>
									)}
								</Stack>
							</Card>
						))}
					</Stack>
				</Tabs.Panel>
			</Tabs>

			<Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Trigger' : 'Create New Trigger'} size="lg">
				<Stack gap="md">
					<TextInput
						label="Trigger Name"
						placeholder="e.g., Critical QA Score Drop"
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

						<Select
							label="Scope"
							data={['GLOBAL', 'CAMPAIGN']}
							value={formData.scope}
							onChange={(value) => setFormData({ ...formData, scope: value || 'GLOBAL' })}
						/>
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
								value={formData.conditions[0]?.value || 0}
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
