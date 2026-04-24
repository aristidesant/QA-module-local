import type { FC } from 'react';
import { ColorSwatch, Group, ScrollArea, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconSquaresDiagonal } from '@tabler/icons-react';
import type { NodeGroups, NodeStyles } from '~/models/CampaignsModel';
import { resolveWorkflowIcon } from '../utils/workflowIconRegistry';
import styles from './WorkflowNodeLegend.module.css';

interface WorkflowNodeLegendProps {
	nodeStyles?: NodeStyles;
	nodeGroups?: NodeGroups;
}

const MAX_LABEL_LENGTH = 22;

const truncate = (text: string, max: number) =>
	text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

const WorkflowNodeLegend: FC<WorkflowNodeLegendProps> = ({
	nodeStyles,
	nodeGroups,
}) => {
	const { t } = useTranslation('campaign.form.workflow');

	const entries = Object.entries(nodeStyles ?? {}).filter(
		([, style]) => style?.backgroundColor || style?.iconName
	);

	const groupEntries = Object.entries(nodeGroups ?? {}).filter(
		([, group]) => group?.color || group?.label
	);

	if (entries.length === 0 && groupEntries.length === 0) return null;

	return (
		<div className={styles.root}>
			<Text size='xs' c='dimmed' fw={500} className={styles.legendLabel}>
				{t('form.workflow.nodeStyle.legend', {
					defaultValue: 'Customized nodes',
				})}
			</Text>
			<ScrollArea scrollbarSize={4} type='hover' className={styles.scrollArea}>
				<Group gap={6} wrap='nowrap' className={styles.chipRow}>
					{groupEntries.map(([groupId, group]) => {
						const groupLabel = group.label
							? truncate(group.label, MAX_LABEL_LENGTH)
							: t('form.workflow.group.defaultLabel');

						return (
							<div key={groupId} className={styles.chip}>
								{group.color ? (
									<ColorSwatch
										color={group.color}
										size={14}
										className={styles.swatch}
										withShadow={false}
									/>
								) : (
									<IconSquaresDiagonal size={13} className={styles.icon} />
								)}
								<Text size='xs' className={styles.chipLabel} truncate>
									{groupLabel}
								</Text>
							</div>
						);
					})}
					{entries.map(([nodeId, style]) => {
						const ResolvedIcon = style.iconName
							? resolveWorkflowIcon(style.iconName)
							: null;
						const label = style.nodeLabel
							? truncate(style.nodeLabel, MAX_LABEL_LENGTH)
							: nodeId.slice(0, MAX_LABEL_LENGTH);

						return (
							<div key={nodeId} className={styles.chip}>
								{style.backgroundColor ? (
									<ColorSwatch
										color={style.backgroundColor}
										size={14}
										className={styles.swatch}
										withShadow={false}
									/>
								) : null}
								{ResolvedIcon ? (
									<ResolvedIcon size={13} className={styles.icon} />
								) : null}
								<Text size='xs' className={styles.chipLabel} truncate>
									{label}
								</Text>
							</div>
						);
					})}
				</Group>
			</ScrollArea>
		</div>
	);
};

export default WorkflowNodeLegend;
