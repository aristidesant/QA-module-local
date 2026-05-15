import type { FC } from 'react';
import { useForm } from '@mantine/form';
import {
	TextInput,
	Textarea,
	Switch,
	Button,
	Stack,
	Group,
	Divider,
	Alert,
	Text,
} from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { useTranslation } from 'react-i18next';
import classes from './DispositionCatalogForm.module.css';
import type {
	CreateDispositionCatalog,
	DispositionCatalogModel,
} from '~/models/DispositionCatalogModels';
import { IconInfoCircle } from '@tabler/icons-react';
import { useCreateDispositionNode } from '~/queries/dispositionNodesQueries';
import { OUTBOUND_PROTECTED_ROOT_NODE_DEFAULTS } from '../../constants';

type DispositionCatalogFormCoreProps = {
	onSubmit: (
		values: CreateDispositionCatalog
	) => Promise<DispositionCatalogModel>;
	onSuccess?: (catalog: DispositionCatalogModel) => void;
	onError?: (error: unknown) => void;
	loading?: boolean;
};

type DispositionCatalogFormCreateProps = {
	mode: 'create';
	initialValues?: Partial<CreateDispositionCatalog>;
};

type DispositionCatalogFormEditProps = {
	mode: 'edit';
	initialValues: DispositionCatalogModel;
};

type DispositionCatalogFormProps = DispositionCatalogFormCoreProps &
	(DispositionCatalogFormCreateProps | DispositionCatalogFormEditProps);

const DispositionCatalogForm: FC<DispositionCatalogFormProps> = ({
	initialValues,
	onSubmit,
	onSuccess,
	onError,
	loading = false,
	mode,
}) => {
	const { t } = useTranslation('outcomes');
	const form = useForm<CreateDispositionCatalog>({
		initialValues: {
			name: initialValues?.name || '',
			description: initialValues?.description || '',
			campaignId: initialValues?.campaignId || undefined,
			isDefault: initialValues?.isDefault || false,
			type:
				(initialValues as Partial<DispositionCatalogModel>)?.type || 'OUTBOUND',
		},
		validate: {
			name: (value) => (!value ? t('formCatalog.nameRequired') : null),
		},
	});
	const createNode = useCreateDispositionNode();

	const handleSubmit = async (values: CreateDispositionCatalog) => {
		try {
			const catalog = await onSubmit(values);

			// If we're creating an outbound catalog, create the protected default root nodes
			if (mode === 'create' && catalog.type === 'OUTBOUND') {
				await Promise.all(
					OUTBOUND_PROTECTED_ROOT_NODE_DEFAULTS.map((node) =>
						createNode.mutateAsync({
							data: {
								...node,
								catalogId: catalog.id,
								parentId: undefined,
							},
						})
					)
				);
			}

			onSuccess?.(catalog);
		} catch (error) {
			onError?.(error);
		}
	};

	return (
		<form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
			<Stack gap='md'>
				<Stack gap='xs'>
					<Text
						size='xs'
						fw={600}
						tt='uppercase'
						c='dimmed'
						className={classes.sectionLabel}
					>
						{t('formCatalog.sectionIdentity', 'Identity')}
					</Text>
					<TextInput
						label={t('formCatalog.name')}
						placeholder={t('formCatalog.namePlaceholder')}
						required
						{...form.getInputProps('name')}
					/>
					<div>
						<Text size='sm' fw={500} mb={6}>
							{t('formCatalog.type')}
						</Text>
						<AppSegmentedControl
							fullWidth
							data={[
								{ value: 'INBOUND', label: t('formCatalog.typeInbound') },
								{ value: 'OUTBOUND', label: t('formCatalog.typeOutbound') },
							]}
							{...form.getInputProps('type')}
						/>
					</div>
					{mode === 'create' && form.values.type === 'OUTBOUND' && (
						<Alert
							icon={<IconInfoCircle size={16} />}
							variant='light'
							color='blue'
							styles={{
								root: {
									background: '#ecf8fd',
									borderColor: 'rgba(0,152,212,0.25)',
								},
								icon: { color: '#0098d4' },
								message: { color: '#007aae' },
							}}
						>
							{t('formCatalog.outboundAlert')}
						</Alert>
					)}
				</Stack>
				<Divider />
				<Stack gap='xs'>
					<Text
						size='xs'
						fw={600}
						tt='uppercase'
						c='dimmed'
						className={classes.sectionLabel}
					>
						{t('formCatalog.sectionConfig', 'Configuration')}
					</Text>
					<Textarea
						label={t('formCatalog.descriptionLabel')}
						placeholder={t('formCatalog.descriptionPlaceholder')}
						autosize
						minRows={3}
						{...form.getInputProps('description')}
					/>
					<Switch
						label={t('formCatalog.defaultCatalog')}
						{...form.getInputProps('isDefault', { type: 'checkbox' })}
					/>
				</Stack>
				<Divider />
				<Group justify='flex-end'>
					<Button type='submit' loading={loading || createNode.isPending}>
						{mode === 'edit'
							? t('formCatalog.submitEdit')
							: t('formCatalog.submitCreate')}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default DispositionCatalogForm;
