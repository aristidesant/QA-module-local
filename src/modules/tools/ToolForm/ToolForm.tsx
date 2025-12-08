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
import type { ToolModel, ToolRequestBodyProperty } from '~/models/ToolModel';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';
import SectionCard from '~/components/SectionCard/SectionCard';
import styles from './ToolForm.module.css';

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

const SECTIONS: Section[] = [
	{ id: 'general', label: 'General', icon: <IconSettings size={14} /> },
	{ id: 'api', label: 'API Config', icon: <IconApi size={14} /> },
	{ id: 'headers', label: 'Headers', icon: <IconKey size={14} /> },
	{ id: 'parameters', label: 'Parameters', icon: <IconRoute size={14} /> },
	{ id: 'body', label: 'Request Body', icon: <IconBraces size={14} /> },
];

const HTTP_METHODS = [
	{ value: 'GET', label: 'GET' },
	{ value: 'POST', label: 'POST' },
	{ value: 'PUT', label: 'PUT' },
	{ value: 'PATCH', label: 'PATCH' },
	{ value: 'DELETE', label: 'DELETE' },
];

const PROPERTY_TYPES = [
	{ value: 'string', label: 'String' },
	{ value: 'number', label: 'Number' },
	{ value: 'boolean', label: 'Boolean' },
	{ value: 'array', label: 'Array' },
	{ value: 'object', label: 'Object' },
];

function ToolForm({ toolId, categoryId, onSuccess, onCancel }: ToolFormProps) {
	const [isEdit, setIsEdit] = useState(!!toolId);
	const [activeSection, setActiveSection] = useState<SectionId>('general');

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
			name: (value) => (value.trim() ? null : 'Name is required'),
			description: (value) => (value.trim() ? null : 'Description is required'),
			categoryId: (value) => (value ? null : 'Category is required'),
			url: (value) => {
				if (!value.trim()) return 'URL is required';
				try {
					new URL(value);
					return null;
				} catch {
					return 'Please enter a valid URL';
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

			const toolData: Partial<ToolModel> = {
				name: values.name,
				description: values.description,
				prompt: values.prompt,
				identifier: values.identifier,
				categoryId: parseInt(values.categoryId),
				status: values.status,
				config: {
					id: isEdit ? tool?.config?.id || '' : `tool-${Date.now()}`,
					accessInfo: {
						role: 'creator',
						isCreator: true,
						creatorName: 'Current User',
						creatorEmail: 'user@example.com',
					},
					toolConfig: {
						name: values.name,
						type: 'http',
						description: values.description,
						responseTimeoutSecs: values.responseTimeoutSecs,
						apiSchema: {
							url: values.url,
							method: values.method,
							requestHeaders,
							auth_connection: values.authConnection || null,
							pathParamsSchema,
							requestBodySchema: {
								type: 'object',
								required: requiredFields,
								properties: requestBodyProperties,
								description: values.description,
							},
						},
						dynamicVariables: {
							dynamicVariablePlaceholders: {},
						},
					},
				},
			};

			if (isEdit && toolId) {
				await updateToolMutation.mutateAsync({
					id: toolId,
					data: toolData,
				});
				notifications.show({
					title: 'Success',
					message: 'Tool updated successfully!',
					color: 'green',
					icon: <IconDeviceFloppy size={18} />,
				});
			} else {
				await createToolMutation.mutateAsync(toolData);
				notifications.show({
					title: 'Success',
					message: 'Tool created successfully!',
					color: 'green',
					icon: <IconDeviceFloppy size={18} />,
				});
			}

			onSuccess?.();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: `Failed to ${isEdit ? 'update' : 'create'} tool`;
			notifications.show({
				title: 'Error',
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
			general: !!(values.name && values.description && values.categoryId),
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
			general: !!(errors.name || errors.description || errors.categoryId),
			api: !!errors.url,
			headers: false,
			parameters: false,
			body: false,
		};
	}, [form.errors]);

	const categoryOptions = categories.map((cat: ToolCategoryModel) => ({
		value: cat.id.toString(),
		label: cat.name,
	}));

	// Filter sections based on HTTP method
	const visibleSections = SECTIONS.filter((section) => {
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
					Loading tool...
				</Text>
			</div>
		);
	}

	if (toolId && toolError) {
		return (
			<div className={styles.errorState}>
				<IconAlertCircle size={48} color='var(--mantine-color-red-5)' />
				<Text size='md' fw={500} c='red'>
					Error loading tool
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
							label='Name'
							placeholder='e.g., Get Weather'
							required
							size='sm'
							{...form.getInputProps('name')}
						/>
						<Textarea
							label='Description'
							placeholder='What does this tool do?'
							required
							size='sm'
							minRows={2}
							{...form.getInputProps('description')}
						/>
						<Textarea
							label='Prompt Instruction'
							placeholder='Instructions for the agent on how/when to use this tool'
							size='sm'
							minRows={2}
							{...form.getInputProps('prompt')}
						/>
						<Group grow gap='xs'>
							<Select
								label='Category'
								placeholder='Select category'
								required
								size='sm'
								data={categoryOptions}
								disabled={isLoadingCategories}
								{...form.getInputProps('categoryId')}
							/>
							<Select
								label='Status'
								size='sm'
								data={[
									{ value: 'active', label: 'Active' },
									{ value: 'inactive', label: 'Inactive' },
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
								label='Method'
								data={HTTP_METHODS}
								size='sm'
								w={100}
								{...form.getInputProps('method')}
							/>
							<TextInput
								label='Endpoint URL'
								placeholder='https://api.example.com/v1/resource'
								required
								size='sm'
								style={{ flex: 1 }}
								{...form.getInputProps('url')}
							/>
						</Group>
						<Group grow gap='xs'>
							<TextInput
								label='Timeout (seconds)'
								type='number'
								size='sm'
								{...form.getInputProps('responseTimeoutSecs')}
							/>
							<TextInput
								label='Auth Connection'
								placeholder='e.g., github-oauth'
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
								Request Headers
							</Text>
							<Button
								variant='subtle'
								size='xs'
								leftSection={<IconPlus size={12} />}
								onClick={addHeader}
							>
								Add Header
							</Button>
						</Group>
						{form.values.headers.length === 0 ? (
							<div className={styles.emptyState}>
								<Text size='xs' c='dimmed'>
									No headers configured
								</Text>
							</div>
						) : (
							<div className={styles.parameterList}>
								{form.values.headers.map((_, index) => (
									<div key={index} className={styles.parameterItem}>
										<TextInput
											placeholder='Header name'
											size='xs'
											style={{ flex: 1 }}
											{...form.getInputProps(`headers.${index}.key`)}
										/>
										<TextInput
											placeholder='Value'
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
									Path Parameters
								</Text>
								<Button
									variant='subtle'
									size='xs'
									leftSection={<IconPlus size={12} />}
									onClick={addPathParameter}
								>
									Add
								</Button>
							</Group>
							{form.values.pathParameters.length === 0 ? (
								<div className={styles.emptyState}>
									<Text size='xs' c='dimmed'>
										No path parameters
									</Text>
								</div>
							) : (
								<div className={styles.parameterList}>
									{form.values.pathParameters.map((_, index) => (
										<div key={index} className={styles.parameterItem}>
											<TextInput
												placeholder='Parameter name'
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(`pathParameters.${index}.key`)}
											/>
											<TextInput
												placeholder='Description'
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
									Query Parameters
								</Text>
								<Button
									variant='subtle'
									size='xs'
									leftSection={<IconPlus size={12} />}
									onClick={addQueryParameter}
								>
									Add
								</Button>
							</Group>
							{form.values.queryParameters.length === 0 ? (
								<div className={styles.emptyState}>
									<Text size='xs' c='dimmed'>
										No query parameters
									</Text>
								</div>
							) : (
								<div className={styles.parameterList}>
									{form.values.queryParameters.map((_, index) => (
										<div key={index} className={styles.parameterItem}>
											<TextInput
												placeholder='Parameter name'
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(`queryParameters.${index}.key`)}
											/>
											<TextInput
												placeholder='Description'
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
								Request Body Properties
							</Text>
							<Button
								variant='subtle'
								size='xs'
								leftSection={<IconPlus size={12} />}
								onClick={addRequestBodyProperty}
							>
								Add Property
							</Button>
						</Group>
						{form.values.requestBodyProperties.length === 0 ? (
							<div className={styles.emptyState}>
								<Text size='xs' c='dimmed'>
									No body properties configured
								</Text>
							</div>
						) : (
							<div className={styles.parameterList}>
								{form.values.requestBodyProperties.map((_, index) => (
									<div key={index} className={styles.bodyPropertyItem}>
										<Group gap='xs' mb='xs'>
											<TextInput
												placeholder='Property name'
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(
													`requestBodyProperties.${index}.key`
												)}
											/>
											<Select
												placeholder='Type'
												data={PROPERTY_TYPES}
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
											placeholder='Description'
											size='xs'
											minRows={1}
											mb='xs'
											{...form.getInputProps(
												`requestBodyProperties.${index}.description`
											)}
										/>
										<Group gap='xs'>
											<TextInput
												placeholder='Constant value'
												size='xs'
												style={{ flex: 1 }}
												{...form.getInputProps(
													`requestBodyProperties.${index}.constantValue`
												)}
											/>
											<TextInput
												placeholder='Dynamic variable'
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
			title={isEdit ? 'Edit Tool' : 'Create New Tool'}
			description='Configure your tool settings and API details'
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
					onSubmit={form.onSubmit(handleSubmit)}
					className={styles.formContent}
				>
					<div className={styles.contentGrid}>
						{/* Menu Column */}
						<div className={styles.menuColumn}>
							<div className={styles.menuHeader}>
								<Text size='xs' fw={500} c='dimmed'>
									Sections
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
										{sectionStatus[activeSection] ? 'Configured' : 'Empty'}
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
							Fill in required fields to save
						</Text>
						<Group gap='xs'>
							<Button variant='subtle' size='xs' onClick={onCancel}>
								Cancel
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
								{isEdit ? 'Save Changes' : 'Create Tool'}
							</Button>
						</Group>
					</div>
				</form>
			</div>
		</SectionCard>
	);
}

export default ToolForm;
