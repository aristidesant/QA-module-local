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
	const { data: user, isLoading, isError, error } = useGetUser(userId);
	const clearRightComponent = useUsersPageStore(
		(state) => state.clearRightComponent
	);

	if (isLoading) {
		return (
			<Stack gap='md' className={classes.cards}>
				<RightSectionCard
					title='Profile'
					icon={IconUser}
					iconColor='var(--mantine-color-blue-6)'
					rightSection={
						<ActionIcon
							variant='subtle'
							color='gray'
							aria-label='Close details'
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
					title='Account'
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
					title='Security'
					icon={IconLock}
					iconColor='var(--mantine-color-cyan-6)'
				>
					<div className={classes.detailList}>
						<Skeleton height={16} width='100%' />
					</div>
				</RightSectionCard>

				<RightSectionCard
					title='Activity'
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
				title='User details'
				icon={IconUser}
				iconColor='var(--mantine-color-blue-6)'
				style={{ height: '100%' }}
				rightSection={
					<ActionIcon
						variant='subtle'
						color='gray'
						aria-label='Close details'
						onClick={clearRightComponent}
						size='sm'
					>
						<IconX size={14} />
					</ActionIcon>
				}
			>
				<Alert
					icon={<IconInfoCircle size={18} />}
					title='Unable to load user details'
					color='red'
				>
					{error instanceof Error ? error.message : 'Unknown error'}
				</Alert>
			</RightSectionCard>
		);
	}

	const createdDate = formatDateTime(user.createdAt);
	const updatedDate = formatDateTime(user.updatedAt);
	const deletedDate = formatDateTime(user.deletedAt);

	const accountDetails: Detail[] = [];

	if (user.client?.name) {
		accountDetails.push({ label: 'Client name', value: user.client.name });
	}

	if (user.client?.identifier) {
		accountDetails.push({
			label: 'Client identifier',
			value: user.client.identifier,
		});
	}

	if (user.client?.email) {
		accountDetails.push({
			label: 'Client email',
			value: user.client.email,
		});
	}

	accountDetails.push({ label: 'Client ID', value: `#${user.clientId}` });

	if (user.employeeId) {
		accountDetails.push({ label: 'Employee ID', value: user.employeeId });
	}

	const securityDetails: Detail[] = [
		{
			label: 'Multi-factor authentication',
			value: user.mfaEnabled ? 'Enabled' : 'Disabled',
		},
	];

	const activityDetails: Detail[] = [
		{
			label: 'Created',
			value: (
				<Tooltip label={createdDate.absolute}>
					<Text component='span' className={classes.link}>
						{createdDate.relative}
					</Text>
				</Tooltip>
			),
		},
		{
			label: 'Last updated',
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
			label: 'Deactivated',
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
			? `Updated ${updatedDate.relative}`
			: undefined;

	const displayName =
		[user.firstName, user.lastName]
			.filter((value) => value && value.trim())
			.join(' ')
			.trim() || user.username;

	const statusColor = statusColors[user.status?.toLowerCase() ?? ''] ?? 'gray';

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
				title='Profile'
				icon={IconUser}
				iconColor='var(--mantine-color-blue-6)'
				description={updatedDescription}
				rightSection={
					<ActionIcon
						variant='subtle'
						color='gray'
						aria-label='Close details'
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
							{user.status}
						</Badge>
						{user.employeeId ? (
							<Badge variant='light' color='blue' className={classes.badge}>
								Employee #{user.employeeId}
							</Badge>
						) : null}
					</div>
				</div>
			</RightSectionCard>

			<RightSectionCard
				title='Account'
				icon={IconId}
				iconColor='var(--mantine-color-indigo-6)'
			>
				{renderDetails(accountDetails)}
			</RightSectionCard>

			<RightSectionCard
				title='Security'
				icon={IconLock}
				iconColor='var(--mantine-color-cyan-6)'
			>
				{renderDetails(
					securityDetails.map((detail) => ({
						...detail,
						value: (
							<Badge
								variant='light'
								color={detail.value === 'Enabled' ? 'green' : 'gray'}
								className={classes.badge}
							>
								{detail.value}
							</Badge>
						),
					}))
				)}
			</RightSectionCard>

			<RightSectionCard
				title='Activity'
				icon={IconTimeline}
				iconColor='var(--mantine-color-grape-6)'
			>
				{renderDetails(activityDetails)}
			</RightSectionCard>
		</Stack>
	);
};

export default UserDetails;
