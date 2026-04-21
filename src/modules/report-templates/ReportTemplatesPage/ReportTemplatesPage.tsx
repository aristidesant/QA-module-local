import { Outlet } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

const ReportTemplatesPage = () => {
	return (
		<ContentContainer>
			<Outlet />
		</ContentContainer>
	);
};

export default ReportTemplatesPage;
