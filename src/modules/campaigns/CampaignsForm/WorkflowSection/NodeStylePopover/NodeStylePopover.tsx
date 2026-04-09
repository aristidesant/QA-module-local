import { useCallback, useMemo } from 'react';
import {
	ActionIcon,
	ColorSwatch,
	Group,
	Popover,
	SimpleGrid,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPalette, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { NodeStyle } from '~/models/CampaignsModel';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { useWorkflowNodeIcons } from '~/queries/workflowNodeIconsQuery';
import {
	NODE_COLOR_PALETTE,
	WORKFLOW_ICON_REGISTRY,
} from '../utils/workflowIconRegistry';
import styles from './NodeStylePopover.module.css';

interface NodeStylePopoverProps {
	nodeId: string;
	nodeLabel: string;
}

const NodeStylePopover = ({ nodeId, nodeLabel }: NodeStylePopoverProps) => {
	const [opened, { toggle, close }] = useDisclosure(false);
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const form = useCampaignFormContext();
	const { data: allowedIconKeys = [] } = useWorkflowNodeIcons();

	const currentStyles: NodeStyle | undefined = form.values.nodeStyles?.[nodeId];

	const handleColorSelect = useCallback(
		(color: string) => {
			const prev = form.values.nodeStyles ?? {};
			const nodeStyle: NodeStyle = {
				...(prev[nodeId] ?? { backgroundColor: color }),
				nodeLabel,
				backgroundColor: color,
			};
			form.setFieldValue('nodeStyles', { ...prev, [nodeId]: nodeStyle });
		},
		[form, nodeId, nodeLabel]
	);

	const handleIconSelect = useCallback(
		(iconKey: string) => {
			const prev = form.values.nodeStyles ?? {};
			const existing = prev[nodeId];
			// Only write iconName (+ preserve existing backgroundColor if already set).
			// Do NOT force a default backgroundColor — if the user hasn't picked a
			// color yet the node should keep its automatic label-based tone.
			const nodeStyle: NodeStyle = existing?.backgroundColor
				? { ...existing, nodeLabel, iconName: iconKey }
				: { ...existing, nodeLabel, iconName: iconKey, backgroundColor: '' };
			// Strip the empty backgroundColor so getWorkflowNodeToneStyle falls back
			// to label-based coloring
			if (!nodeStyle.backgroundColor) {
				const { backgroundColor: _bg, ...rest } = nodeStyle;
				form.setFieldValue('nodeStyles', {
					...prev,
					[nodeId]: rest as NodeStyle,
				});
				return;
			}
			form.setFieldValue('nodeStyles', { ...prev, [nodeId]: nodeStyle });
		},
		[form, nodeId, nodeLabel]
	);

	const handleReset = useCallback(() => {
		const prev = form.values.nodeStyles ?? {};
		const next = { ...prev };
		delete next[nodeId];
		form.setFieldValue('nodeStyles', next);
		close();
	}, [form, nodeId, close]);

	const iconItems = useMemo(
		() =>
			allowedIconKeys
				.filter((key) => key in WORKFLOW_ICON_REGISTRY)
				.map((key) => ({
					key,
					Icon: WORKFLOW_ICON_REGISTRY[key],
				})),
		[allowedIconKeys]
	);

	return (
		<Popover
			opened={opened}
			onChange={(o) => !o && close()}
			position='bottom'
			withinPortal
			shadow='md'
			radius='md'
			width={280}
		>
			<Popover.Target>
				<Tooltip label={t('form.workflow.nodeStyle.customize')} withArrow>
					<ActionIcon
						size='sm'
						variant='light'
						color='gray'
						radius='sm'
						onClick={(e) => {
							e.stopPropagation();
							toggle();
						}}
						className={styles.triggerButton}
					>
						<IconPalette size={13} />
					</ActionIcon>
				</Tooltip>
			</Popover.Target>

			<Popover.Dropdown
				className={styles.dropdown}
				onClick={(e) => e.stopPropagation()}
			>
				<Stack gap='sm'>
					{/* ---- Color section ---- */}
					<div>
						<Group justify='space-between' mb={4}>
							<Text size='xs' fw={600} c='dimmed'>
								{t('form.workflow.nodeStyle.colorLabel')}
							</Text>
							{currentStyles && (
								<Tooltip label={t('form.workflow.nodeStyle.reset')} withArrow>
									<ActionIcon
										size='xs'
										variant='subtle'
										color='gray'
										onClick={handleReset}
									>
										<IconRefresh size={12} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
						<SimpleGrid cols={8} spacing={6}>
							{NODE_COLOR_PALETTE.map((color: string) => (
								<UnstyledButton
									key={color}
									onClick={() => handleColorSelect(color)}
									className={styles.swatchButton}
								>
									<ColorSwatch
										color={color}
										size={24}
										className={
											currentStyles?.backgroundColor === color
												? styles.swatchSelected
												: styles.swatch
										}
									/>
								</UnstyledButton>
							))}
						</SimpleGrid>
					</div>

					{/* ---- Icon section ---- */}
					{iconItems.length > 0 && (
						<div>
							<Text size='xs' fw={600} c='dimmed' mb={4}>
								{t('form.workflow.nodeStyle.iconLabel')}
							</Text>
							<SimpleGrid cols={8} spacing={6}>
								{iconItems.map(({ key, Icon }) => {
									const isSelected = currentStyles?.iconName === key;
									const ResolvedIcon = Icon;
									return (
										<Tooltip key={key} label={key.replace(/_/g, ' ')} withArrow>
											<UnstyledButton
												onClick={() => handleIconSelect(key)}
												className={`${styles.iconButton} ${isSelected ? styles.iconButtonSelected : ''}`}
											>
												<ResolvedIcon size={16} />
											</UnstyledButton>
										</Tooltip>
									);
								})}
							</SimpleGrid>
						</div>
					)}
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
};

export default NodeStylePopover;
