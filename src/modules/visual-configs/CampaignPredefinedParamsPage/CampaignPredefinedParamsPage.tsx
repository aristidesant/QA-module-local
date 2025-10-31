import { useMemo, useEffect } from 'react';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import CampaignPredefinedParamsList from './CampaignPredefinedParamsList';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import ContentContainer from '~/components/ContentContainer';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import useCampaignPredefinedParamsStore from './store/useCampaignPredefinedParamsStore';
import CampaignPredefinedParamsDetail from './CampaignPredefinedParamsDetail';
import CampaignPredefinedParamsForm from './CampaignPredefinedParamsForm';

const CampaignPredefinedParamsPage = () => {
	const { data } = useClientConfigByName('campaign_predefined_params');
	const {
		rightComponent,
		setRightComponent,
		clearRightComponent,
		setSelectedParam,
		setMode,
	} = useCampaignPredefinedParamsStore();

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
			<CampaignPredefinedParamsList data={list} onRowClick={handleRowClick} />
		</ContentContainer>
	);
};

export default CampaignPredefinedParamsPage;
