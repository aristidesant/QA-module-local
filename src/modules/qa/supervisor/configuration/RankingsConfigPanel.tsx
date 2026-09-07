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
	Switch,
	Tabs,
	Table,
	Badge,
	ActionIcon,
	Modal,
	SimpleGrid,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconCheck } from '@tabler/icons-react';
import type { RankingConfiguration } from '~/models/qa';

interface RankingsConfigPanelProps {
	rankings?: RankingConfiguration[];
	onSaveRanking?: (ranking: Partial<RankingConfiguration>) => void;
	onDeleteRanking?: (rankingId: number) => void;
	supervisorId?: number;
}

export const RankingsConfigPanel: React.FC<RankingsConfigPanelProps> = ({
	rankings = [],
	onSaveRanking,
	onDeleteRanking,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const formatDate = (d: Date) => d.toISOString().split('T')[0];

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		startDate: formatDate(new Date()),
		endDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
		metrics: ['QA'],
		displaySettings: {
			showAgentNames: true,
			showScores: true,
			maxDisplayCount: 10,
		},
		status: 'ACTIVE',
	});

	const handleOpenModal = (ranking?: RankingConfiguration) => {
		if (ranking) {
			setEditingId(ranking.id);
			setFormData({
				name: ranking.name,
				description: ranking.description || '',
				startDate: typeof ranking.startDate === 'string' ? ranking.startDate : formatDate(new Date(ranking.startDate)),
				endDate: typeof ranking.endDate === 'string' ? ranking.endDate : formatDate(new Date(ranking.endDate)),
				metrics: ranking.metrics.map((m) => m.type),
				displaySettings: {
					showAgentNames: ranking.displaySettings?.showAgentNames ?? true,
					showScores: ranking.displaySettings?.showScores ?? true,
					maxDisplayCount: ranking.displaySettings?.maxDisplayCount ?? 10,
				},
				status: ranking.status,
			});
		} else {
			setEditingId(null);
			setFormData({
				name: '',
				description: '',
				startDate: formatDate(new Date()),
				endDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
				metrics: ['QA'],
				displaySettings: {
					showAgentNames: true,
					showScores: true,
					maxDisplayCount: 10,
				},
				status: 'ACTIVE',
			});
		}
		setIsModalOpen(true);
	};

	const handleSave = () => {
		onSaveRanking?.({
			id: editingId || undefined,
			name: formData.name,
			description: formData.description,
			startDate: formData.startDate,
			endDate: formData.endDate,
			metrics: formData.metrics.map((type) => ({ type: type as any })),
			displaySettings: formData.displaySettings,
			status: formData.status as 'ACTIVE' | 'INACTIVE',
		});
		setIsModalOpen(false);
	};

	return (
		<Stack gap="md">
			<Card p="lg" radius="md" withBorder>
				<Stack gap="md">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text fw={600} size="md">
								Rankings Configuration
							</Text>
							<Text size="xs" c="dimmed">
								Define and manage team member performance rankings
							</Text>
						</div>
						<Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
							New Ranking
						</Button>
					</Group>

					<Tabs defaultValue="active">
						<Tabs.List>
							<Tabs.Tab value="active">Active Rankings</Tabs.Tab>
							<Tabs.Tab value="inactive">Inactive Rankings</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value="active" pt="md">
							<div style={{ overflowX: 'auto' }}>
								<Table striped>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Name</Table.Th>
											<Table.Th>Metrics</Table.Th>
											<Table.Th>Period</Table.Th>
											<Table.Th>Status</Table.Th>
											<Table.Th ta="right">Actions</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{rankings
											.filter((r) => r.status === 'ACTIVE')
											.map((ranking) => (
												<Table.Tr key={ranking.id}>
													<Table.Td>
														<div>
															<Text fw={500} size="sm">
																{ranking.name}
															</Text>
															<Text size="xs" c="dimmed">
																{ranking.description}
															</Text>
														</div>
													</Table.Td>
													<Table.Td>
														<Group gap="xs">
															{ranking.metrics.map((m) => (
																<Badge key={m.type} size="sm" variant="light">
																	{m.type}
																</Badge>
															))}
														</Group>
													</Table.Td>
													<Table.Td>
														<Text size="sm">
															{typeof ranking.startDate === 'string' ? ranking.startDate : new Date(ranking.startDate).toLocaleDateString()} - {typeof ranking.endDate === 'string' ? ranking.endDate : new Date(ranking.endDate).toLocaleDateString()}
														</Text>
													</Table.Td>
													<Table.Td>
														<Badge color="green" variant="light">
															{ranking.status}
														</Badge>
													</Table.Td>
													<Table.Td ta="right">
														<Group gap="xs" justify="flex-end">
															<ActionIcon size="sm" variant="subtle" onClick={() => handleOpenModal(ranking)}>
																<IconEdit size={16} />
															</ActionIcon>
															<ActionIcon size="sm" variant="subtle" color="red" onClick={() => onDeleteRanking?.(ranking.id)}>
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
											<Table.Th>Metrics</Table.Th>
											<Table.Th>Period</Table.Th>
											<Table.Th ta="right">Actions</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{rankings
											.filter((r) => r.status === 'INACTIVE')
											.map((ranking) => (
												<Table.Tr key={ranking.id}>
													<Table.Td>
														<Text fw={500} size="sm">
															{ranking.name}
														</Text>
													</Table.Td>
													<Table.Td>
														<Group gap="xs">
															{ranking.metrics.map((m) => (
																<Badge key={m.type} size="sm" variant="light">
																	{m.type}
																</Badge>
															))}
														</Group>
													</Table.Td>
													<Table.Td>
														<Text size="sm">
															{typeof ranking.startDate === 'string' ? ranking.startDate : new Date(ranking.startDate).toLocaleDateString()} - {typeof ranking.endDate === 'string' ? ranking.endDate : new Date(ranking.endDate).toLocaleDateString()}
														</Text>
													</Table.Td>
													<Table.Td ta="right">
														<ActionIcon size="sm" variant="subtle" color="red" onClick={() => onDeleteRanking?.(ranking.id)}>
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

			<Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Ranking' : 'Create New Ranking'} size="lg">
				<Stack gap="md">
					<TextInput label="Ranking Name" placeholder="e.g., September Team Rankings" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })} />

					<Textarea label="Description" placeholder="Optional description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })} rows={3} />

					<SimpleGrid cols={2}>
						<TextInput
							label="Start Date"
							type="date"
							value={formData.startDate}
							onChange={(e) => setFormData({ ...formData, startDate: e.currentTarget.value })}
						/>
						<TextInput
							label="End Date"
							type="date"
							value={formData.endDate}
							onChange={(e) => setFormData({ ...formData, endDate: e.currentTarget.value })}
						/>
					</SimpleGrid>

					<MultiSelect
						label="Metrics to Include"
						placeholder="Select metrics"
						data={['QA', 'SENTIMENT', 'COMPLIANCE', 'BUSINESS_INSIGHTS', 'AUTO_FAILS']}
						value={formData.metrics}
						onChange={(value) => setFormData({ ...formData, metrics: value })}
					/>

					<Select label="Status" data={['ACTIVE', 'INACTIVE']} value={formData.status} onChange={(value) => setFormData({ ...formData, status: value as any })} />

					<div style={{ padding: 'var(--mantine-spacing-md)', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
						<Text fw={600} size="sm" mb="xs">
							Display Settings
						</Text>
						<Stack gap="sm">
							<Switch
								label="Show agent names"
								checked={formData.displaySettings.showAgentNames}
								onChange={(e) =>
									setFormData({
										...formData,
										displaySettings: { ...formData.displaySettings, showAgentNames: e.currentTarget.checked },
									})
								}
							/>
							<Switch
								label="Show scores"
								checked={formData.displaySettings.showScores}
								onChange={(e) =>
									setFormData({
										...formData,
										displaySettings: { ...formData.displaySettings, showScores: e.currentTarget.checked },
									})
								}
							/>
							<TextInput
								label="Max display count"
								type="number"
								value={formData.displaySettings.maxDisplayCount}
								onChange={(e) =>
									setFormData({
										...formData,
										displaySettings: { ...formData.displaySettings, maxDisplayCount: parseInt(e.currentTarget.value) },
									})
								}
							/>
						</Stack>
					</div>

					<Group justify="flex-end">
						<Button variant="light" onClick={() => setIsModalOpen(false)}>
							Cancel
						</Button>
						<Button leftSection={<IconCheck size={16} />} onClick={handleSave}>
							Save Ranking
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
};
