import { useTeamStore } from '~/stores/qa/teamStore';
import type { AgentProfile, TeamRole } from '../../types';
import { NotesPanel } from '../../components/NotesPanel';

interface NotesTabProps {
	profile: AgentProfile;
	role: TeamRole;
}

export function NotesTab({ profile, role }: NotesTabProps) {
	const addNote = useTeamStore((s) => s.addNote);
	const togglePinNote = useTeamStore((s) => s.togglePinNote);

	return (
		<NotesPanel
			notes={profile.notes}
			onAdd={(text) => addNote(profile.agent.id, text, role)}
			onTogglePin={(id) => togglePinNote(profile.agent.id, id)}
		/>
	);
}
