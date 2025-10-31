import BaseTable from '~/components/BaseTable/BaseTable';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import useCampaignPredefinedParamsColumns from './useCampaignPredefinedParamsColumns';

interface CampaignPredefinedParamsListProps {
	data: CampaignPredefinedParam[];
	onRowClick?: (param: CampaignPredefinedParam) => void;
}

const CampaignPredefinedParamsList: React.FC<
	CampaignPredefinedParamsListProps
> = ({ data, onRowClick }) => {
	const columns = useCampaignPredefinedParamsColumns();

	return <BaseTable data={data} columns={columns} onRowClick={onRowClick} />;
};

export default CampaignPredefinedParamsList;
