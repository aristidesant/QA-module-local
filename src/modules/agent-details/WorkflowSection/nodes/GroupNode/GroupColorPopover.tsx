import {
	cloneElement,
	isValidElement,
	useCallback,
	type ReactElement,
} from 'react';
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
import { useReactFlow } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { NODE_COLOR_PALETTE } from '../../utils/workflowIconRegistry';
import styles from './GroupColorPopover.module.css';

interface GroupColorPopoverProps {
	nodeId: string;
	currentColor?: string;
	trigger?: ReactElement;
}

/**
 * Color-only popover for group nodes.
 * Group colors are stored in `node.data.color` (persisted into `nodeGroups`)
 * rather than in the shared `nodeStyles` map used by regular workflow nodes.
 */
const GroupColorPopover = ({
	nodeId,
	currentColor,
	trigger,
}: GroupColorPopoverProps) => {
	const [opened, { toggle, close }] = useDisclosure(false);
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const { setNodes } = useReactFlow();

	const handleColorSelect = useCallback(
		(color: string) => {
			setNodes((nodes) =>
				nodes.map((n) =>
					n.id === nodeId ? { ...n, data: { ...n.data, color } } : n
				)
			);
		},
		[nodeId, setNodes]
	);

	const handleReset = useCallback(() => {
		setNodes((nodes) =>
			nodes.map((n) =>
				n.id === nodeId ? { ...n, data: { ...n.data, color: '' } } : n
			)
		);
		close();
	}, [nodeId, setNodes, close]);

	return (
		<Popover
			opened={opened}
			onChange={(o) => !o && close()}
			position='bottom'
			withinPortal
			shadow='md'
			radius='md'
			width={240}
		>
			<Popover.Target>
				{trigger && isValidElement(trigger) ? (
					cloneElement(trigger as ReactElement<any>, {
						onClick: (e: React.MouseEvent) => {
							e.stopPropagation();
							toggle();
							const originalOnClick = (
								trigger as ReactElement<{
									onClick?: (event: React.MouseEvent) => void;
								}>
							).props.onClick;
							originalOnClick?.(e);
						},
					})
				) : (
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
				)}
			</Popover.Target>

			<Popover.Dropdown
				className={styles.dropdown}
				onClick={(e) => e.stopPropagation()}
			>
				<Stack gap='sm'>
					<div>
						<Group justify='space-between' mb={4}>
							<Text size='xs' fw={600} c='dimmed'>
								{t('form.workflow.nodeStyle.colorLabel')}
							</Text>
							{currentColor && (
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
											currentColor === color
												? styles.swatchSelected
												: styles.swatch
										}
									/>
								</UnstyledButton>
							))}
						</SimpleGrid>
					</div>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
};

export default GroupColorPopover;
