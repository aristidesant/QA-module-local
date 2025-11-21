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
import type {
	CreateDispositionCatalog,
	DispositionCatalogModel,
} from '~/models/DispositionCatalogModels';
import RightSectionCard from '~/components/RightSectionCard';
import { IconForms, IconInfoCircle } from '@tabler/icons-react';
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
	const form = useForm<CreateDispositionCatalog>({
		initialValues: {
			name: initialValues?.name || '',
			description: initialValues?.description || '',
			campaignId: initialValues?.campaignId || undefined,
			isDefault: initialValues?.isDefault || false,
			type:
				(initialValues as Partial<DispositionCatalogModel>)?.type || undefined,
		},
		validate: {
			name: (value) => (!value ? 'Name is required' : null),
		},
	});
	const createNode = useCreateDispositionNode();

	const handleSubmit = async (values: CreateDispositionCatalog) => {
		try {
			const catalog = await onSubmit(values);
			if (mode === 'create' && values.type === 'OUTBOUND' && catalog?.id) {
				try {
					for (const defaultNode of OUTBOUND_PROTECTED_ROOT_NODE_DEFAULTS) {
						await createNode.mutateAsync({
							data: {
								...defaultNode,
								catalogId: catalog.id,
								parentId: null,
							},
						});
					}
				} catch (nodeError: any) {
					const message =
						nodeError?.message ||
						'Failed to initialize default outbound outcomes.';
					throw new Error(message);
				}
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
						title='Catalog Details'
						description='Basic information about the catalog'
					>
						<Stack gap='sm'>
							<TextInput
								label='Name'
								placeholder='Catalog name'
								required
								{...form.getInputProps('name')}
							/>
							<div>
								<label
									style={{
										display: 'block',
										marginBottom: '8px',
										fontSize: '14px',
										fontWeight: 500,
									}}
								>
									Type
								</label>
								<SegmentedControl
									fullWidth
									data={[
										{ value: 'INBOUND', label: 'Inbound' },
										{ value: 'OUTBOUND', label: 'Outbound' },
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
									Default outcomes will be created automatically: Effective
									Contact, No Effective Contact, and No Contact.
								</Alert>
							)}
							<Textarea
								label='Description'
								placeholder='Catalog description'
								autosize
								minRows={4}
								{...form.getInputProps('description')}
							/>
							<Divider my='xs' />
							<Group justify='space-between' align='center'>
								<Switch
									label='Default catalog'
									{...form.getInputProps('isDefault', { type: 'checkbox' })}
								/>
								<Button type='submit' loading={loading || createNode.isPending}>
									{mode === 'edit' ? 'Update Catalog' : 'Create Catalog'}
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
