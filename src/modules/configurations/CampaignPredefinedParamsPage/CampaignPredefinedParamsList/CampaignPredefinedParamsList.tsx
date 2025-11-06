import BaseTable from '~/components/BaseTable/BaseTable';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import useCampaignPredefinedParamsColumns from './useCampaignPredefinedParamsColumns';

interface CampaignPredefinedParamsListProps {
	data: CampaignPredefinedParam[];
	onRowClick?: (param: CampaignPredefinedParam) => void;
	onDelete?: (param: CampaignPredefinedParam) => void;
}

const CampaignPredefinedParamsList: React.FC<
	CampaignPredefinedParamsListProps
> = ({ data, onRowClick, onDelete }) => {
	const columns = useCampaignPredefinedParamsColumns({ onDelete });

	return <BaseTable data={data} columns={columns} onRowClick={onRowClick} />;
};

export default CampaignPredefinedParamsList;
