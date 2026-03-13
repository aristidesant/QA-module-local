import { Select } from '@mantine/core';
import useCampaignDashboardViewerStore from '../store/useCampaignDashboardViewerStore';
import type { DashboardOption } from '../types';
import styles from './CampaignDashboardViewerFilter.module.css';

interface CampaignDashboardViewerFilterProps {
	data: DashboardOption[];
	disabled: boolean;
}

const CampaignDashboardViewerFilter = ({
	data,
	disabled,
}: CampaignDashboardViewerFilterProps) => {
	const selectedDashboardId = useCampaignDashboardViewerStore(
		(state) => state.selectedDashboardId
	);
	const setSelectedDashboardId = useCampaignDashboardViewerStore(
		(state) => state.setSelectedDashboardId
	);

	return (
		<Select
			value={selectedDashboardId}
			onChange={setSelectedDashboardId}
			data={data}
			allowDeselect={false}
			className={styles.select}
			size='sm'
			disabled={disabled}
		/>
	);
};

export default CampaignDashboardViewerFilter;
