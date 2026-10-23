import { Button, Group } from '@mantine/core';
import { IconLock, IconLockOff, IconLockOpen } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import InlineNotice from '~/components/InlineNotice/InlineNotice';
import { useMasking } from '~/modules/qa/privacy/useMasking';
import { usePrivacyStore } from '~/stores/qa/privacyStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';

interface PrivacyBannerProps {
	callId: string;
	/** How many sensitive items the call holds. */
	count: number;
	/** Labels of the kinds found, e.g. "Card, Email". */
	kinds: string[];
	/** Only a QA manager or super admin can reveal. */
	canReveal: boolean;
	onReveal: () => void;
}

const time = (iso: string) =>
	new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Says whether the sensitive data of this call is masked, and lets an allowed role reveal or hide it. */
export function PrivacyBanner({
	callId,
	count,
	kinds,
	canReveal,
	onReveal,
}: PrivacyBannerProps) {
	const { t } = useTranslation('qa.calls');
	const { settings, revealed, session } = useMasking(callId);
	const conceal = usePrivacyStore((s) => s.conceal);

	if (!settings.enabled) {
		return (
			<InlineNotice
				color='yellow'
				icon={<IconLockOff size={18} />}
				title={t('privacy.off.title')}
				description={t('privacy.off.description')}
			/>
		);
	}

	if (revealed && session) {
		return (
			<InlineNotice
				color='red'
				icon={<IconLockOpen size={18} />}
				title={t('privacy.revealed.title')}
				description={
					<Group justify='space-between' align='center' gap='sm' wrap='wrap'>
						<span>
							{t('privacy.revealed.description', {
								by: session.by,
								time: time(session.at),
								reason: t(`privacy.reasons.${session.reason}`),
								expires: time(session.expiresAt),
							})}
						</span>
						<Button
							variant='default'
							color='red'
							size='xs'
							leftSection={<IconLock size={14} />}
							onClick={() => {
								conceal(callId);
								notifySuccess(t('privacy.revealed.hidden'));
							}}
						>
							{t('privacy.revealed.hide')}
						</Button>
					</Group>
				}
			/>
		);
	}

	if (count === 0) {
		return (
			<InlineNotice
				color='gray'
				icon={<IconLock size={18} />}
				title={t('privacy.none.title')}
				description={t('privacy.none.description')}
			/>
		);
	}

	const canRevealNow = canReveal && settings.reveal.allowed;
	return (
		<InlineNotice
			color='gray'
			icon={<IconLock size={18} />}
			title={t('privacy.masked.title')}
			description={
				<Group justify='space-between' align='center' gap='sm' wrap='wrap'>
					<span>
						{t('privacy.masked.description', {
							count,
							kinds: kinds.join(', '),
						})}
						{settings.muteAudio && ` ${t('privacy.masked.audio')}`}
						{!canRevealNow && ` ${t('privacy.masked.onlyManager')}`}
					</span>
					{canRevealNow && (
						<Button
							variant='default'
							size='xs'
							leftSection={<IconLockOpen size={14} />}
							onClick={onReveal}
						>
							{t('privacy.reveal.button', { minutes: settings.reveal.minutes })}
						</Button>
					)}
				</Group>
			}
		/>
	);
}
