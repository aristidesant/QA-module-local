import { Loader, Text } from '@mantine/core';
import classes from './SuspenseFallback.module.css';

export type SuspenseFallbackProps = {
	message: string;
	description?: string;
};

const SuspenseFallback: React.FunctionComponent<SuspenseFallbackProps> = ({
	message,
	description,
}) => {
	return (
		<div className={classes.wrapper} role='status' aria-live='polite'>
			<Loader color='var(--mantine-color-blue-6)' size='lg' />
			<div className={classes.status}>
				<Text className={classes.message}>{message}</Text>
				{description ? (
					<Text className={classes.subtext}>{description}</Text>
				) : null}
			</div>
		</div>
	);
};

export default SuspenseFallback;
