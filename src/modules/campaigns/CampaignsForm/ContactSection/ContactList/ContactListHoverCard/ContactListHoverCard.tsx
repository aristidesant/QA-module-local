import { Badge, HoverCard, Stack, Text, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconInfoCircle } from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';

interface ContactListHoverCardProps {
	contactGroup: ContactGroup;
}

export const ContactListHoverCard = ({
	contactGroup,
}: ContactListHoverCardProps) => {
	const { t } = useTranslation();
	return (
		<HoverCard shadow='md' radius='md' withArrow>
			<HoverCard.Target>
				<ThemeIcon variant='transparent' style={{ cursor: 'pointer' }}>
					<IconInfoCircle size={16} />
				</ThemeIcon>
			</HoverCard.Target>
			<HoverCard.Dropdown>
				<Stack gap='xs'>
					<div>
						<Text size='sm' fw={500}>
							{contactGroup.name}
						</Text>
						{contactGroup.description && (
							<Text size='xs' c='dimmed' mt={4}>
								{contactGroup.description}
							</Text>
						)}
					</div>
					<Text size='xs'>
						<strong>{t('campaigns.form.contacts.list.columns.total')}:</strong>{' '}
						{contactGroup.contactCount}
					</Text>
					<Text size='xs'>
						<strong>{t('campaigns.form.contacts.list.columns.status')}:</strong>{' '}
						{contactGroup.queueStatus}
					</Text>
					<Text size='xs'>
						<strong>{t('campaigns.form.contacts.details.stats.waves')}:</strong>{' '}
						{contactGroup.maxWaves
							? `${contactGroup.currentWave ?? 1} / ${contactGroup.maxWaves}`
							: t('campaigns.form.contacts.details.stats.notSet')}
					</Text>
					<Text size='xs'>
						<strong>
							{t('campaigns.form.contacts.details.stats.maxCallsPerContact')}:
						</strong>{' '}
						{contactGroup.maxCallsPerContact}
					</Text>
					<Text size='xs'>
						<strong>
							{t('campaigns.form.contacts.details.stats.maxCallsPerList')}:
						</strong>{' '}
						{contactGroup.maxCallsPerList}
					</Text>
					<Badge size='sm' variant='light'>
						{contactGroup.isActive
							? t('campaigns.form.contacts.details.meta.active')
							: t('campaigns.form.contacts.details.meta.inactive')}
					</Badge>
				</Stack>
			</HoverCard.Dropdown>
		</HoverCard>
	);
};

export default ContactListHoverCard;
