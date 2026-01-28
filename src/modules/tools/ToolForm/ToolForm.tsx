import { useEffect, useState, useMemo } from 'react';
import {
	Stack,
	Text,
	TextInput,
	Textarea,
	Select,
	Button,
	Group,
	Loader,
	ActionIcon,
	Badge,
	ScrollArea,
	ThemeIcon,
	LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconDeviceFloppy,
	IconPlus,
	IconAlertCircle,
	IconMinus,
	IconX,
	IconSettings,
	IconApi,
	IconKey,
	IconRoute,
	IconBraces,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
	useToolById,
	useCreateTool,
	useUpdateTool,
} from '~/queries/toolQueries';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import type {
	ToolRequestBodyProperty,
	CreateToolDto,
} from '~/models/ToolModel';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';
import SectionCard from '~/components/SectionCard/SectionCard';
import styles from './ToolForm.module.css';
import { useTranslation } from 'react-i18next';

interface ToolFormProps {
	toolId?: string | number;
	categoryId?: string | number;
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface HeaderField {
	key: string;
	value: string;
}

interface QueryParameter {
	key: string;
	value: string;
}

interface PathParameter {
	key: string;
	value: string;
}

interface RequestBodyProperty {
	key: string;
	type: string;
	description: string;
	constantValue?: string;
	dynamicVariable?: string;
	required: boolean;
}

interface FormValues {
	name: string;
	description: string;
	prompt: string;
	identifier: string;
	categoryId: string;
	status: string;
	url: string;
	method: string;
	responseTimeoutSecs: number;
	headers: HeaderField[];
	queryParameters: QueryParameter[];
	pathParameters: PathParameter[];
	requestBodyProperties: RequestBodyProperty[];
	authConnection: string;
}

type SectionId = 'general' | 'api' | 'headers' | 'parameters' | 'body';

interface Section {
	id: SectionId;
	label: string;
	icon: React.ReactNode;
}

const HTTP_METHODS = [
	{ value: 'GET', label: 'GET' },
	{ value: 'POST', label: 'POST' },
	{ value: 'PUT', label: 'PUT' },
	{ value: 'PATCH', label: 'PATCH' },
	{ value: 'DELETE', label: 'DELETE' },
];

function ToolForm({ toolId, categoryId, onSuccess, onCancel }: ToolFormProps) {
	const { t } = useTranslation('tools');
	const [isEdit, setIsEdit] = useState(!!toolId);
	const [activeSection, setActiveSection] = useState<SectionId>('general');

	const sections: Section[] = useMemo(
		() => [
			{
				id: 'general',
				label: t('form.sections.general'),
				icon: <IconSettings size={14} />,
			},
			{ id: 'api', label: t('form.sections.api'), icon: <IconApi size={14} /> },
			{
				id: 'headers',
				label: t('form.sections.headers'),
				icon: <IconKey size={14} />,
			},
			{
				id: 'parameters',
				label: t('form.sections.parameters'),
				icon: <IconRoute size={14} />,
			},
			{
				id: 'body',
				label: t('form.sections.body'),
				icon: <IconBraces size={14} />,
			},
		],
		[t]
	);

	const propertyTypeOptions = useMemo(
		() => [
			{ value: 'string', label: t('form.propertyTypes.string') },
			{ value: 'number', label: t('form.propertyTypes.number') },
			{ value: 'boolean', label: t('form.propertyTypes.boolean') },
			{ value: 'array', label: t('form.propertyTypes.array') },
			{ value: 'object', label: t('form.propertyTypes.object') },
		],
		[t]
	);

	// Queries
	const {
		data: tool,
		isLoading: isLoadingTool,
		error: toolError,
	} = useToolById(toolId);
	const { data: categories = [], isLoading: isLoadingCategories } =
		useToolCategories();
	const createToolMutation = useCreateTool();
	const updateToolMutation = useUpdateTool();

	const form = useForm<FormValues>({
		initialValues: {
			name: '',
			description: '',
			prompt: '',
			identifier: '',
			categoryId: categoryId ? categoryId.toString() : '',
			status: 'active',
			url: '',
			method: 'GET',
			responseTimeoutSecs: 30,
			headers: [],
			queryParameters: [],
			pathParameters: [],
			requestBodyProperties: [],
			authConnection: '',
		},
		validate: {
			name: (value) =>
				value.trim() ? null : t('form.validation.nameRequired'),
			description: (value) =>
				value.trim() ? null : t('form.validation.descriptionRequired'),
			prompt: (value) =>
				value.trim() ? null : t('form.validation.promptRequired'),
			categoryId: (value) =>
				value ? null : t('form.validation.categoryRequired'),
			url: (value) => {
				if (!value.trim()) return t('form.validation.urlRequired');
				try {
					new URL(value);
					return null;
				} catch {
					return t('form.validation.urlInvalid');
				}
			},
		},
	});

	// Initialize form state based on props
	useEffect(() => {
		if (toolId) {
			setIsEdit(true);
		} else {
			setIsEdit(false);
			form.reset();
			if (categoryId) {
				form.setFieldValue('categoryId', categoryId.toString());
			}
		}
	}, [toolId, categoryId]);

	// Set edit mode and populate form when tool data is available
	useEffect(() => {
		if (toolId && tool) {
			setIsEdit(true);

			const headers = Object.entries(
				tool.config?.toolConfig?.apiSchema?.requestHeaders || {}
			).map(([key, value]) => ({ key, value: value as string }));

			const pathParameters = Object.entries(
				tool.config?.toolConfig?.apiSchema?.pathParamsSchema || {}
			).map(([key, value]) => ({ key, value: value as string }));

			const requestBodyProperties = Object.entries(
				tool.config?.toolConfig?.apiSchema?.requestBodySchema?.properties || {}
			).map(([key, property]) => ({
				key,
				type: (property as ToolRequestBodyProperty).type,
				description: (property as ToolRequestBodyProperty).description,
				constantValue:
					(property as ToolRequestBodyProperty).constantValue || '',
				dynamicVariable:
					(property as ToolRequestBodyProperty).dynamicVariable || '',
				required:
					tool.config?.toolConfig?.apiSchema?.requestBodySchema?.required?.includes(
						key
					) || false,
			}));

			form.setValues({
				name: tool.name,
				description: tool.description,
				prompt: tool.prompt || '',
				identifier: tool.identifier,
				categoryId: tool.categoryId.toString(),
				status: tool.status,
				url: tool.config?.toolConfig?.apiSchema?.url || '',
				method: tool.config?.toolConfig?.apiSchema?.method || 'GET',
				responseTimeoutSecs: tool.config?.toolConfig?.responseTimeoutSecs || 30,
				headers,
				queryParameters: [],
				pathParameters,
				requestBodyProperties,
				authConnection:
					tool.config?.toolConfig?.apiSchema?.auth_connection || '',
			});
		}
	}, [tool, toolId]);

	const handleSubmit = async (values: FormValues) => {
		try {
			const requestHeaders = values.headers.reduce(
				(acc, header) => {
					if (header.key && header.value) {
						acc[header.key] = header.value;
					}
					return acc;
				},
				{} as Record<string, string>
			);

			const pathParamsSchema = values.pathParameters.reduce(
				(acc, param) => {
					if (param.key && param.value) {
						acc[param.key] = param.value;
					}
					return acc;
				},
				{} as Record<string, unknown>
			);

			const requestBodyProperties = values.requestBodyProperties.reduce(
				(acc, prop) => {
					if (prop.key) {
						acc[prop.key] = {
							type: prop.type,
							description: prop.description,
							constantValue: prop.constantValue || '',
							dynamicVariable: prop.dynamicVariable || '',
						};
					}
					return acc;
				},
				{} as Record<string, ToolRequestBodyProperty>
			);

			const requiredFields = values.requestBodyProperties
				.filter((prop) => prop.required && prop.key)
				.map((prop) => prop.key);

			// Only include request body schema for methods that support it
			const supportsRequestBody = ['POST', 'PUT', 'PATCH'].includes(
				values.method
			);

			const toolData: CreateToolDto = {
				name: values.name,
				description: values.description,
				prompt: values.prompt,
				categoryId: parseInt(values.categoryId),
				status: values.status,
				config: {
					name:
						values.identifier || values.name.toLowerCase().replace(/\s+/g, '_'),
					description: values.description,
					responseTimeoutSecs: values.responseTimeoutSecs,
					type: 'webhook',
					apiSchema: {
						url: values.url,
						method: values.method,
						requestHeaders,
						pathParamsSchema,
						...(supportsRequestBody && {
							requestBodySchema: {
								type: 'object',
								required: requiredFields,
								properties: requestBodyProperties,
							},
						}),
					},
				},
			};

			if (isEdit && toolId) {
				await updateToolMutation.mutateAsync({
					id: toolId,
					data: toolData,
				});
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('notifications.updated'),
					color: 'green',
					icon: <IconDeviceFloppy size={18} />,
				});
			} else {
				await createToolMutation.mutateAsync(toolData);
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('notifications.created'),
					color: 'green',
					icon: <IconDeviceFloppy size={18} />,
				});
			}

			onSuccess?.();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: t('notifications.failedGeneric', {
							action: isEdit
								? t('notifications.actions.update')
								: t('notifications.actions.create'),
						});
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: errorMessage,
				color: 'red',
				icon: <IconAlertCircle size={18} />,
			});
		}
	};

	const addHeader = () =>
		form.insertListItem('headers', { key: '', value: '' });
	const removeHeader = (index: number) => form.removeListItem('headers', index);

	const addQueryParameter = () =>
		form.insertListItem('queryParameters', { key: '', value: '' });
	const removeQueryParameter = (index: number) =>
		form.removeListItem('queryParameters', index);

	const addPathParameter = () =>
		form.insertListItem('pathParameters', { key: '', value: '' });
	const removePathParameter = (index: number) =>
		form.removeListItem('pathParameters', index);

	const addRequestBodyProperty = () =>
		form.insertListItem('requestBodyProperties', {
			key: '',
			type: 'string',
			description: '',
			constantValue: '',
			dynamicVariable: '',
			required: false,
		});
	const removeRequestBodyProperty = (index: number) =>
		form.removeListItem('requestBodyProperties', index);

	// Section status calculations
	const sectionStatus = useMemo(() => {
		const values = form.values;
		return {
			general: !!(
				values.name &&
				values.description &&
				values.prompt &&
				values.categoryId
			),
			api: !!(values.url && values.method),
			headers: values.headers.length > 0,
			parameters:
				values.pathParameters.length > 0 || values.queryParameters.length > 0,
			body: values.requestBodyProperties.length > 0,
		};
	}, [form.values]);

	const sectionErrors = useMemo(() => {
		const errors = form.errors;
		return {
			general: !!(
				errors.name ||
				errors.description ||
				errors.prompt ||
				errors.categoryId
			),
			api: !!errors.url,
			headers: false,
			parameters: false,
			body: false,
		};
	}, [form.errors]);

	// Map field names to their sections
	const fieldToSectionMap: Record<string, SectionId> = useMemo(
		() => ({
			name: 'general',
			description: 'general',
			prompt: 'general',
			categoryId: 'general',
			url: 'api',
			method: 'api',
			responseTimeoutSecs: 'api',
			authConnection: 'api',
		}),
		[]
	);

	// Handle validation errors on form submit
	const handleValidationErrors = (errors: typeof form.errors) => {
		const errorFields = Object.keys(errors);
		if (errorFields.length === 0) return;

		// Get unique sections with errors
		const sectionsWithErrors = new Set<SectionId>();
		errorFields.forEach((field) => {
			const section = fieldToSectionMap[field];
			if (section) {
				sectionsWithErrors.add(section);
			}
		});

		// Get section labels
		const sectionLabels = Array.from(sectionsWithErrors)
			.map((sectionId) => {
				const section = sections.find((s) => s.id === sectionId);
				return section?.label;
			})
			.filter(Boolean);

		if (sectionLabels.length > 0) {
			notifications.show({
				title: t('form.validation.incompleteTitle'),
				message: t('form.validation.incompleteMessage', {
					sections: sectionLabels.join(', '),
				}),
				color: 'orange',
				icon: <IconAlertCircle size={18} />,
				autoClose: 5000,
			});

			// Navigate to the first section with errors
			const firstSectionWithError = Array.from(sectionsWithErrors)[0];
			if (firstSectionWithError && firstSectionWithError !== activeSection) {
				setActiveSection(firstSectionWithError);
			}
		}
	};

	const categoryOptions = categories.map((cat: ToolCategoryModel) => ({
		value: cat.id.toString(),
		label: cat.name,
	}));

	// Filter sections based on HTTP method
	const visibleSections = sections.filter((section) => {
		if (section.id === 'body') {
			return ['POST', 'PUT', 'PATCH'].includes(form.values.method);
		}
		return true;
	});

	if (toolId && isLoadingTool) {
		return (
			<div className={styles.loadingState}>
				<Loader size='md' />
				<Text size='sm' c='dimmed' mt='xs'>
					{t('state.loadingTool')}
				</Text>
			</div>
		);
	}

	if (toolId && toolError) {
		return (
			<div className={styles.errorState}>
				<IconAlertCircle size={48} color='var(--mantine-color-red-5)' />
				<Text size='md' fw={500} c='red'>
					{t('state.errorLoadingTool')}
				</Text>
				<Text size='sm' c='dimmed'>
					{toolError.message}
				</Text>
			</div>
		);
	}

	const renderSectionContent = () => {
		switch (activeSection) {
			case 'general':
				return (
					<Stack gap='xs'>
						<TextInput
							label={t('form.fields.name.label')}
							placeholder={t('form.fields.name.placeholder')}
							required
							size='sm'
							{...form.getInputProps('name')}
						/>
						<Textarea
							label={t('form.fields.description.label')}
							placeholder={t('form.fields.description.placeholder')}
							required
							size='sm'
							minRows={2}
							{...form.getInputProps('description')}
						/>
						<Textarea
							label={t('form.fields.prompt.label')}
							placeholder={t('form.fields.prompt.placeholder')}
							required
							size='sm'
							minRows={2}
							{...form.getInputProps('prompt')}
						/>
						<Group grow gap='xs'>
							<Select
								label={t('form.fields.category.label')}
								placeholder={t('form.fields.category.placeholder')}
								required
								size='sm'
								data={categoryOptions}
								disabled={isLoadingCategories}
								{...form.getInputProps('categoryId')}
							/>
							<Select
								label={t('form.fields.status.label')}
								size='sm'
								data={[
									{ value: 'active', label: t('status.active') },
									{ value: 'inactive', label: t('status.inactive') },
								]}
								{...form.getInputProps('status')}
							/>
						</Group>
					</Stack>
				);

			case 'api':
				return (
					<Stack gap='xs'>
						<Group gap='xs' align='flex-start'>
							<Select
								label={t('form.fields.method.label')}
								data={HTTP_METHODS}
								size='sm'
								w={100}
								{...form.getInputProps('method')}
							/>
							<TextInput
								label={t('form.fields.url.label')}
								placeholder={t('form.fields.url.placeholder')}
								required
								size='sm'
								style={{ flex: 1 }}
								{...form.getInputProps('url')}
							/>
						</Group>
						<Group grow gap='xs'>
							<TextInput
								label={t('form.fields.timeout.label')}
								type='number'
								size='sm'
								{...form.getInputProps('responseTimeoutSecs')}
							/>
							<TextInput
								label={t('form.fields.authConnection.label')}
								placeholder={t('form.fields.authConnection.placeholder')}
								size='sm'
								{...form.getInputProps('authConnection')}
							/>
						</Group>
					</Stack>
				);

			case 'headers':
				return (
					<Stack gap='xs'>
						<Group justify='space-between' align='center'>
							<Text size='sm' fw={500}>
								{t('form.headers.title')}
							</Text>
							<Button
								variant='subtle'
								size='xs'
								leftSection={<IconPlus size={12} />}
								onClick={addHeader}
							>
								{t('form.headers.add')}
							</Button>
						</Group>
						{form.values.headers.length === 0 ? (
							<div className={styles.emptyState}>
								<Text size='xs' c='dimmed'>
									{t('form.headers.empty')}
								</Text>
							</div>
						) : (
							<div className={styles.parameterList}>
								{form.values.headers.map((_, index) => (
									<div key={index} className={styles.parameterItem}>
										<TextInput
											placeholder={t('form.headers.fields.keyPlaceholder')}
											size='xs'
											style={{ flex: 1 }}
											{...form.getInputProps(`headers.${index}.key`)}
										/>
										<TextInput
											placeholder={t('form.headers.fields.valuePlaceholder')}
											size='xs'
											style={{ flex: 1 }}
											{...form.getInputProps(`headers.${index}.value`)}
										/>
										<ActionIcon
											color='red'
											variant='subtle'
											size='sm'
											onClick={() => removeHeader(index)}
											data-testid={`remove-header-btn-${index}`}
										>
											<IconMinus size={12} />
										</ActionIcon>
									</div>
								))}
							</div>
						)}
					</Stack>
				);

			case 'parameters':
				return (
					<Stack gap='md'>
						{/* Path Parameters */}
						<Stack gap='xs'>
							<Group justify='space-between' align='center'>
								<Text size='sm' fw={500}>
									{t('form.parameters.path.title')}
								</Text>
								<Button
									variant='subtle'
									size='xs'
									leftSection={<IconPlus size={12} />}
									onClick={addPathParameter}
								>
									{t('form.parameters.add')}
								</Button>
							</Group>
							{form.values.pathParameters.length === 0 ? (
								<div className={styles.emptyState}>
									<Text size='xs' c='dimmed'>
										{t('form.parameters.path.empty')}
									</Text>
								</div>
							) : (
								<div className={styles.parameterList}>
									{form.values.pathParameters.map((_, index) => (
										<div key={index} className={styles.parameterItem}>
											<TextInput
												placeholder={t(
													'form.parameters.path.fields.keyPlaceholder'
												)}
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(`pathParameters.${index}.key`)}
											/>
											<TextInput
												placeholder={t(
													'form.parameters.path.fields.valuePlaceholder'
												)}
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(`pathParameters.${index}.value`)}
											/>
											<ActionIcon
												color='red'
												variant='subtle'
												size='sm'
												onClick={() => removePathParameter(index)}
												data-testid={`remove-path-param-btn-${index}`}
											>
												<IconMinus size={12} />
											</ActionIcon>
										</div>
									))}
								</div>
							)}
						</Stack>

						{/* Query Parameters */}
						<Stack gap='xs'>
							<Group justify='space-between' align='center'>
								<Text size='sm' fw={500}>
									{t('form.parameters.query.title')}
								</Text>
								<Button
									variant='subtle'
									size='xs'
									leftSection={<IconPlus size={12} />}
									onClick={addQueryParameter}
								>
									{t('form.parameters.add')}
								</Button>
							</Group>
							{form.values.queryParameters.length === 0 ? (
								<div className={styles.emptyState}>
									<Text size='xs' c='dimmed'>
										{t('form.parameters.query.empty')}
									</Text>
								</div>
							) : (
								<div className={styles.parameterList}>
									{form.values.queryParameters.map((_, index) => (
										<div key={index} className={styles.parameterItem}>
											<TextInput
												placeholder={t(
													'form.parameters.query.fields.keyPlaceholder'
												)}
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(`queryParameters.${index}.key`)}
											/>
											<TextInput
												placeholder={t(
													'form.parameters.query.fields.valuePlaceholder'
												)}
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(
													`queryParameters.${index}.value`
												)}
											/>
											<ActionIcon
												color='red'
												variant='subtle'
												size='sm'
												onClick={() => removeQueryParameter(index)}
												data-testid={`remove-query-param-btn-${index}`}
											>
												<IconMinus size={12} />
											</ActionIcon>
										</div>
									))}
								</div>
							)}
						</Stack>
					</Stack>
				);

			case 'body':
				return (
					<Stack gap='xs'>
						<Group justify='space-between' align='center'>
							<Text size='sm' fw={500}>
								{t('form.body.title')}
							</Text>
							<Button
								variant='subtle'
								size='xs'
								leftSection={<IconPlus size={12} />}
								onClick={addRequestBodyProperty}
							>
								{t('form.body.add')}
							</Button>
						</Group>
						{form.values.requestBodyProperties.length === 0 ? (
							<div className={styles.emptyState}>
								<Text size='xs' c='dimmed'>
									{t('form.body.empty')}
								</Text>
							</div>
						) : (
							<div className={styles.parameterList}>
								{form.values.requestBodyProperties.map((_, index) => (
									<div key={index} className={styles.bodyPropertyItem}>
										<Group gap='xs' mb='xs'>
											<TextInput
												placeholder={t('form.body.fields.keyPlaceholder')}
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(
													`requestBodyProperties.${index}.key`
												)}
											/>
											<Select
												placeholder={t('form.body.fields.typePlaceholder')}
												data={propertyTypeOptions}
												size='xs'
												w={100}
												{...form.getInputProps(
													`requestBodyProperties.${index}.type`
												)}
											/>
											<ActionIcon
												color='red'
												variant='subtle'
												size='sm'
												onClick={() => removeRequestBodyProperty(index)}
												data-testid={`remove-body-prop-btn-${index}`}
											>
												<IconMinus size={12} />
											</ActionIcon>
										</Group>
										<Textarea
											placeholder={t('form.body.fields.descriptionPlaceholder')}
											size='xs'
											minRows={1}
											mb='xs'
											{...form.getInputProps(
												`requestBodyProperties.${index}.description`
											)}
										/>
										<Group gap='xs'>
											<TextInput
												placeholder={t('form.body.fields.constantPlaceholder')}
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(
													`requestBodyProperties.${index}.constantValue`
												)}
											/>
											<TextInput
												placeholder={t('form.body.fields.dynamicPlaceholder')}
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(
													`requestBodyProperties.${index}.dynamicVariable`
												)}
											/>
										</Group>
									</div>
								))}
							</div>
						)}
					</Stack>
				);

			default:
				return null;
		}
	};

	return (
		<SectionCard
			icon={IconSettings}
			title={isEdit ? t('form.title.edit') : t('form.title.create')}
			description={t('form.description')}
			className={styles.modalShell}
			contentSpacing='xs'
			padding='md'
			headerActions={
				onCancel ? (
					<ActionIcon
						onClick={onCancel}
						variant='subtle'
						color='gray'
						size='sm'
					>
						<IconX size={16} />
					</ActionIcon>
				) : undefined
			}
		>
			<div className={styles.sectionCardBody}>
				<LoadingOverlay
					visible={createToolMutation.isPending || updateToolMutation.isPending}
				/>
				<form
					id='tool-form'
					onSubmit={form.onSubmit(handleSubmit, handleValidationErrors)}
					className={styles.formContent}
				>
					<div className={styles.contentGrid}>
						{/* Menu Column */}
						<div className={styles.menuColumn}>
							<div className={styles.menuHeader}>
								<Text size='xs' fw={500} c='dimmed'>
									{t('form.menu.sections')}
								</Text>
								<Badge size='xs' variant='light' color='gray' radius='sm'>
									{visibleSections.length}
								</Badge>
							</div>
							<ScrollArea className={styles.menuScroll} type='auto'>
								<Stack gap={2}>
									{visibleSections.map((section) => (
										<div
											key={section.id}
											className={styles.menuItem}
											data-active={activeSection === section.id}
											onClick={() => setActiveSection(section.id)}
											data-testid={`section-menu-${section.id}`}
										>
											<div className={styles.menuItemHeader}>
												<ThemeIcon
													size='xs'
													variant='light'
													color={activeSection === section.id ? 'blue' : 'gray'}
													radius='sm'
												>
													{section.icon}
												</ThemeIcon>
												<Text className={styles.menuTitle}>
													{section.label}
												</Text>
											</div>
											<div
												className={styles.statusDot}
												data-filled={sectionStatus[section.id]}
												data-error={sectionErrors[section.id]}
											/>
										</div>
									))}
								</Stack>
							</ScrollArea>
						</div>

						{/* Editor Column */}
						<div className={styles.editorColumn}>
							<div className={styles.editorShell}>
								<div className={styles.editorHeader}>
									<div className={styles.editorHeaderText}>
										<Text fw={600} size='sm'>
											{
												visibleSections.find((s) => s.id === activeSection)
													?.label
											}
										</Text>
									</div>
									<Badge
										size='xs'
										variant='light'
										color={sectionStatus[activeSection] ? 'green' : 'gray'}
										radius='sm'
									>
										{sectionStatus[activeSection]
											? t('form.sectionStatus.configured')
											: t('form.sectionStatus.empty')}
									</Badge>
								</div>
								<div className={styles.editorContent}>
									{renderSectionContent()}
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className={styles.footer}>
						<Text size='xs' c='dimmed'>
							{t('form.footer.hint')}
						</Text>
						<Group gap='xs'>
							<Button variant='subtle' size='xs' onClick={onCancel}>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
							<Button
								type='submit'
								size='xs'
								leftSection={<IconDeviceFloppy size={14} />}
								loading={
									createToolMutation.isPending || updateToolMutation.isPending
								}
								data-testid='submit-tool-btn'
							>
								{isEdit ? t('actions.saveChanges') : t('actions.createTool')}
							</Button>
						</Group>
					</div>
				</form>
			</div>
		</SectionCard>
	);
}

export default ToolForm;
