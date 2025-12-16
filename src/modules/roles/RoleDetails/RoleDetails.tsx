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
	IconInfoCircle,
	IconKey,
	IconShield,
	IconTimeline,
	IconX,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';
import classes from './RoleDetails.module.css';
import { useGetRole } from '~/queries/roleQueries';
import { timeAgo } from '~/utils/dateUtils';
import useRolesPageStore from '../store/useRolesPageStore';
import { ModuleEnum } from '~/constants/ModuleEnum';

interface RoleDetailsProps {
	roleId: number;
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

const formatModuleName = (module: string): string => {
	return module
		.split('_')
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(' ');
};

const RoleDetails: React.FC<RoleDetailsProps> = ({ roleId }) => {
	const { data: role, isLoading, isError, error } = useGetRole(roleId);
	const clearRightComponent = useRolesPageStore(
		(state) => state.clearRightComponent
	);

	if (isLoading) {
		return (
			<Stack gap='md' className={classes.cards}>
				<RightSectionCard
					title='Role'
					icon={IconShield}
					iconColor='var(--mantine-color-grape-6)'
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
						<Skeleton height={16} width='40%' />
						<Skeleton height={16} width='80%' />
						<div className={classes.badges}>
							<Skeleton height={20} width={60} />
							<Skeleton height={20} width={80} />
						</div>
					</div>
				</RightSectionCard>

				<RightSectionCard
					title='Permissions'
					icon={IconKey}
					iconColor='var(--mantine-color-blue-6)'
				>
					<div className={classes.detailList}>
						<Skeleton height={40} width='100%' />
						<Skeleton height={40} width='100%' />
						<Skeleton height={40} width='100%' />
					</div>
				</RightSectionCard>

				<RightSectionCard
					title='Activity'
					icon={IconTimeline}
					iconColor='var(--mantine-color-cyan-6)'
				>
					<div className={classes.detailList}>
						<Skeleton height={16} width='100%' />
						<Skeleton height={16} width='100%' />
					</div>
				</RightSectionCard>
			</Stack>
		);
	}

	if (isError || !role) {
		return (
			<RightSectionCard
				title='Role details'
				icon={IconShield}
				iconColor='var(--mantine-color-grape-6)'
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
					title='Unable to load role details'
					color='red'
				>
					{error instanceof Error ? error.message : 'Unknown error'}
				</Alert>
			</RightSectionCard>
		);
	}

	const createdDate = formatDateTime(role.createdAt);
	const updatedDate = formatDateTime(role.updatedAt);

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

	const updatedDescription =
		updatedDate.relative !== '—'
			? `Updated ${updatedDate.relative}`
			: undefined;

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

	// Group permissions by module
	const groupedPermissions = (role.modulePermissions || [])
		.filter((permission) => permission.module !== ModuleEnum.AGENTS)
		.reduce(
			(acc, mp) => {
				if (!acc[mp.module]) {
					acc[mp.module] = [];
				}
				acc[mp.module].push(mp.permission);
				return acc;
			},
			{} as Record<string, string[]>
		);

	return (
		<Stack gap='md' className={classes.cards}>
			<RightSectionCard
				title='Role'
				icon={IconShield}
				iconColor='var(--mantine-color-grape-6)'
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
					<Text className={classes.name}>{role.name}</Text>
					<Text className={classes.code}>{role.code}</Text>
					{role.description && (
						<Text className={classes.description}>{role.description}</Text>
					)}
					<div className={classes.badges}>
						<Badge
							variant='light'
							color={role.isActive ? 'green' : 'gray'}
							className={classes.badge}
						>
							{role.isActive ? 'Active' : 'Inactive'}
						</Badge>
						{role.isSystem && (
							<Badge variant='light' color='grape' className={classes.badge}>
								System Role
							</Badge>
						)}
					</div>
				</div>
			</RightSectionCard>

			<RightSectionCard
				title='Permissions'
				icon={IconKey}
				iconColor='var(--mantine-color-blue-6)'
			>
				{Object.keys(groupedPermissions).length > 0 ? (
					<div className={classes.permissionsContainer}>
						{Object.entries(groupedPermissions).map(([module, permissions]) => (
							<div key={module} className={classes.modulePermission}>
								<Text className={classes.moduleName}>
									{formatModuleName(module)}
								</Text>
								<div className={classes.permissionBadges}>
									{permissions.map((permission) => (
										<Badge
											key={permission}
											variant='light'
											color='blue'
											size='xs'
											className={classes.permissionBadge}
										>
											{permission}
										</Badge>
									))}
								</div>
							</div>
						))}
					</div>
				) : (
					<Text className={classes.emptyPermissions}>
						No permissions assigned to this role
					</Text>
				)}
			</RightSectionCard>

			<RightSectionCard
				title='Activity'
				icon={IconTimeline}
				iconColor='var(--mantine-color-cyan-6)'
			>
				{renderDetails(activityDetails)}
			</RightSectionCard>
		</Stack>
	);
};

export default RoleDetails;
