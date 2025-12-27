import BaseTable from '~/components/BaseTable/BaseTable';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';
import { useTranslation } from 'react-i18next';
import useSchedulerPredefinedParamsColumns from './useSchedulerPredefinedParamsColumns';

interface SchedulerPredefinedParamsListProps {
	data: PredefinedScheduleConfig[];
	onRowClick?: (param: PredefinedScheduleConfig) => void;
	onDelete?: (param: PredefinedScheduleConfig) => void;
}

const SchedulerPredefinedParamsList: React.FC<
	SchedulerPredefinedParamsListProps
> = ({ data, onRowClick, onDelete }) => {
	const { t } = useTranslation('scheduler-predefined-params');
	const columns = useSchedulerPredefinedParamsColumns({ onDelete });

	return (
		<BaseTable
			data={data}
			columns={columns}
			onRowClick={onRowClick}
			getRowId={(row) => row.name}
			density='compact'
			emptyMessage={t('list.emptyMessage')}
		/>
	);
};

export default SchedulerPredefinedParamsList;
