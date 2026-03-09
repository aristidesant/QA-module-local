import {
	ActionIcon,
	Avatar,
	Badge,
	CopyButton,
	Group,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconCalendar,
	IconCheck,
	IconCopy,
	IconInfoCircle,
	IconPhoneCall,
	IconRobot,
	IconUser,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RightSectionCard from '~/components/RightSectionCard';
import ConversationMetadataList, {
	type ConversationMetadataListItem,
} from '../ConversationMetadataList';
import metadataListStyles from '../ConversationMetadataList/ConversationMetadataList.module.css';
import classes from './ConversationOverviewCard.module.css';

interface ConversationOverviewCardProps {
	contactName: string;
	contactPhone: string;
	statusLabel: string;
	statusColor: string;
	dateDisplay: string;
	agentName: string;
	campaignName: string;
	terminationReasonLabel?: string;
}

const ConversationOverviewCard: React.FC<ConversationOverviewCardProps> = ({
	contactName,
	contactPhone,
	statusLabel,
	statusColor,
	dateDisplay,
	agentName,
	campaignName,
	terminationReasonLabel,
}) => {
	const { t } = useTranslation('conversations');

	const StatValueWithHover = ({ value }: { value: string }) => (
		<Tooltip label={value} position='top-start' withArrow openDelay={100}>
			<Text className={metadataListStyles.valueText}>{value}</Text>
		</Tooltip>
	);

	const items = useMemo<ConversationMetadataListItem[]>(() => {
		const baseItems: ConversationMetadataListItem[] = [
			{
				key: 'date',
				label: t('overview.stats.dateTime'),
				icon: IconCalendar,
				value: <StatValueWithHover value={dateDisplay} />,
			},
			{
				key: 'agent',
				label: t('overview.stats.agent'),
				icon: IconRobot,
				value: <StatValueWithHover value={agentName} />,
			},
			{
				key: 'campaign',
				label: t('overview.stats.campaign'),
				icon: IconInfoCircle,
				value: <StatValueWithHover value={campaignName} />,
			},
		];

		if (terminationReasonLabel) {
			baseItems.push({
				key: 'termination',
				label: t('overview.stats.endReason'),
				icon: IconInfoCircle,
				value: <StatValueWithHover value={terminationReasonLabel} />,
			});
		}

		return baseItems;
	}, [agentName, campaignName, dateDisplay, t, terminationReasonLabel]);

	return (
		<RightSectionCard
			title={t('overview.title')}
			icon={IconUser}
			iconColor='var(--mantine-color-gray-7)'
		>
			<div className={classes.content}>
				<div className={classes.contactBlock}>
					<Avatar radius='xl' size={36} className={classes.avatar}>
						<IconUser size={16} />
					</Avatar>
					<div className={classes.contactCopy}>
						<Group
							gap={8}
							align='center'
							wrap='nowrap'
							className={classes.nameRow}
						>
							<Text className={classes.contactName} title={contactName}>
								{contactName}
							</Text>
							<Badge
								size='xs'
								variant='light'
								color={statusColor}
								className={classes.statusBadge}
							>
								{statusLabel}
							</Badge>
						</Group>
						<Group
							gap={6}
							align='center'
							wrap='nowrap'
							className={classes.phoneRow}
						>
							<IconPhoneCall size={13} className={classes.phoneIcon} />
							<Text className={classes.contactPhone} title={contactPhone}>
								{contactPhone}
							</Text>
							<CopyButton value={contactPhone} timeout={1200}>
								{({ copied, copy }) => (
									<Tooltip
										label={
											copied ? t('overview.copied') : t('overview.copyPhone')
										}
										withArrow
									>
										<ActionIcon
											size='xs'
											variant='subtle'
											aria-label={t('overview.copyPhone')}
											onClick={copy}
											className={classes.copyButton}
										>
											{copied ? (
												<IconCheck size={12} />
											) : (
												<IconCopy size={12} />
											)}
										</ActionIcon>
									</Tooltip>
								)}
							</CopyButton>
						</Group>
					</div>
				</div>

				<ConversationMetadataList items={items} />
			</div>
		</RightSectionCard>
	);
};

export default ConversationOverviewCard;
