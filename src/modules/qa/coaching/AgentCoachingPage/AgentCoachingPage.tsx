import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { AgentCoachingTab } from '~/modules/qa/lms/AgentLmsPage/tabs/AgentCoachingTab';

/**
 * The agent's own Coaching page — was previously a tab inside My Learning,
 * now its own sidebar entry. `AgentCoachingTab` needs no props: it derives
 * everything from the coaching store and the hardcoded agent persona.
 */
export default function AgentCoachingPage() {
	const { t } = useTranslation('qa.lms');

	return (
		<ContentContainer
			contentWidth='full'
			title={t('agent.coaching.title')}
			description={t('agent.coaching.description')}
		>
			<AgentCoachingTab />
		</ContentContainer>
	);
}
