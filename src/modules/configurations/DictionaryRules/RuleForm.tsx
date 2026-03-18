import { useCallback, useEffect } from 'react';
import {
	Button,
	Divider,
	Group,
	List,
	LoadingOverlay,
	Popover,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type { AxiosError } from 'axios';
import type {
	PronunciationRule,
	RuleCategory,
	RuleType,
} from '~/models/PronunciationDictionaryModel';
import {
	useCreateRule,
	useUpdateRule,
} from '~/queries/pronunciationDictionaryQueries';
import styles from './RuleForm.module.css';

interface RuleFormProps {
	dictionaryId: number;
	initialData?: PronunciationRule | null;
	onClose: () => void;
	onSuccess: () => void;
}

interface RuleFormValues {
	grapheme: string;
	ruleType: RuleType;
	alias: string;
	phoneme: string;
	locale: string;
	description: string;
	category: RuleCategory;
}

const DEFAULT_VALUES: RuleFormValues = {
	grapheme: '',
	ruleType: 'ALIAS',
	alias: '',
	phoneme: '',
	locale: '',
	description: '',
	category: 'GENERAL',
};

export function RuleForm({
	dictionaryId,
	initialData,
	onClose,
	onSuccess,
}: RuleFormProps) {
	const { t } = useTranslation('dictionary-rules');
	const isEdit = Boolean(initialData);

	const createRule = useCreateRule(dictionaryId);
	const updateRule = useUpdateRule(dictionaryId);
	const isLoading = createRule.isPending || updateRule.isPending;

	const form = useForm<RuleFormValues>({
		initialValues: DEFAULT_VALUES,
		validate: {
			grapheme: (value) =>
				value.trim() ? null : t('form.fields.grapheme.required'),
			alias: (value, values) =>
				values.ruleType === 'ALIAS' && !value.trim()
					? t('form.fields.alias.required')
					: null,
			phoneme: (value, values) =>
				values.ruleType === 'PHONEME' && !value.trim()
					? t('form.fields.phoneme.required')
					: null,
		},
	});

	useEffect(() => {
		if (!initialData) {
			form.setValues(DEFAULT_VALUES);
			form.clearErrors();
			return;
		}

		form.setValues({
			grapheme: initialData.grapheme,
			ruleType: initialData.ruleType,
			alias: initialData.alias || '',
			phoneme: initialData.phoneme || '',
			locale: initialData.locale || '',
			description: initialData.description || '',
			category: initialData.category ?? 'GENERAL',
		});
		form.clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialData]);

	const handleSuccess = useCallback(() => {
		notifications.show({
			title: 'Success',
			message: isEdit
				? t('rules.notifications.updateSuccess')
				: t('rules.notifications.createSuccess'),
			color: 'green',
		});
		onSuccess();
	}, [isEdit, onSuccess, t]);

	const handleError = useCallback(
		(error: unknown) => {
			const fallback = isEdit
				? t('rules.notifications.updateError')
				: t('rules.notifications.createError');
			const apiMessage =
				(error as AxiosError<{ message?: string }>)?.response?.data?.message ??
				fallback;
			notifications.show({
				title: 'Error',
				message: apiMessage,
				color: 'red',
			});
		},
		[isEdit, t]
	);

	const handleSubmit = useCallback(
		(values: RuleFormValues) => {
			const payload = {
				grapheme: values.grapheme.trim(),
				ruleType: values.ruleType,
				...(values.ruleType === 'ALIAS'
					? { alias: values.alias.trim() }
					: { phoneme: values.phoneme.trim() }),
				...(values.locale ? { locale: values.locale.trim() } : {}),
				...(values.description
					? { description: values.description.trim() }
					: {}),
				category: values.category,
			};

			if (isEdit && initialData) {
				updateRule.mutate(
					{ ruleId: initialData.id, params: payload },
					{ onSuccess: handleSuccess, onError: handleError }
				);
			} else {
				createRule.mutate(payload, {
					onSuccess: handleSuccess,
					onError: handleError,
				});
			}
		},
		[isEdit, initialData, createRule, updateRule, handleSuccess, handleError]
	);

	const ruleTypeOptions = [
		{ label: t('form.fields.ruleType.alias'), value: 'ALIAS' },
		{ label: t('form.fields.ruleType.phoneme'), value: 'PHONEME' },
	];

	return (
		<Stack pos='relative' className={styles.formRoot} gap='sm'>
			<LoadingOverlay visible={isLoading} />

			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className={styles.formElement}
			>
				{/* Word section */}
				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<div className={styles.sectionHeaderText}>
							<Text size='sm' fw={600}>
								{t('form.sections.word.title')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('form.sections.word.description')}
							</Text>
						</div>
					</div>
					<TextInput
						label={t('form.fields.grapheme.label')}
						placeholder={t('form.fields.grapheme.placeholder')}
						required
						size='sm'
						radius='md'
						key={form.key('grapheme')}
						{...form.getInputProps('grapheme')}
						disabled={isEdit}
					/>
					<Text size='xs' c='dimmed' className={styles.hintText}>
						{t('form.hints.caseSensitive')}
					</Text>
				</section>

				<Divider />

				{/* Pronunciation section */}
				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<div className={styles.sectionHeaderText}>
							<Text size='sm' fw={600}>
								{t('form.sections.pronunciation.title')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('form.sections.pronunciation.description')}
							</Text>
						</div>
					</div>

					<SegmentedControl
						data={ruleTypeOptions}
						value={form.values.ruleType}
						onChange={(value) =>
							form.setFieldValue('ruleType', value as RuleType)
						}
						size='sm'
						fullWidth
					/>

					{form.values.ruleType === 'ALIAS' ? (
						<>
							<TextInput
								label={t('form.fields.alias.label')}
								placeholder={t('form.fields.alias.placeholder')}
								required
								size='sm'
								radius='md'
								key={form.key('alias')}
								{...form.getInputProps('alias')}
							/>
							<Text size='xs' c='dimmed' className={styles.hintText}>
								{t('form.hints.alias')}
							</Text>
						</>
					) : (
						<>
							<TextInput
								label={
									<Group gap={4} align='center'>
										<Text size='sm' inherit>
											{t('form.fields.phoneme.label')}
										</Text>
										<Popover
											width={320}
											position='top-start'
											withArrow
											shadow='md'
										>
											<Popover.Target>
												<IconInfoCircle
													size={16}
													className={styles.infoIcon}
													aria-label={t('form.arpabet.triggerLabel')}
												/>
											</Popover.Target>
											<Popover.Dropdown>
												<Stack gap='xs'>
													<Text size='sm' fw={600}>
														{t('form.arpabet.title')}
													</Text>
													<Text size='xs' c='dimmed'>
														{t('form.arpabet.description')}
													</Text>
													<List
														size='xs'
														spacing={4}
														className={styles.arpabetList}
													>
														<List.Item>
															{t('form.arpabet.items.stress')}
														</List.Item>
														<List.Item>
															{t('form.arpabet.items.spacing')}
														</List.Item>
														<List.Item>
															{t('form.arpabet.items.example')}
														</List.Item>
													</List>
													<Text size='xs' className={styles.arpabetExample}>
														{t('form.arpabet.reference')}
													</Text>
												</Stack>
											</Popover.Dropdown>
										</Popover>
									</Group>
								}
								placeholder={t('form.fields.phoneme.placeholder')}
								required
								size='sm'
								radius='md'
								ff='monospace'
								key={form.key('phoneme')}
								{...form.getInputProps('phoneme')}
							/>
							<Text size='xs' c='dimmed' className={styles.hintText}>
								{t('form.hints.phoneme')}
							</Text>
						</>
					)}
				</section>

				<Divider />

				{/* Metadata section */}
				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<div className={styles.sectionHeaderText}>
							<Text size='sm' fw={600}>
								{t('form.sections.metadata.title')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('form.sections.metadata.description')}
							</Text>
						</div>
					</div>

					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
						<TextInput
							label={t('form.fields.locale.label')}
							placeholder={t('form.fields.locale.placeholder')}
							size='sm'
							radius='md'
							key={form.key('locale')}
							{...form.getInputProps('locale')}
						/>
						<Select
							label={t('form.fields.category.label')}
							placeholder={t('form.fields.category.placeholder')}
							size='sm'
							radius='md'
							data={[
								{
									value: 'GENERAL',
									label: t('form.fields.category.options.GENERAL'),
								},
								{
									value: 'NAME',
									label: t('form.fields.category.options.NAME'),
								},
								{
									value: 'LAST_NAME',
									label: t('form.fields.category.options.LAST_NAME'),
								},
								{
									value: 'CITY',
									label: t('form.fields.category.options.CITY'),
								},
								{
									value: 'PROVINCE',
									label: t('form.fields.category.options.PROVINCE'),
								},
							]}
							key={form.key('category')}
							{...form.getInputProps('category')}
						/>
					</SimpleGrid>

					<Textarea
						label={t('form.fields.description.label')}
						placeholder={t('form.fields.description.placeholder')}
						size='sm'
						radius='md'
						autosize
						minRows={2}
						key={form.key('description')}
						{...form.getInputProps('description')}
					/>
				</section>

				<Divider />

				<Group justify='flex-end' className={styles.actions}>
					<Button variant='default' size='sm' type='button' onClick={onClose}>
						{t('form.buttons.cancel')}
					</Button>
					<Button type='submit' size='sm' loading={isLoading}>
						{isEdit ? t('form.buttons.update') : t('form.buttons.create')}
					</Button>
				</Group>
			</form>
		</Stack>
	);
}
