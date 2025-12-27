import type { ReactNode } from 'react';
import {
	ActionIcon,
	Alert,
	Badge,
	Skeleton,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconId,
	IconInfoCircle,
	IconLock,
	IconTimeline,
	IconUser,
	IconX,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';
import classes from './UserDetails.module.css';
import { useGetUser } from '~/queries/userQueries';
import { timeAgo } from '~/utils/dateUtils';
import useUsersPageStore from '../store/useUsersPageStore';

interface UserDetailsProps {
	userId: number;
}

const formatDateTime = (value?: string | Date | null) => {
	if (!value) {
		return { relative: '—', absolute: '—' };
	}

	const parsed = dayjs(value);
	if (!parsed.isValid()) {
		return { relative: '—', absolute: '—' };
	}

	return {
		relative: timeAgo(value),
		absolute: parsed.format('MMM D, YYYY • HH:mm'),
	};
};

type Detail = {
	label: string;
	value: ReactNode;
};

const statusColors: Record<string, string> = {
	active: 'green',
	inactive: 'gray',
	pending: 'yellow',
	suspended: 'red',
};

const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
	const { t } = useTranslation('users');
	const { data: user, isLoading, isError, error } = useGetUser(userId);
	const clearRightComponent = useUsersPageStore(
		(state) => state.clearRightComponent
	);

	if (isLoading) {
		return (
			<Stack gap='md' className={classes.cards}>
				<RightSectionCard
					title={t('details.sections.profile')}
					icon={IconUser}
					iconColor='var(--mantine-color-blue-6)'
					rightSection={
						<ActionIcon
							variant='subtle'
							color='gray'
							aria-label={t('details.actions.close')}
							onClick={clearRightComponent}
							size='sm'
						>
							<IconX size={14} />
						</ActionIcon>
					}
				>
					<div className={classes.identity}>
						<Skeleton height={24} width='60%' />
						<Skeleton height={16} width='80%' />
						<Skeleton height={16} width='40%' />
						<div className={classes.badges}>
							<Skeleton height={20} width={60} />
							<Skeleton height={20} width={80} />
						</div>
					</div>
				</RightSectionCard>

				<RightSectionCard
					title={t('details.sections.account')}
					icon={IconId}
					iconColor='var(--mantine-color-indigo-6)'
				>
					<div className={classes.detailList}>
						<Skeleton height={16} width='100%' />
						<Skeleton height={16} width='100%' />
						<Skeleton height={16} width='100%' />
						<Skeleton height={16} width='100%' />
					</div>
				</RightSectionCard>

				<RightSectionCard
					title={t('details.sections.security')}
					icon={IconLock}
					iconColor='var(--mantine-color-cyan-6)'
				>
					<div className={classes.detailList}>
						<Skeleton height={16} width='100%' />
					</div>
				</RightSectionCard>

				<RightSectionCard
					title={t('details.sections.activity')}
					icon={IconTimeline}
					iconColor='var(--mantine-color-grape-6)'
				>
					<div className={classes.detailList}>
						<Skeleton height={16} width='100%' />
						<Skeleton height={16} width='100%' />
						<Skeleton height={16} width='100%' />
					</div>
				</RightSectionCard>
			</Stack>
		);
	}

	if (isError || !user) {
		return (
			<RightSectionCard
				title={t('details.title')}
				icon={IconUser}
				iconColor='var(--mantine-color-blue-6)'
				style={{ height: '100%' }}
				rightSection={
					<ActionIcon
						variant='subtle'
						color='gray'
						aria-label={t('details.actions.close')}
						onClick={clearRightComponent}
						size='sm'
					>
						<IconX size={14} />
					</ActionIcon>
				}
			>
				<Alert
					icon={<IconInfoCircle size={18} />}
					title={t('details.loadErrorTitle')}
					color='red'
				>
					{error instanceof Error ? error.message : t('list.unknownError')}
				</Alert>
			</RightSectionCard>
		);
	}

	const createdDate = formatDateTime(user.createdAt);
	const updatedDate = formatDateTime(user.updatedAt);
	const deletedDate = formatDateTime(user.deletedAt);

	const accountDetails: Detail[] = [];

	if (user.client?.name) {
		accountDetails.push({
			label: t('details.labels.clientName'),
			value: user.client.name,
		});
	}

	if (user.client?.identifier) {
		accountDetails.push({
			label: t('details.labels.clientIdentifier'),
			value: user.client.identifier,
		});
	}

	if (user.client?.email) {
		accountDetails.push({
			label: t('details.labels.clientEmail'),
			value: user.client.email,
		});
	}

	accountDetails.push({
		label: t('details.labels.clientId'),
		value: `#${user.clientId}`,
	});

	if (user.employeeId) {
		accountDetails.push({
			label: t('details.labels.employeeId'),
			value: user.employeeId,
		});
	}

	const securityDetails: Detail[] = [
		{
			label: t('details.labels.mfa'),
			value: user.mfaEnabled
				? t('details.values.enabled')
				: t('details.values.disabled'),
		},
	];

	const activityDetails: Detail[] = [
		{
			label: t('details.labels.created'),
			value: (
				<Tooltip label={createdDate.absolute}>
					<Text component='span' className={classes.link}>
						{createdDate.relative}
					</Text>
				</Tooltip>
			),
		},
		{
			label: t('details.labels.updated'),
			value: (
				<Tooltip label={updatedDate.absolute}>
					<Text component='span' className={classes.link}>
						{updatedDate.relative}
					</Text>
				</Tooltip>
			),
		},
	];

	if (user.deletedAt) {
		activityDetails.push({
			label: t('details.labels.deactivated'),
			value: (
				<Tooltip label={deletedDate.absolute}>
					<Text component='span' className={classes.link}>
						{deletedDate.relative}
					</Text>
				</Tooltip>
			),
		});
	}

	const updatedDescription =
		updatedDate.relative !== '—'
			? t('details.updatedDescription', { relative: updatedDate.relative })
			: undefined;

	const displayName =
		[user.firstName, user.lastName]
			.filter((value) => value && value.trim())
			.join(' ')
			.trim() || user.username;

	const statusKey = user.status?.toLowerCase?.() ?? '';
	const statusColor = statusColors[statusKey] ?? 'gray';
	const statusLabel = statusKey
		? t(`status.${statusKey}`, { defaultValue: user.status })
		: user.status;

	const renderDetails = (items: Detail[]) => (
		<div className={classes.detailList}>
			{items.map((detail) => (
				<div key={detail.label} className={classes.detail}>
					<Text className={classes.detailLabel}>{detail.label}</Text>
					<div className={classes.detailValue}>{detail.value}</div>
				</div>
			))}
		</div>
	);

	return (
		<Stack gap='md' className={classes.cards}>
			<RightSectionCard
				title={t('details.sections.profile')}
				icon={IconUser}
				iconColor='var(--mantine-color-blue-6)'
				description={updatedDescription}
				rightSection={
					<ActionIcon
						variant='subtle'
						color='gray'
						aria-label={t('details.actions.close')}
						onClick={clearRightComponent}
						size='sm'
					>
						<IconX size={14} />
					</ActionIcon>
				}
			>
				<div className={classes.identity}>
					<Text className={classes.name}>{displayName}</Text>
					<Text className={classes.meta}>{user.email}</Text>
					<Text className={classes.username}>@{user.username}</Text>
					<div className={classes.badges}>
						<Badge
							variant='light'
							color={statusColor}
							className={classes.badge}
						>
							{statusLabel}
						</Badge>
						{user.employeeId ? (
							<Badge variant='light' color='blue' className={classes.badge}>
								{t('details.employeeBadge', { employeeId: user.employeeId })}
							</Badge>
						) : null}
					</div>
				</div>
			</RightSectionCard>

			<RightSectionCard
				title={t('details.sections.account')}
				icon={IconId}
				iconColor='var(--mantine-color-indigo-6)'
			>
				{renderDetails(accountDetails)}
			</RightSectionCard>

			<RightSectionCard
				title={t('details.sections.security')}
				icon={IconLock}
				iconColor='var(--mantine-color-cyan-6)'
			>
				{renderDetails(
					securityDetails.map((detail) => ({
						...detail,
						value: (
							<Badge
								variant='light'
								color={
									detail.value === t('details.values.enabled')
										? 'green'
										: 'gray'
								}
								className={classes.badge}
							>
								{detail.value}
							</Badge>
						),
					}))
				)}
			</RightSectionCard>

			<RightSectionCard
				title={t('details.sections.activity')}
				icon={IconTimeline}
				iconColor='var(--mantine-color-grape-6)'
			>
				{renderDetails(activityDetails)}
			</RightSectionCard>
		</Stack>
	);
};

export default UserDetails;
