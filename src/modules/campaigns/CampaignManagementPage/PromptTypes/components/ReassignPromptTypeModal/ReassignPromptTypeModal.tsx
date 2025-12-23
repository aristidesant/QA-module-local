import React, { useEffect, useState } from 'react';
import {
	Modal,
	Button,
	Stack,
	Text,
	Select,
	Group,
	Loader,
	Alert,
	Table,
	Badge,
	ScrollArea,
	ActionIcon,
	Textarea,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconArrowRight,
	IconEye,
	IconDownload,
	IconEdit,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import campaignPromptsApi from '~/api/campaignPromptApi';
import campaignPromptTypeApi from '~/api/campaignPromptTypeApi';
import PromptEditor from '~/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptEditModal/PromptTypeAccordionItem/PromptEditor';
import type { CampaignPromptUsageModel } from '~/models/CampaignPromptUsageModel';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

interface ReassignPromptTypeModalProps {
	opened: boolean;
	onClose: () => void;
	typeToDelete: CampaignPromptTypeModel;
	affectedCampaigns: CampaignPromptUsageModel[];
	onDeleteType: (id: number) => Promise<void>;
}

interface EditReassignmentPromptModalProps {
	opened: boolean;
	onClose: () => void;
	value: string;
	onChange: (val: string) => void;
	targetType: CampaignPromptTypeModel;
	currentCampaignId: number;
	originalPrompt?: string;
}

const EditReassignmentPromptModal: React.FC<
	EditReassignmentPromptModalProps
> = ({
	opened,
	onClose,
	value,
	onChange,
	targetType,
	currentCampaignId,
	originalPrompt,
}) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Edit Prompt Content'
			size='lg'
		>
			<Stack gap='md'>
				<div style={{ height: 400 }}>
					<PromptEditor
						type={targetType}
						value={value}
						onChange={onChange}
						campaignId={currentCampaignId}
						headerLeftSection={
							originalPrompt && (
								<Button
									variant='light'
									size='xs'
									leftSection={<IconDownload size={14} />}
									onClick={() => onChange(originalPrompt)}
									fullWidth={false}
									w='fit-content'
								>
									Import original prompt
								</Button>
							)
						}
					/>
				</div>
				<Group justify='flex-end'>
					<Button onClick={onClose}>Done</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

const DELETE_OPTION_VALUE = 'delete_prompt';

const ReassignPromptTypeModal: React.FC<ReassignPromptTypeModalProps> = ({
	opened,
	onClose,
	typeToDelete,
	affectedCampaigns,
	onDeleteType,
}) => {
	const [loadingDetails, setLoadingDetails] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [availableTypesMap, setAvailableTypesMap] = useState<
		Record<number, CampaignPromptTypeModel[]>
	>({});

	// Map of campaignPromptId -> newTypeId (or DELETE_OPTION_VALUE)
	const [assignments, setAssignments] = useState<Record<number, string>>({});
	// Map of campaignPromptId -> newPromptContent
	const [newPrompts, setNewPrompts] = useState<Record<number, string>>({});
	const [viewPrompt, setViewPrompt] = useState<string | null>(null);
	const [editingPromptId, setEditingPromptId] = useState<number | null>(null);

	useEffect(() => {
		if (opened && affectedCampaigns.length > 0) {
			// Reset assignments when modal opens
			setAssignments({});
			setNewPrompts({});
			fetchAvailableTypes();
		}
	}, [opened, affectedCampaigns]);

	const fetchAvailableTypes = async () => {
		setLoadingDetails(true);
		try {
			const map: Record<number, CampaignPromptTypeModel[]> = {};
			await Promise.all(
				affectedCampaigns.map(async (campaign) => {
					try {
						const types =
							await campaignPromptTypeApi().getAvailableCampaignPromptTypes(
								campaign.campaignId
							);
						map[campaign.campaignId] = types;
					} catch (err) {
						console.error(
							`Failed to fetch available types for campaign ${campaign.campaignId}`,
							err
						);
					}
				})
			);
			setAvailableTypesMap(map);
		} catch (error) {
			console.error('Error fetching available types:', error);
			notifications.show({
				title: 'Error',
				message: 'Failed to load available prompt types',
				color: 'red',
			});
		} finally {
			setLoadingDetails(false);
		}
	};

	const handleReassign = async () => {
		setProcessing(true);
		try {
			const itemsToReassign: {
				campaignId: number;
				oldCampaignPromptTypeId: number;
				newCampaignPromptTypeId: number;
				newPrompt: string;
			}[] = [];
			const itemsToDelete: number[] = [];

			affectedCampaigns.forEach((campaign) => {
				const assignment = assignments[campaign.campaignPromptId];
				if (assignment === DELETE_OPTION_VALUE) {
					itemsToDelete.push(campaign.campaignPromptId);
				} else if (assignment) {
					itemsToReassign.push({
						campaignId: campaign.campaignId,
						oldCampaignPromptTypeId: typeToDelete.id!,
						newCampaignPromptTypeId: parseInt(assignment, 10),
						newPrompt: newPrompts[campaign.campaignPromptId] || '',
					});
				}
			});

			// 1. Process reassignments (batch)
			if (itemsToReassign.length > 0) {
				await campaignPromptTypeApi().reassignCampaignPromptType({
					items: itemsToReassign,
				});
			}

			// 2. Process deletions (individual for now, or batch if available)
			if (itemsToDelete.length > 0) {
				await Promise.all(
					itemsToDelete.map((id) =>
						campaignPromptsApi().deleteCampaignPrompt(id)
					)
				);
			}

			// 3. Verify if prompt type is still in use
			const remainingUsage =
				await campaignPromptsApi().getCampaignPromptsByType(typeToDelete.id!);

			if (remainingUsage.length === 0) {
				// 4. Delete the original type
				await onDeleteType(typeToDelete.id!);
				onClose();
			} else {
				notifications.show({
					title: 'Warning',
					message:
						'Some campaigns are still using this prompt type. Please refresh and try again.',
					color: 'yellow',
				});
				// Optionally refresh the list here
				onClose(); // Or keep open? User said "delete button should appear", but we are doing "Confirm & Delete"
			}
		} catch (error) {
			console.error('Error processing reassignment:', error);
			notifications.show({
				title: 'Error',
				message: 'Failed to process changes',
				color: 'red',
			});
		} finally {
			setProcessing(false);
		}
	};

	const getOptionsForCampaign = (campaignId: number) => {
		const availableTypes = availableTypesMap[campaignId];
		if (!availableTypes) return [];

		return availableTypes
			.filter(
				(type) => type.id !== typeToDelete.id // Exclude the one being deleted (though backend should handle this)
			)
			.map((type) => ({
				value: type.id!.toString(),
				label: type.name,
			}));
	};

	const allAssigned =
		affectedCampaigns.length > 0 &&
		affectedCampaigns.every((c) => {
			const assignment = assignments[c.campaignPromptId];
			return !!assignment;
		});

	const hasEmptyPrompts = affectedCampaigns.some((c) => {
		const assignment = assignments[c.campaignPromptId];
		if (assignment && assignment !== DELETE_OPTION_VALUE) {
			return !newPrompts[c.campaignPromptId]?.trim();
		}
		return false;
	});

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap='xs'>
					<IconAlertTriangle color='orange' size={20} />
					<Text fw={600}>Prompt Type in Use</Text>
				</Group>
			}
			size='xl'
		>
			<Stack gap='md'>
				<Alert color='yellow' variant='light'>
					The prompt type <b>{typeToDelete.name}</b> is currently assigned to{' '}
					<b>{affectedCampaigns.length}</b> campaigns. Please reassign these
					prompts to a different type, or choose to delete them.
				</Alert>

				{loadingDetails ? (
					<Group justify='center' p='xl'>
						<Loader size='sm' />
						<Text size='sm'>Checking campaign constraints...</Text>
					</Group>
				) : (
					<ScrollArea.Autosize style={{ maxHeight: 400 }}>
						<Table>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Campaign</Table.Th>
									<Table.Th>Current Type</Table.Th>
									<Table.Th></Table.Th>
									<Table.Th>New Type</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{affectedCampaigns.map((campaign) => {
									const options = getOptionsForCampaign(campaign.campaignId);
									const value = assignments[campaign.campaignPromptId] || null;
									const isReassigning = value && value !== DELETE_OPTION_VALUE;

									return (
										<Table.Tr key={campaign.campaignPromptId}>
											<Table.Td>
												<Group gap='xs'>
													<Text size='sm' fw={500}>
														{campaign.campaignName}
													</Text>
													{campaign.prompt && (
														<ActionIcon
															variant='subtle'
															size='sm'
															onClick={() => setViewPrompt(campaign.prompt!)}
															title='View Prompt'
														>
															<IconEye size={14} />
														</ActionIcon>
													)}
												</Group>
											</Table.Td>
											<Table.Td>
												<Badge variant='dot' color='gray'>
													{typeToDelete.name}
												</Badge>
											</Table.Td>
											<Table.Td>
												<IconArrowRight size={16} color='gray' />
											</Table.Td>
											<Table.Td>
												<Stack gap='xs'>
													<Select
														size='xs'
														placeholder='Select action...'
														data={[
															{
																value: DELETE_OPTION_VALUE,
																label: 'Delete Prompt (Do not reassign)',
															},
															...options,
														]}
														value={value}
														onChange={(val) => {
															if (val) {
																setAssignments((prev) => ({
																	...prev,
																	[campaign.campaignPromptId]: val,
																}));
															}
														}}
														allowDeselect={false}
														w={250}
													/>
													{isReassigning && (
														<Group gap={4} align='center'>
															<Button
																size='xs'
																variant={
																	newPrompts[campaign.campaignPromptId]
																		? 'light'
																		: 'outline'
																}
																leftSection={<IconEdit size={14} />}
																onClick={() =>
																	setEditingPromptId(campaign.campaignPromptId)
																}
															>
																{newPrompts[campaign.campaignPromptId]
																	? 'Edit Prompt'
																	: 'Add Prompt'}
															</Button>
														</Group>
													)}
												</Stack>
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					</ScrollArea.Autosize>
				)}

				{hasEmptyPrompts && (
					<Alert
						color='orange'
						variant='light'
						icon={<IconAlertTriangle size={16} />}
					>
						Some reassigned prompts are empty.
					</Alert>
				)}

				<Group justify='flex-end' mt='md'>
					<Button variant='default' onClick={onClose} disabled={processing}>
						Cancel
					</Button>
					<Button
						color='red'
						onClick={handleReassign}
						loading={processing}
						disabled={loadingDetails || !allAssigned}
					>
						Confirm & Delete Type
					</Button>
				</Group>
			</Stack>

			<Modal
				opened={!!viewPrompt}
				onClose={() => setViewPrompt(null)}
				title='Prompt Content'
				size='lg'
			>
				<Textarea
					value={viewPrompt || ''}
					readOnly
					minRows={10}
					maxRows={20}
					autosize
				/>
				<Group justify='flex-end' mt='md'>
					<Button variant='default' onClick={() => setViewPrompt(null)}>
						Close
					</Button>
				</Group>
			</Modal>

			<EditReassignmentPromptModal
				opened={editingPromptId !== null}
				onClose={() => setEditingPromptId(null)}
				value={editingPromptId ? newPrompts[editingPromptId] || '' : ''}
				onChange={(val) => {
					if (editingPromptId) {
						setNewPrompts((prev) => ({
							...prev,
							[editingPromptId]: val,
						}));
					}
				}}
				targetType={
					(editingPromptId &&
						assignments[editingPromptId] &&
						availableTypesMap[
							affectedCampaigns.find(
								(c) => c.campaignPromptId === editingPromptId
							)?.campaignId || 0
						]?.find(
							(t) => t.id === parseInt(assignments[editingPromptId], 10)
						)) ||
					({} as CampaignPromptTypeModel)
				}
				currentCampaignId={
					affectedCampaigns.find((c) => c.campaignPromptId === editingPromptId)
						?.campaignId || 0
				}
				originalPrompt={
					editingPromptId
						? affectedCampaigns.find(
								(c) => c.campaignPromptId === editingPromptId
							)?.prompt
						: undefined
				}
			/>
		</Modal>
	);
};

export default ReassignPromptTypeModal;
