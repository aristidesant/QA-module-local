import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Checkbox,
	Group,
	Paper,
	ScrollArea,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '~/utils/httpClient';
import { useTranslation } from 'react-i18next';
import classes from './RoleForm.module.css';
import {
	useCreateRole,
	useUpdateRole,
	useGetRole,
} from '~/queries/roleQueries';
import type {
	CreateRolePayload,
	UpdateRolePayload,
	RoleModulePermissionModel,
	ModulePermissionFormValue,
	RoleModulePermissionPayload,
} from '~/models/RoleModel';
import RoleFormSkeleton from './RoleFormSkeleton';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { getPermissionTooltip } from '../utils/getPermissionTooltip';

interface RoleFormProps {
	mode: 'create' | 'edit';
	roleId?: number;
	onSuccess: () => void;
}

interface RoleFormValues {
	name: string;
	code: string;
	description: string;
	isActive: boolean;
	isSystem: boolean;
	/** Maps module name to array of permissions with optional IDs */
	modulePermissions: Record<string, ModulePermissionFormValue[]>;
}

const MODULES = Object.values(ModuleEnum).filter(
	(module) => module !== ModuleEnum.AGENTS
);
const PERMISSIONS = Object.values(PermissionEnum);
const MASTER_CLIENT_ONLY_MODULES = new Set<string>([
	ModuleEnum.TOOLS,
	ModuleEnum.PROMPTS,
]);

const formatModuleName = (module: string): string => {
	return module
		.split('_')
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(' ');
};

const normalizeModulePermissions = (
	modulePermissions: Record<string, ModulePermissionFormValue[]>
): Record<string, ModulePermissionFormValue[]> => {
	return Object.fromEntries(
		Object.entries(modulePermissions).map(([module, permissions]) => {
			const managePermission = permissions.find(
				(permission) => permission.permission === PermissionEnum.MANAGE
			);

			if (managePermission) {
				return [module, [managePermission]];
			}

			return [module, permissions];
		})
	);
};

const RoleForm: React.FC<RoleFormProps> = ({ mode, roleId, onSuccess }) => {
	const { t } = useTranslation('roles');
	const isEditMode = mode === 'edit';
	const [activeModule, setActiveModule] = useState<string>(MODULES[0] ?? '');

	const getModuleLabel = (module: string) =>
		t(`form.permissions.moduleNames.${module}`, {
			defaultValue: formatModuleName(module),
		});
	const getPermissionLabel = (permission: string) =>
		t(`form.permissions.permissionLabels.${permission}`, {
			defaultValue: permission.charAt(0) + permission.slice(1).toLowerCase(),
		});

	const form = useForm<RoleFormValues>({
		initialValues: {
			name: '',
			code: '',
			description: '',
			isActive: true,
			isSystem: false,
			modulePermissions: {},
		},
		validate: {
			name: (value) =>
				value.trim() ? null : t('form.validation.nameRequired'),
			code: (value) => {
				if (!value.trim()) return t('form.validation.codeRequired');
				if (!/^[A-Z_]+$/.test(value)) return t('form.validation.codeFormat');
				return null;
			},
		},
	});

	const createMutation = useCreateRole();
	const updateMutation = useUpdateRole();

	const {
		data: role,
		isLoading: isRoleLoading,
		isError: isRoleError,
		error: roleError,
	} = useGetRole(roleId ?? 0);

	useEffect(() => {
		if (isEditMode && role) {
			const modulePermissions: Record<string, ModulePermissionFormValue[]> = {};

			role.modulePermissions?.forEach((mp: RoleModulePermissionModel) => {
				if (!modulePermissions[mp.module]) {
					modulePermissions[mp.module] = [];
				}
				modulePermissions[mp.module].push({
					id: mp.id,
					module: mp.module,
					permission: mp.permission,
				});
			});

			form.setValues({
				name: role.name,
				code: role.code,
				description: role.description ?? '',
				isActive: role.isActive,
				isSystem: role.isSystem,
				modulePermissions: normalizeModulePermissions(modulePermissions),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditMode, role]);

	const isSubmitting = useMemo(
		() => createMutation.isPending || updateMutation.isPending,
		[createMutation.isPending, updateMutation.isPending]
	);

	const isLoading = useMemo(
		() => isEditMode && isRoleLoading,
		[isEditMode, isRoleLoading]
	);

	const handlePermissionToggle = (module: string, permission: string) => {
		const currentPermissions = form.values.modulePermissions[module] || [];
		const existingPermission = currentPermissions.find(
			(p) => p.permission === permission
		);

		const hasManage = currentPermissions.some(
			(p) => p.permission === PermissionEnum.MANAGE
		);

		if (permission !== PermissionEnum.MANAGE && hasManage) {
			return;
		}

		const updatedPermissions =
			permission === PermissionEnum.MANAGE
				? existingPermission
					? currentPermissions.filter((p) => p.permission !== permission)
					: [{ module, permission }]
				: existingPermission
					? currentPermissions.filter((p) => p.permission !== permission)
					: [...currentPermissions, { module, permission }];

		form.setFieldValue('modulePermissions', {
			...form.values.modulePermissions,
			[module]: updatedPermissions,
		});
	};

	const buildModulePermissionsPayload = (): RoleModulePermissionPayload[] => {
		const permissions: RoleModulePermissionPayload[] = [];

		Object.values(form.values.modulePermissions).forEach((perms) => {
			perms.forEach((perm) => {
				if (perm.id) {
					// Include the ID for existing permissions (update case)
					permissions.push({
						id: perm.id,
						module: perm.module,
						permission: perm.permission,
					});
				} else {
					// New permission without ID
					permissions.push({
						module: perm.module,
						permission: perm.permission,
					});
				}
			});
		});

		return permissions;
	};

	const handleSubmit = form.onSubmit(async (values) => {
		try {
			const modulePermissions = buildModulePermissionsPayload();

			if (isEditMode) {
				if (!roleId) {
					throw new Error(t('form.validation.missingRoleId'));
				}
				const updatePayload: UpdateRolePayload = {
					name: values.name,
					code: values.code,
					description: values.description || undefined,
					isActive: values.isActive,
					modulePermissions,
				};
				await updateMutation.mutateAsync({ id: roleId, data: updatePayload });
				notifications.show({
					title: t('notifications.updatedTitle'),
					message: t('notifications.updatedMessage', { name: values.name }),
					color: 'green',
				});
			} else {
				const createPayload: CreateRolePayload = {
					name: values.name,
					code: values.code,
					description: values.description || undefined,
					isActive: values.isActive,
					isSystem: false,
					modulePermissions,
				};
				await createMutation.mutateAsync(createPayload);
				notifications.show({
					title: t('notifications.createdTitle'),
					message: t('notifications.createdMessage', { name: values.name }),
					color: 'green',
				});
				form.reset();
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('notifications.requestFailedTitle'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	});

	if (isEditMode && isRoleLoading) {
		return <RoleFormSkeleton />;
	}

	if (isLoading) {
		return <RoleFormSkeleton />;
	}

	if (isEditMode && isRoleError) {
		return (
			<Alert
				icon={<IconInfoCircle size={18} />}
				title={t('form.loadErrorTitle')}
				color='red'
			>
				{roleError instanceof Error
					? roleError.message
					: t('list.unknownError')}
			</Alert>
		);
	}

	const isSystemRole = isEditMode && role?.isSystem;
	const currentModule = activeModule || MODULES[0] || '';
	const isMasterClientOnlyModule =
		MASTER_CLIENT_ONLY_MODULES.has(currentModule);
	const isManageSelectedForCurrentModule =
		form.values.modulePermissions[currentModule]?.some(
			(permission) => permission.permission === PermissionEnum.MANAGE
		) ?? false;

	const modulePermissionCount = (module: string) =>
		form.values.modulePermissions[module]?.length ?? 0;

	return (
		<Paper
			component='form'
			withBorder={false}
			className={classes.form}
			onSubmit={handleSubmit}
		>
			<Stack gap='xs'>
				<div className={classes.layout}>
					<section className={classes.sectionCard}>
						<div className={classes.sectionHeader}>
							<Text className={classes.sectionTitle}>
								{t('form.sections.basics.title')}
							</Text>
							<Text className={classes.sectionDescription}>
								{t('form.sections.basics.description')}
							</Text>
						</div>
						<div className={classes.row}>
							<TextInput
								required
								label={t('form.fields.name.label')}
								placeholder={t('form.fields.name.placeholder')}
								className={classes.field}
								size='sm'
								disabled={isSystemRole}
								{...form.getInputProps('name')}
							/>
							<TextInput
								required
								label={t('form.fields.code.label')}
								placeholder={t('form.fields.code.placeholder')}
								className={classes.field}
								size='sm'
								disabled={isEditMode}
								{...form.getInputProps('code')}
							/>
						</div>
						<Textarea
							label={t('form.fields.description.label')}
							placeholder={t('form.fields.description.placeholder')}
							className={classes.field}
							rows={3}
							size='sm'
							disabled={isSystemRole}
							{...form.getInputProps('description')}
						/>
						<div className={classes.statusRow}>
							<Switch
								label={t('form.fields.isActive.label')}
								description={t('form.fields.isActive.description')}
								size='sm'
								checked={form.values.isActive}
								onChange={(event) =>
									form.setFieldValue('isActive', event.currentTarget.checked)
								}
								disabled={isSystemRole}
							/>
							<Text className={classes.hint}>
								{t('form.fields.isActive.hint')}
							</Text>
						</div>
					</section>

					<section className={classes.sectionCard}>
						<div className={classes.sectionHeader}>
							<Text className={classes.sectionTitle}>
								{t('form.sections.permissions.title')}
							</Text>
							<Text className={classes.sectionDescription}>
								{t('form.sections.permissions.description')}
							</Text>
						</div>

						<div className={classes.permissionsContainer}>
							<div className={classes.moduleSidebar}>
								<ScrollArea
									type='never'
									offsetScrollbars
									className={classes.moduleScroll}
								>
									<div className={classes.moduleList}>
										{MODULES.map((module) => {
											const count = modulePermissionCount(module);
											const isActiveModule = module === currentModule;
											const isMasterClientOnly =
												MASTER_CLIENT_ONLY_MODULES.has(module);
											return (
												<button
													key={module}
													type='button'
													className={`${classes.moduleTab} ${isActiveModule ? classes.moduleTabActive : ''}`}
													onClick={() => setActiveModule(module)}
													disabled={isSystemRole}
												>
													<span className={classes.moduleTabLabelRow}>
														<span className={classes.moduleTabLabelText}>
															{getModuleLabel(module)}
														</span>
														{isMasterClientOnly && (
															<Tooltip
																label={t('form.masterClientOnly.tooltip')}
																withArrow
																position='right'
																offset={10}
															>
																<span
																	role='img'
																	aria-label={t(
																		'form.masterClientOnly.ariaLabel'
																	)}
																	data-testid={`master-client-only-${module}`}
																	className={classes.masterClientOnlyIcon}
																	onClick={(event) => event.stopPropagation()}
																>
																	<IconAlertCircle size={14} />
																</span>
															</Tooltip>
														)}
													</span>
													{count > 0 && (
														<Badge
															color='blue'
															variant={isActiveModule ? 'filled' : 'light'}
															size='xs'
															className={classes.moduleCount}
														>
															{count}
														</Badge>
													)}
												</button>
											);
										})}
									</div>
								</ScrollArea>
							</div>

							<div className={classes.permissionsPanel}>
								<div className={classes.permissionsPanelHeader}>
									<div className={classes.permissionsPanelTitleRow}>
										<Text className={classes.permissionsPanelTitle}>
											{getModuleLabel(currentModule)}
										</Text>
										{isMasterClientOnlyModule && (
											<Tooltip
												label={t('form.masterClientOnly.tooltip')}
												withArrow
												position='top'
												offset={6}
											>
												<span
													role='img'
													aria-label={t('form.masterClientOnly.ariaLabel')}
													className={classes.masterClientOnlyIcon}
												>
													<IconAlertCircle size={14} />
												</span>
											</Tooltip>
										)}
									</div>
									<Text className={classes.permissionsPanelCount}>
										{t('form.permissions.selectedCount', {
											selected: modulePermissionCount(currentModule),
											total: PERMISSIONS.length,
										})}
									</Text>
								</div>
								<div className={classes.permissionGrid}>
									{PERMISSIONS.map((permission) => {
										const isChecked =
											form.values.modulePermissions[currentModule]?.some(
												(p) => p.permission === permission
											) ?? false;
										const isDisabled =
											isSystemRole ||
											(isManageSelectedForCurrentModule &&
												permission !== PermissionEnum.MANAGE);
										const tooltipLabel = getPermissionTooltip(
											t,
											currentModule,
											permission,
											{ moduleLabel: getModuleLabel(currentModule) }
										);
										return (
											<Tooltip
												key={permission}
												label={tooltipLabel}
												withArrow
												multiline
												w={260}
												position='top-start'
												offset={6}
											>
												<div
													data-testid={`permission-item-${currentModule}-${permission}`}
													className={`${classes.permissionItem} ${isChecked ? classes.permissionItemActive : ''}`}
												>
													<Checkbox
														label={getPermissionLabel(permission)}
														size='xs'
														checked={isChecked}
														onChange={() =>
															handlePermissionToggle(currentModule, permission)
														}
														disabled={isDisabled}
														className={classes.permissionCheckbox}
													/>
												</div>
											</Tooltip>
										);
									})}
								</div>
							</div>
						</div>
					</section>
				</div>

				<Group justify='space-between' className={classes.actions}>
					<Text className={classes.helperText}>
						{t('form.actions.helperText')}
					</Text>
					<Button
						type='submit'
						loading={isSubmitting}
						disabled={isSubmitting || isSystemRole}
						size='sm'
					>
						{isEditMode
							? t('form.actions.saveChanges')
							: t('form.actions.createRole')}
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
};

export default RoleForm;
