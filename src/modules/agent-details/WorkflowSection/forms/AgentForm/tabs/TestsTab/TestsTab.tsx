import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import mainStyles from '../../AgentForm.module.css';

const TestsTab = () => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);

	return (
		<div className={mainStyles.placeholderCard}>
			<Text size='xs' c='dimmed'>
				{t('form.workflow.forms.agent.placeholders.tests')}
			</Text>
		</div>
	);
};

export default TestsTab;
