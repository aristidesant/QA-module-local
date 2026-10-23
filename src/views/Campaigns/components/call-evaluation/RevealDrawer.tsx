import { useEffect } from 'react';
import { Button, Group, Select, Stack, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLockOpen } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { REVEAL_REASONS } from '~/modules/qa/privacy/constants';
import type { RevealReason } from '~/modules/qa/privacy/types';
import { useMasking } from '~/modules/qa/privacy/useMasking';
import { usePrivacyStore } from '~/stores/qa/privacyStore';
import { useRoleMockStore } from '~/stores/roleMockStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';

const MIN_NOTE = 10;

interface RevealDrawerProps {
	opened: boolean;
	onClose: () => void;
	callId: string;
}

interface FormValues {
	reason: RevealReason | null;
	note: string;
}

/** Asks for a reason before the real values of a call are shown for a few minutes; the reveal is logged. */
export function RevealDrawer({ opened, onClose, callId }: RevealDrawerProps) {
	const { t } = useTranslation('qa.calls');
	const { settings } = useMasking();
	const previewRole = useRoleMockStore((s) => s.previewRole);
	const reveal = usePrivacyStore((s) => s.reveal);
	const { minutes, requireNote } = settings.reveal;
	const by =
		previewRole === 'superAdmin'
			? 'Admin (Super Admin)'
			: 'Laura Méndez (QA Manager)';

	const form = useForm<FormValues>({
		initialValues: { reason: null, note: '' },
		validate: {
			reason: (v) => (v ? null : t('privacy.reveal.reason')),
			note: (v, values) =>
				(requireNote || values.reason === 'other') && v.trim().length < MIN_NOTE
					? t('privacy.reveal.notePlaceholder')
					: null,
		},
	});

	useEffect(() => {
		if (opened) form.setValues({ reason: null, note: '' });
		form.clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened]);

	const submit = form.onSubmit((values) => {
		if (!values.reason) return;
		reveal({
			callId,
			by,
			reason: values.reason,
			note: values.note.trim(),
			minutes,
		});
		notifySuccess(t('privacy.reveal.success', { minutes }));
		onClose();
	});

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='md'
			icon={<IconLockOpen size={20} />}
			iconColor='red'
			title={t('privacy.reveal.title')}
			description={t('privacy.reveal.description', { minutes })}
		>
			<form onSubmit={submit}>
				<Stack gap='lg'>
					<Select
						label={t('privacy.reveal.reason')}
						data={REVEAL_REASONS.map((r) => ({
							value: r,
							label: t(`privacy.reasons.${r}`),
						}))}
						allowDeselect={false}
						required
						{...form.getInputProps('reason')}
					/>
					<Textarea
						label={t('privacy.reveal.note')}
						placeholder={t('privacy.reveal.notePlaceholder')}
						autosize
						minRows={3}
						required={requireNote || form.values.reason === 'other'}
						{...form.getInputProps('note')}
					/>
					<Text size='xs' c='dimmed'>
						{t('privacy.reveal.logged', { minutes, by })}
					</Text>
					<Group justify='flex-end'>
						<Button variant='default' onClick={onClose}>
							{t('privacy.reveal.cancel')}
						</Button>
						<Button
							type='submit'
							color='red'
							leftSection={<IconLockOpen size={14} />}
						>
							{t('privacy.reveal.confirm')}
						</Button>
					</Group>
				</Stack>
			</form>
		</AppDrawer>
	);
}
