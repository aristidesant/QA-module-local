import { useState } from 'react';
import { Grid } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { useTeamStore } from '~/stores/qa/teamStore';
import type { ActivityType, AgentProfile, TeamRole } from '../../types';
import { ActivityTimeline } from '../../components/ActivityTimeline';
import { NotesPanel } from '../../components/NotesPanel';

interface ActivityTabProps {
	profile: AgentProfile;
	role: TeamRole;
}

export function ActivityTab({ profile, role }: ActivityTabProps) {
	const { t } = useTranslation('qa.team');
	const [filter, setFilter] = useState<ActivityType | 'all'>('all');
	const addNote = useTeamStore((s) => s.addNote);
	const togglePinNote = useTeamStore((s) => s.togglePinNote);

	return (
		<Grid gutter='md'>
			<Grid.Col span={{ base: 12, md: 7 }}>
				<SectionCard title={t('activity.title')} icon={IconHistory}>
					<ActivityTimeline events={profile.activity} filter={filter} onFilterChange={setFilter} />
				</SectionCard>
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 5 }}>
				<NotesPanel
					notes={profile.notes}
					onAdd={(text) => addNote(profile.agent.id, text, role)}
					onTogglePin={(id) => togglePinNote(profile.agent.id, id)}
				/>
			</Grid.Col>
		</Grid>
	);
}
