import { Avatar, Badge, CopyButton, Text, Tooltip } from '@mantine/core';
import {
	IconCalendar,
	IconCheck,
	IconCopy,
	IconEye,
	IconInfoCircle,
	IconPhoneCall,
	IconRobot,
	IconUser,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard/SectionCard';
import {
	useCallDispositionByConversationId,
	useCallDispositionWithAi,
} from '~/queries/callDispositionQueries';
import ConversationDispositionContent, {
	normalizeDispositionStatus,
} from '../ConversationDisposition/ConversationDispositionContent';
import type { CallDispositionModel } from '~/models/CallDispositionModel';
import ConversationMetadataList, {
	type ConversationMetadataListItem,
} from '../ConversationMetadataList/ConversationMetadataList';
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
	conversationId?: string | number;
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
	conversationId,
}) => {
	const { t, i18n } = useTranslation(['conversations', 'common']);
	const [isCallingAi, setIsCallingAi] = useState(false);

	const { data, isLoading, isError, refetch } =
		useCallDispositionByConversationId(conversationId);

	const withAiMutation = useCallDispositionWithAi();

	const handleRetry = async () => {
		setIsCallingAi(true);
		try {
			await withAiMutation.mutateAsync(Number(conversationId));
			await refetch();
		} catch {
			// error state handled by isError
		} finally {
			setIsCallingAi(false);
		}
	};

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

	const disposition = data as CallDispositionModel | undefined;
	const status = normalizeDispositionStatus(
		disposition?.callStatus || disposition?.dispositionName
	);
	const updatedAt = disposition?.updatedAt || disposition?.createdAt;
	const timestampLabel =
		updatedAt && !isLoading && !isError
			? new Date(updatedAt).toLocaleDateString(
					i18n.language === 'es' ? 'es-ES' : 'en-US',
					{
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: '2-digit',
					}
				)
			: undefined;

	const hasPhone = Boolean(contactPhone.trim());
	const showOutcome = conversationId != null;

	return (
		<SectionCard
			title={t('overview.title')}
			icon={IconUser}
			padding='sm'
			contentSpacing='sm'
			className={classes.overviewCard}
		>
			<div className={classes.overviewGrid}>
				<div className={classes.contextColumn}>
					{hasPhone ? (
						<div className={classes.contactBlock}>
							<Avatar radius='xl' size={38} className={classes.avatar}>
								<IconUser size={17} />
							</Avatar>
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
							<CopyButton value={contactPhone} timeout={1200}>
								{({ copied, copy }) => (
									<Tooltip
										label={
											copied ? t('overview.copied') : t('overview.copyPhone')
										}
										withArrow
										position='bottom-start'
									>
										<button
											type='button'
											onClick={copy}
											className={classes.phoneChip}
											aria-label={t('overview.copyPhone')}
										>
											<IconPhoneCall
												size={12}
												className={classes.phoneChipIcon}
											/>
											<span className={classes.phoneChipText}>
												{contactPhone}
											</span>
											{copied ? (
												<IconCheck
													size={11}
													className={classes.phoneChipCopyIcon}
												/>
											) : (
												<IconCopy
													size={11}
													className={classes.phoneChipCopyIcon}
												/>
											)}
										</button>
									</Tooltip>
								)}
							</CopyButton>
						</div>
					) : (
						<div className={classes.previewNotice}>
							<div className={classes.previewNoticeIcon}>
								<IconEye size={15} />
							</div>
							<div className={classes.previewNoticeBody}>
								<Text className={classes.previewNoticeLabel}>
									{t('overview.previewContact.label')}
								</Text>
								<Text className={classes.previewNoticeDescription}>
									{t('overview.previewContact.description')}
								</Text>
							</div>
						</div>
					)}

					<ConversationMetadataList items={items} columns={2} />
				</div>

				{showOutcome && (
					<div className={classes.outcomeColumn}>
						<Text className={classes.outcomeTitle}>
							{t('disposition.title')}
						</Text>
						<div className={classes.outcomeSection} data-status={status}>
							<ConversationDispositionContent
								disposition={disposition}
								isLoading={isLoading}
								isError={isError}
								isRetrying={isCallingAi}
								onRetry={handleRetry}
								timestampLabel={timestampLabel}
								emptyLabel={t('disposition.noOutcome')}
							/>
						</div>
					</div>
				)}
			</div>
		</SectionCard>
	);
};

export default ConversationOverviewCard;
