import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Stack, Text, Title } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import { inboxRoleFromPath } from '~/modules/qa/inbox/constants';
import { DisputeCasesContent } from './DisputeCasesContent';

/** Role-aware dispute list page (supervisor / QA Manager). The agent sees the same content as a My Calls tab. */
export const DisputeCasesPage: React.FC = () => {
	const { t } = useTranslation('qa.disputes');
	const role = inboxRoleFromPath(useLocation().pathname);
	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
						{t(`cases.page.eyebrow.${role}`)}
					</Text>
					<Title order={1}>{t('cases.page.title')}</Title>
					<Text c='dimmed' mt='xs'>
						{t(`cases.page.description.${role}`)}
					</Text>
				</div>
				<DisputeCasesContent />
			</Stack>
		</ContentContainer>
	);
};

export default DisputeCasesPage;
