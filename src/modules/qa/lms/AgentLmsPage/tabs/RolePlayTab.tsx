import { useMemo, useState } from 'react';
import { SimpleGrid, Stack, Text } from '@mantine/core';
import { IconLock, IconMasksTheater } from '@tabler/icons-react';
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
	const locked = useMemo(
		() => models.filter((m) => !m.unlockedForAgentIds.includes(agentId)),
		[models, agentId]
	);

	const handleStart = (model: RolePlayModel) => {
		setSelected(null);
		notifySuccess(t('agent.rolePlay.practiceStarted', { name: model.name }));
	};

	if (!models.length) {
		return <EmptyState message={t('agent.rolePlay.empty')} />;
	}

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('agent.rolePlay.available')}
				description={t('agent.rolePlay.availableDescription')}
				icon={IconMasksTheater}
			>
				{available.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('agent.rolePlay.noneAvailable')}
					</Text>
				) : (
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						{available.map((model) => (
							<RolePlayModelCard
								key={model.id}
								model={model}
								locked={false}
								onOpen={() => setSelected(model)}
							/>
						))}
					</SimpleGrid>
				)}
			</SectionCard>

			{locked.length > 0 && (
				<SectionCard
					title={t('agent.rolePlay.locked')}
					description={t('agent.rolePlay.lockedDescription')}
					icon={IconLock}
				>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						{locked.map((model) => (
							<RolePlayModelCard
								key={model.id}
								model={model}
								locked
								onOpen={() => {}}
							/>
						))}
					</SimpleGrid>
				</SectionCard>
			)}

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
