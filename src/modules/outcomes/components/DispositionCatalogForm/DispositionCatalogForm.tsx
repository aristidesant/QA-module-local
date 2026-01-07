import type { FC } from 'react';
import { useForm } from '@mantine/form';
import {
	TextInput,
	Textarea,
	Switch,
	SegmentedControl,
	Button,
	Stack,
	Group,
	Divider,
	Alert,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type {
	CreateDispositionCatalog,
	DispositionCatalogModel,
} from '~/models/DispositionCatalogModels';
import RightSectionCard from '~/components/RightSectionCard';
import { IconForms, IconInfoCircle } from '@tabler/icons-react';
import { useCreateDispositionNode } from '~/queries/dispositionNodesQueries';
import { OUTBOUND_PROTECTED_ROOT_NODE_DEFAULTS } from '../../constants';

import styles from './DispositionCatalogForm.module.css';

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
		<>
			<Stack gap='sm'>
				<form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
					<RightSectionCard
						icon={IconForms}
						iconColor='red'
						title={t('formCatalog.detailsTitle')}
						description={t('formCatalog.detailsDescription')}
					>
						<Stack gap='sm'>
							<TextInput
								label={t('formCatalog.name')}
								placeholder={t('formCatalog.namePlaceholder')}
								required
								{...form.getInputProps('name')}
							/>
							<div className={styles.typeField}>
								<label className={styles.typeLabel}>
									{t('formCatalog.type')}
								</label>
								<SegmentedControl
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
								>
									{t('formCatalog.outboundAlert')}
								</Alert>
							)}
							<Textarea
								label={t('formCatalog.descriptionLabel')}
								placeholder={t('formCatalog.descriptionPlaceholder')}
								autosize
								minRows={4}
								{...form.getInputProps('description')}
							/>
							<Divider my='xs' />
							<Group justify='space-between' align='center'>
								<Switch
									label={t('formCatalog.defaultCatalog')}
									{...form.getInputProps('isDefault', { type: 'checkbox' })}
								/>
								<Button type='submit' loading={loading || createNode.isPending}>
									{mode === 'edit'
										? t('formCatalog.submitEdit')
										: t('formCatalog.submitCreate')}
								</Button>
							</Group>
						</Stack>
					</RightSectionCard>
				</form>
			</Stack>
		</>
	);
};

export default DispositionCatalogForm;
