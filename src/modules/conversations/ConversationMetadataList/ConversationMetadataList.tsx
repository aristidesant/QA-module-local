import type { ReactNode } from 'react';
import { Box, Text, Tooltip } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import styles from './ConversationMetadataList.module.css';

export interface ConversationMetadataListItem {
	key: string;
	label: string;
	value: ReactNode;
	icon?: TablerIcon;
	endSection?: ReactNode;
	rowTooltip?: ReactNode;
}

interface ConversationMetadataListProps {
	items: ConversationMetadataListItem[];
	className?: string;
	rowClassName?: string;
	reserveLabelIconSpace?: boolean;
	columns?: 1 | 2;
}

const ConversationMetadataList = ({
	items,
	className,
	rowClassName,
	reserveLabelIconSpace = false,
	columns = 1,
}: ConversationMetadataListProps) => {
	return (
		<Box
			className={className ? `${styles.list} ${className}` : styles.list}
			role='table'
			data-columns={columns}
		>
			{items.map(
				({ key, label, value, icon: Icon, endSection, rowTooltip }) => {
					const row = (
						<Box
							key={key}
							className={
								rowClassName ? `${styles.row} ${rowClassName}` : styles.row
							}
							role='row'
							tabIndex={rowTooltip ? 0 : undefined}
						>
							<Box className={styles.labelCell} role='cell'>
								{Icon ? (
									<Icon size={13} className={styles.labelIcon} />
								) : reserveLabelIconSpace ? (
									<Box className={styles.labelIconSpacer} aria-hidden='true' />
								) : null}
								<Text className={styles.labelText} title={label}>
									{label}
								</Text>
							</Box>
							<Box className={styles.valueCell} role='cell'>
								<Box className={styles.valueMain}>{value}</Box>
								{endSection && (
									<Box className={styles.endSection}>{endSection}</Box>
								)}
							</Box>
						</Box>
					);

					if (!rowTooltip) {
						return row;
					}

					return (
						<Tooltip
							key={key}
							label={rowTooltip}
							position='top-end'
							withArrow
							multiline
							w={360}
							openDelay={100}
						>
							{row}
						</Tooltip>
					);
				}
			)}
		</Box>
	);
};

export default ConversationMetadataList;
