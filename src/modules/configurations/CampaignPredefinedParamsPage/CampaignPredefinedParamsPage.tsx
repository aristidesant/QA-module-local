import { useMemo, useEffect, useState } from 'react';
import {
	useClientConfigByName,
	useUpdateClientConfig,
} from '~/queries/useClientConfigs';
import CampaignPredefinedParamsList from './CampaignPredefinedParamsList';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import ContentContainer from '~/components/ContentContainer';
import { Button, Modal, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import useCampaignPredefinedParamsStore from './store/useCampaignPredefinedParamsStore';
import CampaignPredefinedParamsDetail from './CampaignPredefinedParamsDetail';
import CampaignPredefinedParamsForm from './CampaignPredefinedParamsForm';

const CampaignPredefinedParamsPage = () => {
	const { data } = useClientConfigByName('campaign_predefined_params');
	const updateMutation = useUpdateClientConfig();
	const {
		rightComponent,
		setRightComponent,
		clearRightComponent,
		setSelectedParam,
		setMode,
	} = useCampaignPredefinedParamsStore();
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [paramToDelete, setParamToDelete] =
		useState<CampaignPredefinedParam | null>(null);

	const list = useMemo<CampaignPredefinedParam[]>(() => {
		if (!data?.value) return [];
		try {
			return JSON.parse(data.value);
		} catch {
			return [];
		}
	}, [data]);

	const handleRowClick = (param: CampaignPredefinedParam) => {
		setSelectedParam(param);
		setMode('view');
		setRightComponent(
			<CampaignPredefinedParamsDetail param={param} list={list} config={data} />
		);
	};

	const handleAddNew = () => {
		setSelectedParam(null);
		setMode('create');
		setRightComponent(
			<CampaignPredefinedParamsForm list={list} config={data} />
		);
	};

	const handleDeleteClick = (param: CampaignPredefinedParam) => {
		setParamToDelete(param);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!paramToDelete || !data) return;

		try {
			const updatedList = list.filter((p) => p.name !== paramToDelete.name);

			await updateMutation.mutateAsync({
				name: data.name,
				data: {
					description: data.description,
					value: JSON.stringify(updatedList),
					type: data.type,
				},
			});

			setDeleteModalOpen(false);
			setParamToDelete(null);
			clearRightComponent();
		} catch (error) {
			console.error('Failed to delete parameter:', error);
		}
	};

	useEffect(() => {
		return () => {
			clearRightComponent();
		};
	}, [clearRightComponent]);

	return (
		<ContentContainer
			title='Campaign Predefined Params'
			description='Modify the default params'
			rightSection={rightComponent || <></>}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={handleAddNew}
					size='sm'
				>
					Add New
				</Button>
			}
		>
			<Modal
				opened={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				title='Delete Parameter'
				centered
				size='sm'
			>
				<Text size='sm' mb='md'>
					Are you sure you want to delete &quot;{paramToDelete?.name}&quot;?
					This action cannot be undone.
				</Text>
				<div
					style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}
				>
					<Button
						variant='default'
						size='xs'
						onClick={() => setDeleteModalOpen(false)}
					>
						Cancel
					</Button>
					<Button
						color='red'
						size='xs'
						onClick={handleConfirmDelete}
						loading={updateMutation.isPending}
					>
						Delete
					</Button>
				</div>
			</Modal>
			<CampaignPredefinedParamsList
				data={list}
				onRowClick={handleRowClick}
				onDelete={handleDeleteClick}
			/>
		</ContentContainer>
	);
};

export default CampaignPredefinedParamsPage;
