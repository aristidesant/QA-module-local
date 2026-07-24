import {
	ActionIcon,
	Avatar,
	Button,
	Collapse,
	CopyButton,
	Text,
	Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	IconBuildingStore,
	IconCalendarPlus,
	IconCheck,
	IconClockPlay,
	IconClipboardText,
	IconCopy,
	IconChevronDown,
	IconHash,
	IconPhone,
	IconTargetArrow,
	IconUsersGroup,
	type TablerIcon,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import type { BackofficeCase } from '~/models/backoffice/BackofficeCaseModel';
import classes from './CaseContextHero.module.css';

interface CaseContextHeroProps {
	caseData: BackofficeCase;
	locale: string;
}

interface DataCellProps {
	icon: TablerIcon;
	label: string;
	value: string;
	emphasis?: boolean;
	accent?: boolean;
	tabular?: boolean;
}

const formatDate = (value: string | null | undefined, locale: string) => {
	if (!value) return null;
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));
};

const getInitials = (firstName?: string, lastName?: string) => {
	const first = firstName?.trim()?.[0] ?? '';
	const last = lastName?.trim()?.[0] ?? '';
	return `${first}${last}`.toUpperCase() || '?';
};

const DataCell = ({
	icon: Icon,
	label,
	value,
	emphasis = false,
	accent = false,
	tabular = false,
}: DataCellProps) => {
	const valueClassName = [
		classes.fieldValue,
		emphasis ? classes.emphasizedValue : '',
		accent ? classes.accentValue : '',
		tabular ? classes.tabularValue : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classes.dataCell}>
			<div className={classes.fieldLabel}>
				<Icon size={14} aria-hidden />
				<Text component='span'>{label}</Text>
			</div>
			<Text className={valueClassName} title={value}>
				{value}
			</Text>
		</div>
	);
};

const CaseContextHero = ({ caseData, locale }: CaseContextHeroProps) => {
	const { t } = useTranslation('backoffice-cases');
	const [otherPhonesOpened, { toggle: toggleOtherPhones }] =
		useDisclosure(false);
	const na = t('common.notAvailable');

	const contactName = caseData.contact
		? `${caseData.contact.firstName} ${caseData.contact.lastName}`.trim()
		: na;
	const primaryPhone = caseData.contact?.phone?.trim() || '';
	const otherPhones = Array.from(
		new Set(
			(caseData.contact?.otherPhones ?? [])
				.map((phone) => phone.trim())
				.filter(Boolean)
		)
	);
	const conversationReference =
		caseData.latestConversation?.identifier?.trim() || '';
	const referenceDisplay = conversationReference || na;
	const otherPhonesId = `case-${caseData.id}-other-phones`;

	return (
		<SectionCard padding={0} contentSpacing={0} className={classes.hero}>
			<div className={classes.ledger}>
				<header className={classes.identityCell}>
					<Avatar
						size={40}
						radius='md'
						color='blue'
						variant='light'
						className={classes.avatar}
					>
						{getInitials(
							caseData.contact?.firstName,
							caseData.contact?.lastName
						)}
					</Avatar>
					<div className={classes.identityContent}>
						<Text className={classes.contactName} title={contactName}>
							{contactName}
						</Text>
						<div className={classes.phoneDetails}>
							<div
								className={classes.primaryPhoneRow}
								aria-label={`${t('fields.phone')}: ${primaryPhone || na}`}
							>
								<IconPhone size={16} aria-hidden />
								<Text
									component='span'
									className={classes.primaryPhone}
									title={primaryPhone || na}
								>
									{primaryPhone || na}
								</Text>
							</div>
							{otherPhones.length > 0 && (
								<>
									<Button
										variant='subtle'
										size='xs'
										color='gray'
										className={`${classes.otherPhonesToggle} ${otherPhonesOpened ? classes.otherPhonesToggleOpen : ''}`}
										onClick={toggleOtherPhones}
										aria-expanded={otherPhonesOpened}
										aria-controls={otherPhonesId}
										leftSection={
											<IconChevronDown
												size={14}
												className={classes.otherPhonesToggleIcon}
												aria-hidden
											/>
										}
									>
										{otherPhonesOpened
											? t('actions.hideOtherPhones')
											: t('actions.showOtherPhones', {
													count: otherPhones.length,
												})}
									</Button>
									<Collapse expanded={otherPhonesOpened} id={otherPhonesId}>
										<ul className={classes.otherPhonesList}>
											{otherPhones.map((phone) => (
												<li key={phone} className={classes.otherPhoneItem}>
													{phone}
												</li>
											))}
										</ul>
									</Collapse>
								</>
							)}
						</div>
						<div className={classes.identityMeta}>
							{caseData.campaign?.name && (
								<div className={classes.metaItem}>
									<IconBuildingStore size={12} aria-hidden />
									<Text component='span' title={caseData.campaign.name}>
										{caseData.campaign.name}
									</Text>
								</div>
							)}
							{caseData.contactGroup?.name && (
								<div className={classes.metaItem}>
									<IconUsersGroup size={12} aria-hidden />
									<Text component='span' title={caseData.contactGroup.name}>
										{caseData.contactGroup.name}
									</Text>
								</div>
							)}
						</div>
					</div>
				</header>

				<DataCell
					icon={IconClipboardText}
					label={t('fields.disposition')}
					value={caseData.latestDisposition?.dispositionName ?? na}
					emphasis
				/>
				<DataCell
					icon={IconTargetArrow}
					label={t('fields.contactOutcome')}
					value={caseData.latestDisposition?.contactOutcome ?? na}
					emphasis
					accent
				/>
				<DataCell
					icon={IconCalendarPlus}
					label={t('fields.createdAt')}
					value={formatDate(caseData.createdAt, locale) ?? na}
					tabular
				/>
				<DataCell
					icon={IconClockPlay}
					label={t('fields.conversationStart')}
					value={
						formatDate(caseData.latestConversation?.startDate, locale) ?? na
					}
					tabular
				/>

				<div className={classes.dataCell}>
					<div className={classes.fieldLabel}>
						<IconHash size={14} aria-hidden />
						<Text component='span'>{t('fields.conversationIdentifier')}</Text>
					</div>
					<div className={classes.referenceRow}>
						{conversationReference ? (
							<Tooltip
								label={conversationReference}
								position='top-start'
								withArrow
							>
								<Text className={classes.referenceValue}>
									{referenceDisplay}
								</Text>
							</Tooltip>
						) : (
							<Text className={classes.referenceValue}>{referenceDisplay}</Text>
						)}
						{conversationReference && (
							<CopyButton value={conversationReference} timeout={1500}>
								{({ copied, copy }) => {
									const actionLabel = copied
										? t('actions.referenceCopied')
										: t('actions.copyReference');

									return (
										<Tooltip label={actionLabel} withArrow>
											<ActionIcon
												variant='subtle'
												color={copied ? 'green' : 'gray'}
												size='sm'
												onClick={copy}
												aria-label={actionLabel}
												className={classes.copyAction}
											>
												{copied ? (
													<IconCheck size={15} />
												) : (
													<IconCopy size={15} />
												)}
											</ActionIcon>
										</Tooltip>
									);
								}}
							</CopyButton>
						)}
					</div>
				</div>
			</div>
		</SectionCard>
	);
};

export default CaseContextHero;
