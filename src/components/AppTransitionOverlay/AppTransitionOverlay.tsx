import { useEffect, useState } from 'react';
import { Loader, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useAppTransitionStore } from '~/stores/appTransitionStore';
import classes from './AppTransitionOverlay.module.css';

/** How long the splash stays fully visible before fading out. */
const HOLD_MS = 1000;
/** Fade-out duration — keep in sync with the CSS transition. */
const FADE_MS = 250;

/**
 * Screen-wide branded splash shown while switching between Campaign management
 * and Quality Assurance. Self-dismisses after a short hold so the transition
 * reads as deliberate without slowing anyone down.
 */
export default function AppTransitionOverlay() {
	const { t } = useTranslation('common');
	const target = useAppTransitionStore((state) => state.target);
	const stop = useAppTransitionStore((state) => state.stop);
	const [leaving, setLeaving] = useState(false);

	useEffect(() => {
		if (!target) {
			setLeaving(false);
			return;
		}

		const fadeTimer = window.setTimeout(() => setLeaving(true), HOLD_MS);
		const stopTimer = window.setTimeout(() => stop(), HOLD_MS + FADE_MS);

		return () => {
			window.clearTimeout(fadeTimer);
			window.clearTimeout(stopTimer);
			setLeaving(false);
		};
	}, [target, stop]);

	if (!target) return null;

	return (
		<div
			aria-live='polite'
			className={[classes.overlay, leaving ? classes.overlayLeaving : ''].join(
				' '
			)}
			role='status'
		>
			<Stack align='center' gap='md' className={classes.content}>
				<Text
					c='dimmed'
					className={classes.kicker}
					fw={700}
					size='xs'
					tt='uppercase'
				>
					{t('appSwitcher.transition.kicker')}
				</Text>
				<Loader size='lg' />
				<Text fw={600} size='lg'>
					{t(`appSwitcher.transition.${target}`)}
				</Text>
			</Stack>
		</div>
	);
}
