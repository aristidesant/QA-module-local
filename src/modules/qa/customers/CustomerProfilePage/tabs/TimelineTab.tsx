import { useState } from 'react';
import { Grid } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { useCustomersStore } from '~/stores/qa/customersStore';
import type { TeamRole } from '~/modules/qa/team/types';
import type { CustomerEventType, CustomerProfile } from '../../types';
import { CustomerTimeline } from '../../components/CustomerTimeline';
import { CustomerNotesPanel } from '../../components/CustomerNotesPanel';

interface TimelineTabProps {
	profile: CustomerProfile;
	role: TeamRole;
	autoFocusNote?: boolean;
}

export function TimelineTab({ profile, role, autoFocusNote }: TimelineTabProps) {
	const { t } = useTranslation('qa.customers');
	const [filter, setFilter] = useState<CustomerEventType | 'all'>('all');
	const addNote = useCustomersStore((s) => s.addNote);

	return (
		<Grid gap='md'>
			<Grid.Col span={{ base: 12, md: 7 }}>
				<SectionCard title={t('timeline.title')} icon={IconHistory}>
					<CustomerTimeline events={profile.timeline} filter={filter} onFilterChange={setFilter} />
				</SectionCard>
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 5 }}>
				<CustomerNotesPanel
					notes={profile.notes}
					onAdd={(text) => addNote(profile.customer.id, text, role)}
					autoFocus={autoFocusNote}
				/>
			</Grid.Col>
		</Grid>
	);
}
