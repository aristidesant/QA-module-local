import { MantineColor, Text, BoxProps, Box } from '@mantine/core';
import { CSSProperties, ReactNode, useMemo } from 'react';
import classes from './InlineNotice.module.css';

interface InlineNoticeProps extends BoxProps {
	title: string;
	description: ReactNode;
	icon: ReactNode;
	color?: MantineColor;
}

const InlineNotice = ({
	title,
	description,
	icon,
	color = 'blue',
	...others
}: InlineNoticeProps) => {
	const colorVariables = useMemo(
		() =>
			({
				'--notice-frame': `var(--mantine-color-${color}-2)`,
				'--notice-icon': `var(--mantine-color-${color}-7)`,
				'--notice-title': `var(--mantine-color-${color}-9)`,
				'--notice-description': `var(--mantine-color-${color}-8)`,
				'--notice-surface': `var(--mantine-color-${color}-0)`,
			}) as CSSProperties,
		[color]
	);

	return (
		<Box
			flex={1}
			className={classes.root}
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				...colorVariables,
			}}
			{...others}
		>
			<div className={classes.iconWrapper}>{icon}</div>
			<div className={classes.contentText}>
				<Text size='sm' fw={600} className={classes.title}>
					{title}
				</Text>
				<Text component='span' size='sm' className={classes.description}>
					{description}
				</Text>
			</div>
		</Box>
	);
};

export default InlineNotice;
