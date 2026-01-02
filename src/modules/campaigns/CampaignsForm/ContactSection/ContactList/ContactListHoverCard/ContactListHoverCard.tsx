import {
	Badge,
	Divider,
	Group,
	HoverCard,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconInfoCircle } from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import { getQueueStatusConfig } from '../queueStatusConfig';
import classes from './ContactListHoverCard.module.css';

interface ContactListHoverCardProps {
	contactGroup: ContactGroup;
}

export const ContactListHoverCard = ({
	contactGroup,
}: ContactListHoverCardProps) => {
	const { t } = useTranslation('campaigns');
	const statusConfig = getQueueStatusConfig(contactGroup.queueStatus);

	return (
		<HoverCard shadow='none' radius='md' withArrow>
			<HoverCard.Target>
				<ThemeIcon variant='transparent' className={classes.iconTarget}>
					<IconInfoCircle size={16} />
				</ThemeIcon>
			</HoverCard.Target>
			<HoverCard.Dropdown className={classes.dropdown}>
				<Stack gap='xs'>
					<Group justify='space-between' align='flex-start' wrap='nowrap'>
						<Stack gap={2}>
							<Text size='sm' fw={600}>
								{contactGroup.name}
							</Text>
							{contactGroup.description && (
								<Text size='xs' c='dimmed'>
									{contactGroup.description}
								</Text>
							)}
						</Stack>
						<Badge
							size='sm'
							variant='outline'
							color={contactGroup.isActive ? 'green' : 'gray'}
						>
							{contactGroup.isActive
								? t('form.contacts.details.meta.active')
								: t('form.contacts.details.meta.inactive')}
						</Badge>
					</Group>
					<Divider />
					<Group gap='xs' align='center'>
						<Text size='xs' c='dimmed'>
							{t('form.contacts.list.columns.status')}
						</Text>
						<Badge size='sm' variant='light' color={statusConfig.color}>
							{t(statusConfig.label)}
						</Badge>
					</Group>
					<SimpleGrid cols={2} spacing='xs'>
						<div className={classes.statItem}>
							<Text size='xs' c='dimmed'>
								{t('form.contacts.list.columns.total')}
							</Text>
							<Text size='sm' fw={500}>
								{contactGroup.contactCount}
							</Text>
						</div>
						<div className={classes.statItem}>
							<Text size='xs' c='dimmed'>
								{t('form.contacts.details.stats.waves')}
							</Text>
							<Text size='sm' fw={500}>
								{contactGroup.maxWaves
									? `${contactGroup.currentWave ?? 1} / ${contactGroup.maxWaves}`
									: t('form.contacts.details.stats.notSet')}
							</Text>
						</div>
						<div className={classes.statItem}>
							<Text size='xs' c='dimmed'>
								{t('form.contacts.details.stats.maxCallsPerContact')}
							</Text>
							<Text size='sm' fw={500}>
								{contactGroup.maxCallsPerContact}
							</Text>
						</div>
						<div className={classes.statItem}>
							<Text size='xs' c='dimmed'>
								{t('form.contacts.details.stats.maxCallsPerList')}
							</Text>
							<Text size='sm' fw={500}>
								{contactGroup.maxCallsPerList}
							</Text>
						</div>
					</SimpleGrid>
				</Stack>
			</HoverCard.Dropdown>
		</HoverCard>
	);
};

export default ContactListHoverCard;
