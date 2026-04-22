import { MantineColor, Text, BoxProps, Box } from '@mantine/core';
import { ReactNode } from 'react';
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
	return (
		<Box flex={1} className={classes.root} data-color={color} {...others}>
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
