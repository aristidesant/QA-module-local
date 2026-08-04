import { Modal, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import {
	IconChecklist,
	IconInbox,
	IconLayoutDashboard,
	IconTargetArrow,
	IconSchool,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AppKey } from '~/hooks/useCurrentApp';
import classes from './AppChooserModal.module.css';

interface AppChooserModalProps {
	opened: boolean;
	/** Dismiss (cancel / outside / escape). */
	onClose: () => void;
	onChoose: (app: AppKey) => void;
	/** Apps to offer as cards; only these render, in this order. */
	apps: AppKey[];
}

const APP_ICONS: Record<AppKey, typeof IconChecklist> = {
	ucxm: IconLayoutDashboard,
	qa: IconChecklist,
	backoffice: IconInbox,
	coaching: IconTargetArrow,
	lms: IconSchool,
};

export default function AppChooserModal({
	opened,
	onClose,
	onChoose,
	apps,
}: AppChooserModalProps) {
	const { t } = useTranslation('common');

	const cards = apps.map((app) => ({ app, icon: APP_ICONS[app] }));

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			size='lg'
			padding='lg'
			radius='md'
			overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
			withCloseButton={false}
			classNames={{ content: classes.content, body: classes.body }}
		>
			<Stack gap='lg'>
				<Stack gap={4} align='center'>
					<Title order={4} className={classes.title}>
						{t('appSwitcher.chooser.title')}
					</Title>
					<Text size='sm' c='dimmed' ta='center'>
						{t('appSwitcher.chooser.subtitle')}
					</Text>
				</Stack>

				<div className={classes.grid}>
					{cards.map(({ app, icon: Icon }) => (
						<UnstyledButton
							key={app}
							className={classes.card}
							onClick={() => onChoose(app)}
							aria-label={t(`appSwitcher.chooser.${app}.label`)}
						>
							<span className={classes.cardIcon}>
								<Icon size={26} />
							</span>
							<Text fw={700} size='md'>
								{t(`appSwitcher.chooser.${app}.label`)}
							</Text>
							<Text size='xs' c='dimmed' ta='center'>
								{t(`appSwitcher.chooser.${app}.description`)}
							</Text>
						</UnstyledButton>
					))}
				</div>
			</Stack>
		</Modal>
	);
}
