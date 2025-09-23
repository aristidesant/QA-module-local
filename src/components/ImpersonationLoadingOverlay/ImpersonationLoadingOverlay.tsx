import { Overlay, Loader, Text, Stack } from '@mantine/core';
import { useImpersonationLoadingStore } from '~/stores/impersonationLoadingStore';
import classes from './ImpersonationLoadingOverlay.module.css';

export default function ImpersonationLoadingOverlay() {
	const { isLoading, message } = useImpersonationLoadingStore();

	if (!isLoading) return null;

	return (
		<Overlay className={classes.overlay} zIndex={9999}>
			<div className={classes.content}>
				<Stack align='center' gap='md'>
					<Loader size='lg' color='blue' />
					<Text size='lg' fw={500} c='white'>
						{message}
					</Text>
				</Stack>
			</div>
		</Overlay>
	);
}
