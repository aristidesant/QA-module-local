import { useEffect, useMemo, useState } from 'react';
import { Loader, LoadingOverlay, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconAlertCircle,
	IconApi,
	IconBraces,
	IconKey,
	IconRoute,
	IconSettings,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	useToolById,
	useCreateTool,
	useUpdateTool,
} from '~/queries/toolQueries';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import type {
	CreateToolDto,
	ToolRequestBodyProperty,
} from '~/models/ToolModel';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';
import SectionCard from '~/components/SectionCard/SectionCard';
import styles from './ToolForm.module.css';
import ToolFormApiSection from './ToolFormApiSection/ToolFormApiSection';
import ToolFormAuthSection from './ToolFormAuthSection/ToolFormAuthSection';
import ToolFormBasicSection from './ToolFormBasicSection/ToolFormBasicSection';
import ToolFormBodySection from './ToolFormBodySection/ToolFormBodySection';
import ToolFormFooterActions from './ToolFormFooterActions/ToolFormFooterActions';
import ToolFormOverview from './ToolFormOverview/ToolFormOverview';
import ToolFormHeadersSection from './ToolFormHeadersSection/ToolFormHeadersSection';
import ToolFormParametersSection from './ToolFormParametersSection/ToolFormParametersSection';
import ToolFormSectionsNav from './ToolFormSectionsNav/ToolFormSectionsNav';
import {
	getFirstPendingSection,
	getMethodSupportsBody,
	getToolPayload,
	getVisibleSections,
} from './toolForm.utils';
import type {
	FormValues,
	Section,
	SectionId,
	SectionMetaMap,
} from './toolForm.types';

interface ToolFormProps {
	toolId?: string | number;
	categoryId?: string | number;
	onSuccess?: () => void;
	onCancel?: () => void;
}

const sectionsFactory = (
	t: (key: string, options?: Record<string, unknown>) => string
): Section[] => [
	{
		id: 'basic',
		label: t('form.sections.basic'),
		description: t('form.sections.basicDesc'),
		icon: <IconSettings size={14} />,
	},
	{
		id: 'api',
		label: t('form.sections.api'),
		description: t('form.sections.apiDesc'),
		icon: <IconApi size={14} />,
	},
	{
		id: 'auth',
		label: t('form.sections.auth'),
		description: t('form.sections.authDesc'),
		icon: <IconKey size={14} />,
	},
	{
		id: 'headers',
		label: t('form.sections.headers'),
		description: t('form.sections.headersDesc'),
		icon: <IconRoute size={14} />,
	},
	{
		id: 'parameters',
		label: t('form.sections.parameters'),
		description: t('form.sections.parametersDesc'),
		icon: <IconBraces size={14} />,
	},
	{
		id: 'body',
		label: t('form.sections.body'),
		description: t('form.sections.bodyDesc'),
		icon: <IconBraces size={14} />,
	},
];

function ToolForm({ toolId, categoryId, onSuccess, onCancel }: ToolFormProps) {
	const { t } = useTranslation('tools');
	const [isEdit, setIsEdit] = useState(!!toolId);
	const [activeSection, setActiveSection] = useState<SectionId>('basic');

	const sections = useMemo(() => sectionsFactory(t), [t]);
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
			const payload = getToolPayload(values);
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
						requestHeaders: payload.requestHeaders,
						pathParamsSchema: payload.pathParamsSchema,
						...(payload.supportsRequestBody && {
							requestBodySchema: {
								type: 'object',
								required: payload.requiredFields,
								properties: payload.requestBodyProperties,
							},
						}),
					},
				},
			};

			if (isEdit && toolId) {
				await updateToolMutation.mutateAsync({ id: toolId, data: toolData });
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('notifications.updated'),
					color: 'green',
				});
			} else {
				await createToolMutation.mutateAsync(toolData);
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('notifications.created'),
					color: 'green',
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

	const sectionStatus = useMemo(() => {
		const values = form.values;
		return {
			basic: !!(
				values.name &&
				values.description &&
				values.prompt &&
				values.categoryId
			),
			api: !!(values.url && values.method),
			auth: !!values.authConnection,
			headers: values.headers.length > 0,
			parameters:
				values.pathParameters.length > 0 || values.queryParameters.length > 0,
			body: values.requestBodyProperties.length > 0,
		} as Record<SectionId, boolean>;
	}, [form.values]);

	const visibleSections = getVisibleSections(sections, form.values.method);
	const methodSupportsBody = getMethodSupportsBody(form.values.method);

	const sectionErrors = useMemo(() => {
		const errors = form.errors;
		return {
			basic: !!(
				errors.name ||
				errors.description ||
				errors.prompt ||
				errors.categoryId
			),
			api: !!errors.url,
			auth: false,
			headers: false,
			parameters: false,
			body: false,
		} as Record<SectionId, boolean>;
	}, [form.errors]);

	const sectionMeta = useMemo(() => {
		const meta: SectionMetaMap = {
			basic: {
				required: true,
				applicable: true,
				state: sectionErrors.basic
					? 'error'
					: sectionStatus.basic
						? 'complete'
						: 'empty',
			},
			api: {
				required: true,
				applicable: true,
				state: sectionErrors.api
					? 'error'
					: sectionStatus.api
						? 'complete'
						: 'empty',
			},
			auth: {
				required: false,
				applicable: true,
				state: sectionStatus.auth ? 'complete' : 'optional',
			},
			headers: {
				required: false,
				applicable: true,
				state: sectionStatus.headers ? 'complete' : 'optional',
			},
			parameters: {
				required: false,
				applicable: true,
				state: sectionStatus.parameters ? 'complete' : 'optional',
			},
			body: {
				required: false,
				applicable: methodSupportsBody,
				state: !methodSupportsBody
					? 'inactive'
					: sectionStatus.body
						? 'complete'
						: 'optional',
			},
		};

		if (
			meta[activeSection]?.applicable &&
			meta[activeSection].state !== 'complete' &&
			meta[activeSection].state !== 'error'
		) {
			meta[activeSection] = {
				...meta[activeSection],
				state: 'current',
			};
		}

		return meta;
	}, [activeSection, methodSupportsBody, sectionErrors, sectionStatus]);

	const firstPendingSection = useMemo(
		() => getFirstPendingSection(visibleSections, sectionMeta),
		[visibleSections, sectionMeta]
	);
	const remainingRequiredSections = useMemo(
		() =>
			visibleSections.filter((section) => {
				const meta = sectionMeta[section.id];
				return meta?.required && meta.state !== 'complete';
			}),
		[visibleSections, sectionMeta]
	);

	const currentSection =
		visibleSections.find((section) => section.id === activeSection) ??
		visibleSections[0];

	useEffect(() => {
		if (!visibleSections.some((section) => section.id === activeSection)) {
			setActiveSection(visibleSections[0]?.id ?? 'basic');
		}
	}, [activeSection, visibleSections]);

	const fieldToSectionMap: Record<string, SectionId> = useMemo(
		() => ({
			name: 'basic',
			description: 'basic',
			prompt: 'basic',
			categoryId: 'basic',
			url: 'api',
			method: 'api',
			responseTimeoutSecs: 'api',
			authConnection: 'auth',
		}),
		[]
	);

	const handleValidationErrors = (errors: typeof form.errors) => {
		const errorFields = Object.keys(errors);
		if (!errorFields.length) return;

		const sectionsWithErrors = new Set<SectionId>();
		errorFields.forEach((field) => {
			const section = fieldToSectionMap[field];
			if (section) sectionsWithErrors.add(section);
		});

		const orderedSections = sections.filter((section) =>
			sectionsWithErrors.has(section.id)
		);
		if (orderedSections.length > 0) {
			notifications.show({
				title: t('form.validation.incompleteTitle'),
				message: t('form.validation.incompleteMessage', {
					sections: orderedSections.map((section) => section.label).join(', '),
				}),
				color: 'orange',
				icon: <IconAlertCircle size={18} />,
				autoClose: 5000,
			});
			const firstSectionWithError = orderedSections[0]?.id;
			if (firstSectionWithError) setActiveSection(firstSectionWithError);
		}
	};

	const categoryOptions = categories.map((cat: ToolCategoryModel) => ({
		value: cat.id.toString(),
		label: cat.name,
	}));

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

	return (
		<SectionCard
			icon={IconSettings}
			title={isEdit ? t('form.title.edit') : t('form.title.create')}
			description={t('form.description')}
			className={styles.modalShell}
			contentSpacing='sm'
			padding='lg'
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
					<ToolFormOverview
						sections={visibleSections}
						sectionMeta={sectionMeta}
						activeSection={currentSection?.id ?? 'basic'}
						nextSection={firstPendingSection?.id ?? null}
						remainingRequiredSections={remainingRequiredSections.length}
						t={
							t as unknown as (
								key: string,
								options?: Record<string, unknown>
							) => string
						}
					/>

					<div className={styles.contentGrid}>
						<ToolFormSectionsNav
							sections={visibleSections}
							activeSection={activeSection}
							sectionMeta={sectionMeta}
							onSelectSection={setActiveSection}
							t={
								t as unknown as (
									key: string,
									options?: Record<string, unknown>
								) => string
							}
						/>

						<div className={styles.editorColumn}>
							<div className={styles.editorShell}>
								<div className={styles.editorContent}>
									{activeSection === 'basic' && (
										<ToolFormBasicSection
											form={form}
											categoryOptions={categoryOptions}
											isLoadingCategories={isLoadingCategories}
											t={
												t as unknown as (
													key: string,
													options?: Record<string, unknown>
												) => string
											}
										/>
									)}
									{activeSection === 'api' && (
										<ToolFormApiSection
											form={form}
											t={
												t as unknown as (
													key: string,
													options?: Record<string, unknown>
												) => string
											}
										/>
									)}
									{activeSection === 'auth' && (
										<ToolFormAuthSection
											form={form}
											t={
												t as unknown as (
													key: string,
													options?: Record<string, unknown>
												) => string
											}
										/>
									)}
									{activeSection === 'headers' && (
										<ToolFormHeadersSection
											form={form}
											t={
												t as unknown as (
													key: string,
													options?: Record<string, unknown>
												) => string
											}
										/>
									)}
									{activeSection === 'parameters' && (
										<ToolFormParametersSection
											form={form}
											t={
												t as unknown as (
													key: string,
													options?: Record<string, unknown>
												) => string
											}
										/>
									)}
									{activeSection === 'body' && methodSupportsBody && (
										<ToolFormBodySection
											form={form}
											propertyTypeOptions={propertyTypeOptions}
											t={
												t as unknown as (
													key: string,
													options?: Record<string, unknown>
												) => string
											}
										/>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className={styles.footer}>
						<ToolFormFooterActions
							isSubmitting={
								createToolMutation.isPending || updateToolMutation.isPending
							}
							isEdit={isEdit}
							remainingRequiredSections={remainingRequiredSections.length}
							onCancel={onCancel}
							t={
								t as unknown as (
									key: string,
									options?: Record<string, unknown>
								) => string
							}
						/>
					</div>
				</form>
			</div>
		</SectionCard>
	);
}

export default ToolForm;
