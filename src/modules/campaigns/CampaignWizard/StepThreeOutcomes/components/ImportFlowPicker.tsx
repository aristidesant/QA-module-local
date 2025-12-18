import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Center,
	Group,
	Loader,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconCopy,
	IconEye,
	IconNetwork,
	IconRefresh,
	IconSearch,
} from '@tabler/icons-react';
import type { CampaignWithDispositionFlow } from '~/api/dispositionFlowApi';
import styles from '../StepThreeOutcomes.module.css';

interface ImportFlowPickerProps {
	campaignsWithFlows?: CampaignWithDispositionFlow[];
	isLoading: boolean;
	isFetching: boolean;
	searchQuery: string;
	onSearchQueryChange: (value: string) => void;
	onRefresh: () => void;
	copyingFlowId: number | null;
	onPreview: (flowId: number, campaignName: string) => void;
	onUseFlow: (flowId: number, campaignName: string) => void;
}

export function ImportFlowPicker({
	campaignsWithFlows,
	isLoading,
	isFetching,
	searchQuery,
	onSearchQueryChange,
	onRefresh,
	copyingFlowId,
	onPreview,
	onUseFlow,
}: ImportFlowPickerProps) {
	const filteredCampaigns = campaignsWithFlows
		?.filter((campaign) => campaign.flowId !== null)
		.filter((campaign) =>
			campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
		);

	return (
		<Stack gap='md'>
			<Group gap='xs'>
				<TextInput
					placeholder='Search campaigns...'
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => onSearchQueryChange(e.target.value)}
					classNames={{ input: styles.searchInput }}
					style={{ flex: 1 }}
				/>
				<Button
					variant='light'
					color='cyan'
					size='sm'
					loading={isFetching}
					onClick={onRefresh}
					leftSection={<IconRefresh size={16} />}
				>
					Refresh
				</Button>
			</Group>

			{isLoading ? (
				<Center py='xl'>
					<Loader size='md' />
				</Center>
			) : filteredCampaigns && filteredCampaigns.length > 0 ? (
				<ScrollArea.Autosize mah={300}>
					<Stack gap='xs'>
						{filteredCampaigns.map((campaign, index) => (
							<Card
								key={`${campaign.id}-${index}`}
								className={styles.campaignCard}
								padding='sm'
							>
								<Group justify='space-between' wrap='nowrap'>
									<Stack gap={2} style={{ flex: 1 }}>
										<Text size='sm' fw={500} lineClamp={1}>
											{campaign.name}
										</Text>
										<Group gap='xs'>
											{(campaign.flowId || campaign.dispositionFlow) && (
												<Badge size='xs' variant='light' color='blue'>
													Outcome Flow
												</Badge>
											)}
											{campaign.dispositionCatalog?.type && (
												<Badge size='xs' variant='outline' color='gray'>
													{campaign.dispositionCatalog.type}
												</Badge>
											)}
										</Group>
									</Stack>
									<Group gap='xs'>
										<Tooltip label='Preview flow'>
											<ActionIcon
												size='sm'
												variant='subtle'
												color='gray'
												aria-label='Preview flow'
												onClick={() => {
													const flowId =
														campaign.flowId ?? campaign.dispositionFlow?.id;
													if (flowId) {
														onPreview(flowId, campaign.name);
													}
												}}
											>
												<IconEye size={16} />
											</ActionIcon>
										</Tooltip>
										<Button
											size='xs'
											variant='light'
											leftSection={<IconCopy size={14} />}
											loading={
												copyingFlowId ===
												(campaign.flowId ?? campaign.dispositionFlow?.id)
											}
											disabled={
												copyingFlowId !== null &&
												copyingFlowId !==
													(campaign.flowId ?? campaign.dispositionFlow?.id)
											}
											onClick={() => {
												if (copyingFlowId !== null) return;
												const flowId =
													campaign.flowId ?? campaign.dispositionFlow?.id;
												if (flowId) {
													onUseFlow(flowId, campaign.name);
												}
											}}
										>
											Use flow
										</Button>
									</Group>
								</Group>
							</Card>
						))}
					</Stack>
				</ScrollArea.Autosize>
			) : (
				<Center py='xl'>
					<Stack align='center' gap='xs'>
						<ThemeIcon variant='light' color='gray' size='lg'>
							<IconNetwork size={20} />
						</ThemeIcon>
						<Text size='sm' c='dimmed' ta='center'>
							{searchQuery
								? 'No campaigns match your search'
								: 'No campaigns with outcome flows available'}
						</Text>
					</Stack>
				</Center>
			)}
		</Stack>
	);
}
