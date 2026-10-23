import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Anchor, Breadcrumbs, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import { RankingForm } from '../components/RankingForm';
import { RankingPublishedModal } from '../components/RankingPublishedModal';
import type {
	RankingProgram,
	RankingStatus,
} from '~/models/qa/rankingPrograms';
import { rankingPath, rankingsBasePath } from '../constants';
import { tabOf } from '../helpers';

/** Create or edit one ranking on its own page (route `rankings/new` or `rankings/:programId/edit`). */
export default function RankingEditorPage() {
	const { t } = useTranslation('qa.rankings');
	const location = useLocation();
	const navigate = useNavigate();
	const { programId } = useParams<{ programId: string }>();

	const role = roleFromPath(location.pathname);
	const programs = useRankingsStore(selectPrograms);
	// A brand-new ranking that just went live, while its celebration is open.
	const [published, setPublished] = useState<RankingProgram | null>(null);

	const mode = programId ? 'edit' : 'create';
	const program = programId
		? (programs.find((p) => p.id === programId) ?? null)
		: null;

	// Opened from a ranking's page, the editor brings the manager back there; otherwise to the list.
	const origin = location.state as { returnTo?: string; from?: string } | null;
	const toList = () =>
		navigate(`${rankingsBasePath(role)}${origin?.from ?? ''}`);
	const backToRankings = (status?: RankingStatus) => {
		if (origin?.returnTo) {
			navigate(origin.returnTo, { state: { from: origin.from } });
			return;
		}
		// Land on the tab where the saved ranking now lives (the store has already reconciled its status).
		const list = useRankingsStore.getState().programs;
		const saved = programId ? list.find((p) => p.id === programId) : list[0];
		const tab = status && saved ? tabOf(saved) : 'current';
		navigate(
			`${rankingsBasePath(role)}${tab === 'current' ? '' : `?tab=${tab}`}`
		);
	};

	if (mode === 'edit' && !program) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('page.notFound')} />
			</ContentContainer>
		);
	}

	const title =
		mode === 'create' ? t('editor.titleNew') : t('editor.titleEdit');

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' maw={720} mx='auto' px='md'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={toList}>
						{t('page.title')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{mode === 'edit' && program ? program.name : title}
					</Text>
				</Breadcrumbs>

				<Title order={1}>{title}</Title>

				<RankingForm
					// A fresh form per ranking, so switching rankings never keeps stale values.
					key={program?.id ?? 'new'}
					role={role}
					program={program}
					onClose={() => backToRankings()}
					onSaved={(status, saved) => {
						if (mode === 'create' && status === 'active') setPublished(saved);
						else backToRankings(status);
					}}
				/>
			</Stack>

			<RankingPublishedModal
				program={published}
				onClose={() => {
					const target = published;
					setPublished(null);
					if (target) navigate(rankingPath(role, target.id));
				}}
			/>
		</ContentContainer>
	);
}
