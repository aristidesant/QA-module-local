import { useMemo, useState } from 'react';
import { SimpleGrid, Stack } from '@mantine/core';
import { IconMasksTheater } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { RolePlayModel } from '~/models/qa';
import { RolePlayModelCard } from '../../components/RolePlayModelCard';
import { RolePlayDetailDrawer } from '../../components/RolePlayDetailDrawer';
import { notifySuccess } from '~/modules/qa/utils/notifications';

interface RolePlayTabProps {
	models: RolePlayModel[];
	agentId: string;
}

export function RolePlayTab({ models, agentId }: RolePlayTabProps) {
	const { t } = useTranslation('qa.lms');
	const [selected, setSelected] = useState<RolePlayModel | null>(null);

	const available = useMemo(
		() => models.filter((m) => m.unlockedForAgentIds.includes(agentId)),
		[models, agentId]
	);

	const handleStart = (model: RolePlayModel) => {
		setSelected(null);
		notifySuccess(t('agent.rolePlay.practiceStarted', { name: model.name }));
	};

	if (!available.length) {
		return <EmptyState message={t('agent.rolePlay.noneAvailable')} />;
	}

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('agent.rolePlay.available')}
				description={t('agent.rolePlay.availableDescription')}
				icon={IconMasksTheater}
			>
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='md'>
					{available.map((model) => (
						<RolePlayModelCard
							key={model.id}
							model={model}
							onOpen={() => setSelected(model)}
						/>
					))}
				</SimpleGrid>
			</SectionCard>

			<RolePlayDetailDrawer
				model={selected}
				opened={selected !== null}
				onClose={() => setSelected(null)}
				onStart={handleStart}
			/>
		</Stack>
	);
}

export default RolePlayTab;
