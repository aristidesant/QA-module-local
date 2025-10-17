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
} from '@mantine/core';
import type {
	CreateDispositionCatalog,
	DispositionCatalogModel,
} from '~/models/DispositionCatalogModels';
import RightSectionCard from '~/components/RightSectionCard';
import { IconForms } from '@tabler/icons-react';

type DispositionCatalogFormCoreProps = {
	onSubmit: (values: CreateDispositionCatalog) => void;
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

	return (
		<>
			<Stack gap='sm'>
				<form onSubmit={form.onSubmit((values) => onSubmit(values))}>
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
								<Button type='submit' loading={loading}>
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
