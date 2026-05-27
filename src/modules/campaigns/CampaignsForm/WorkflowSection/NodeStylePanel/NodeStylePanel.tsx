import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
	ActionIcon,
	ColorSwatch,
	Group,
	Portal,
	SimpleGrid,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { NodeStyle } from '~/models/CampaignsModel';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { useWorkflowNodeIcons } from '~/queries/workflowNodeIconsQuery';
import {
	NODE_COLOR_PALETTE,
	WORKFLOW_ICON_REGISTRY,
} from '../utils/workflowIconRegistry';
import styles from './NodeStylePanel.module.css';

interface NodeStylePanelProps {
	nodeId: string;
	nodeLabel: string;
	x: number;
	y: number;
	onClose: () => void;
}

const NodeStylePanel = ({
	nodeId,
	nodeLabel,
	x,
	y,
	onClose,
}: NodeStylePanelProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const panelRef = useRef<HTMLDivElement>(null);
	const form = useCampaignFormContext();

	useEffect(() => {
		let active = false;
		const timer = setTimeout(() => {
			active = true;
		}, 0);

		const handler = (e: PointerEvent) => {
			if (!active) return;
			if (
				panelRef.current &&
				!panelRef.current.contains(e.target as globalThis.Node)
			) {
				onClose();
			}
		};

		document.addEventListener('pointerdown', handler, true);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('pointerdown', handler, true);
		};
	}, [onClose]);
	const { data: allowedIconKeys = [] } = useWorkflowNodeIcons();

	const currentStyles: NodeStyle | undefined = form.values.nodeStyles?.[nodeId];

	// Clamp to viewport
	const PANEL_W = 280;
	const PANEL_H = 200;
	const left =
		x + PANEL_W > window.innerWidth ? window.innerWidth - PANEL_W - 8 : x;
	const top =
		y + PANEL_H > window.innerHeight ? window.innerHeight - PANEL_H - 8 : y;

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
			const nodeStyle: NodeStyle = existing?.backgroundColor
				? { ...existing, nodeLabel, iconName: iconKey }
				: { ...existing, nodeLabel, iconName: iconKey, backgroundColor: '' };
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
		onClose();
	}, [form, nodeId, onClose]);

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
		<Portal>
			<div
				ref={panelRef}
				className={styles.panel}
				// inline-style-allow: portal positioned at runtime coordinates clamped to viewport; cannot use CSS alone
				style={{ left, top }}
				onContextMenu={(e) => e.preventDefault()}
			>
				<Stack gap='sm'>
					{/* Color section */}
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

					{/* Icon section */}
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
			</div>
		</Portal>
	);
};

export default NodeStylePanel;
