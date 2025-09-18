import React, { useState } from 'react';
import {
	Modal,
	Stack,
	Group,
	Text,
	Paper,
	ScrollArea,
	ActionIcon,
	Tabs,
	Badge,
	Center,
	Loader,
} from '@mantine/core';
import { IconCopy, IconHistory, IconEye } from '@tabler/icons-react';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { usePromptHistoryStore } from '../usePromptHistoryStore';
import { StatusBadge } from '../StatusBadge';
import { useGetPromptVersionsByPromptId } from '~/queries/promptVersionQueries';
import type { PromptVersion } from '~/models/PromptVersionModel';
import BaseTable from '~/components/BaseTable';
import type { ColumnDef } from '@tanstack/react-table';
import styles from './ViewPromptModal.module.css';

export const ViewPromptModal: React.FC = () => {
	const { viewModalOpened, selectedPrompt, closeViewModal } =
		usePromptHistoryStore();
	const clipboard = useClipboard({ timeout: 2000 });
	const [activeTab, setActiveTab] = useState<string | null>('content');

	// Fetch versions for the selected prompt
	const {
		data: versions,
		isLoading: versionsLoading,
		isError: versionsError,
	} = useGetPromptVersionsByPromptId(selectedPrompt?.id || 0);

	const handleCopyPrompt = () => {
		if (selectedPrompt?.generatedPrompt) {
			clipboard.copy(selectedPrompt.generatedPrompt);
			notifications.show({
				title: 'Copied!',
				message: 'Prompt copied to clipboard',
				color: 'green',
			});
		}
	};

	const handleCopyVersion = (content: string) => {
		clipboard.copy(content);
		notifications.show({
			title: 'Copied!',
			message: 'Version content copied to clipboard',
			color: 'green',
		});
	};

	const handleViewVersion = (_version: PromptVersion) => {
		// Switch to content tab to show the version
		setActiveTab('content');
		// Note: In a real implementation, you might want to update the selectedPrompt
		// with the version data to show the specific version content
	};

	// Check if there are multiple versions to show the versions tab
	const hasMultipleVersions = versions && versions.length > 1;

	const versionColumns: ColumnDef<PromptVersion>[] = [
		{
			accessorKey: 'version',
			header: 'Version',
			cell: ({ row }) => (
				<Group gap='xs'>
					<IconHistory size={16} />
					<Text fw={500} size='sm'>
						v{row.original.version}
					</Text>
				</Group>
			),
		},
		{
			accessorKey: 'fullFields.status',
			header: 'Status',
			cell: ({ row }) => (
				<Badge
					size='sm'
					variant='light'
					color={row.original.fullFields.status === 'ACTIVE' ? 'green' : 'gray'}
				>
					{row.original.fullFields.status}
				</Badge>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Created',
			cell: ({ row }) => (
				<Text size='xs' c='dimmed'>
					{new Date(row.original.createdAt).toLocaleString()}
				</Text>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<Group gap='xs' justify='flex-end'>
					<ActionIcon
						variant='subtle'
						color='blue'
						size='sm'
						onClick={() => handleViewVersion(row.original)}
					>
						<IconEye size={16} />
					</ActionIcon>
					<ActionIcon
						variant='subtle'
						color='green'
						size='sm'
						onClick={() => handleCopyVersion(row.original.generatedPrompt)}
						disabled={!row.original.generatedPrompt}
					>
						<IconCopy size={16} />
					</ActionIcon>
				</Group>
			),
		},
	];

	if (!selectedPrompt) return null;

	return (
		<Modal
			opened={viewModalOpened}
			onClose={closeViewModal}
			title={selectedPrompt.name}
			size={hasMultipleVersions ? 'xl' : 'lg'}
		>
			{hasMultipleVersions ? (
				<Tabs value={activeTab} onChange={setActiveTab}>
					<Tabs.List>
						<Tabs.Tab value='content'>Prompt Content</Tabs.Tab>
						<Tabs.Tab value='versions' leftSection={<IconHistory size={16} />}>
							Versions ({versions?.length || 0})
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='content' pt='md'>
						<Stack gap='md'>
							<Group justify='space-between'>
								<StatusBadge status={selectedPrompt.status} />
								<Text size='xs' c='dimmed'>
									Created: {new Date(selectedPrompt.createdAt).toLocaleString()}
								</Text>
							</Group>

							<Paper p='md' withBorder>
								<Text size='sm' fw={500} mb='xs'>
									Generation Input:
								</Text>
								<ScrollArea h={150}>
									{!selectedPrompt.generationInput ||
									Object.keys(selectedPrompt.generationInput).length === 0 ? (
										<Text
											size='sm'
											c='dimmed'
											ta='center'
											py='md'
											className={styles.emptyMessage}
										>
											No generation input data available
										</Text>
									) : (
										<Stack gap='xs'>
											{Object.entries(selectedPrompt.generationInput).map(
												([key, value]) => (
													<Group key={key} align='flex-start'>
														<Text
															size='xs'
															fw={500}
															c='dimmed'
															style={{ minWidth: 120 }}
														>
															{key.replace(/_/g, ' ').toUpperCase()}:
														</Text>
														<Text size='xs'>{value}</Text>
													</Group>
												)
											)}
										</Stack>
									)}
								</ScrollArea>
							</Paper>

							<Paper p='md' withBorder>
								<Group justify='space-between' mb='xs'>
									<Text size='sm' fw={500}>
										Generated Prompt:
									</Text>
									<ActionIcon
										variant='subtle'
										color='blue'
										onClick={handleCopyPrompt}
										disabled={!selectedPrompt.generatedPrompt}
									>
										<IconCopy size={16} />
									</ActionIcon>
								</Group>
								<ScrollArea h={200}>
									<Text size='sm' style={{ whiteSpace: 'pre-wrap' }}>
										{selectedPrompt.generatedPrompt ? (
											selectedPrompt.generatedPrompt
										) : (
											<Text
												c='dimmed'
												ta='center'
												py='md'
												className={styles.emptyMessage}
											>
												No generated prompt content available
											</Text>
										)}
									</Text>
								</ScrollArea>
							</Paper>
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value='versions' pt='md'>
						{versionsLoading && (
							<Center h={200}>
								<Loader size='lg' />
							</Center>
						)}

						{versionsError && (
							<Paper p='md' withBorder>
								<Text c='red' ta='center'>
									Failed to load versions. Please try again.
								</Text>
							</Paper>
						)}

						{!versionsLoading && !versionsError && versions && (
							<Paper withBorder>
								<BaseTable<PromptVersion>
									data={versions}
									columns={versionColumns}
									density='compact'
								/>
							</Paper>
						)}
					</Tabs.Panel>
				</Tabs>
			) : (
				// Single version view (original layout)
				<Stack gap='md'>
					<Group justify='space-between'>
						<StatusBadge status={selectedPrompt.status} />
						<Text size='xs' c='dimmed'>
							Created: {new Date(selectedPrompt.createdAt).toLocaleString()}
						</Text>
					</Group>

					<Paper p='md' withBorder>
						<Text size='sm' fw={500} mb='xs'>
							Generation Input:
						</Text>
						<ScrollArea h={150}>
							{!selectedPrompt.generationInput ||
							Object.keys(selectedPrompt.generationInput).length === 0 ? (
								<Text
									size='sm'
									c='dimmed'
									ta='center'
									py='md'
									className={styles.emptyMessage}
								>
									No generation input data available
								</Text>
							) : (
								<Stack gap='xs'>
									{Object.entries(selectedPrompt.generationInput).map(
										([key, value]) => (
											<Group key={key} align='flex-start'>
												<Text
													size='xs'
													fw={500}
													c='dimmed'
													style={{ minWidth: 120 }}
												>
													{key.replace(/_/g, ' ').toUpperCase()}:
												</Text>
												<Text size='xs'>{value}</Text>
											</Group>
										)
									)}
								</Stack>
							)}
						</ScrollArea>
					</Paper>

					<Paper p='md' withBorder>
						<Group justify='space-between' mb='xs'>
							<Text size='sm' fw={500}>
								Generated Prompt:
							</Text>
							<ActionIcon
								variant='subtle'
								color='blue'
								onClick={handleCopyPrompt}
								disabled={!selectedPrompt.generatedPrompt}
							>
								<IconCopy size={16} />
							</ActionIcon>
						</Group>
						<ScrollArea h={200}>
							<Text size='sm' style={{ whiteSpace: 'pre-wrap' }}>
								{selectedPrompt.generatedPrompt ? (
									selectedPrompt.generatedPrompt
								) : (
									<Text
										c='dimmed'
										ta='center'
										py='md'
										className={styles.emptyMessage}
									>
										No generated prompt content available
									</Text>
								)}
							</Text>
						</ScrollArea>
					</Paper>
				</Stack>
			)}
		</Modal>
	);
};
