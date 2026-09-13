import { useMemo, useState } from 'react';
import { Chip, Group, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { IconLibrary, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { LmsAssignment, LmsArea, LmsContent, LmsFormat } from '~/models/qa';
import { LMS_AREAS, LMS_AREA_META, LMS_FORMATS } from '../../constants';
import { ContentCard } from '../../components/ContentCard';

interface CatalogTabProps {
	content: LmsContent[];
	assignments: LmsAssignment[];
	onOpen: (contentId: string) => void;
	onEnrol: (contentId: string) => void;
}

export function CatalogTab({ content, assignments, onOpen, onEnrol }: CatalogTabProps) {
	const { t } = useTranslation('qa.lms');
	const [search, setSearch] = useState('');
	const [format, setFormat] = useState<string>('all');
	const [areas, setAreas] = useState<string[]>([]);

	const published = useMemo(() => content.filter((c) => c.status === 'PUBLISHED'), [content]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return published.filter((c) => {
			if (q && !c.title.toLowerCase().includes(q) && !c.tags.some((tag) => tag.includes(q))) return false;
			if (format !== 'all' && c.format !== (format as LmsFormat)) return false;
			if (areas.length && !areas.includes(c.area)) return false;
			return true;
		});
	}, [published, search, format, areas]);

	const openByContent = useMemo(
		() => new Set(assignments.filter((a) => a.status !== 'COMPLETED').map((a) => a.contentId)),
		[assignments]
	);

	const grouped = LMS_AREAS.map((area) => ({
		area: area as LmsArea,
		items: filtered.filter((c) => c.area === area),
	})).filter((g) => g.items.length > 0);

	return (
		<SectionCard
			title={t('agent.catalog.title')}
			description={t('agent.catalog.description')}
			icon={IconLibrary}
			headerActions={
				<Text size='sm' c='dimmed'>
					{t('agent.catalog.count', { count: filtered.length })}
				</Text>
			}
		>
			<Stack gap='md'>
				<Group gap='sm' align='flex-end' wrap='wrap'>
					<TextInput
						size='sm'
						placeholder={t('agent.catalog.search')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						miw={220}
					/>
					<AppSegmentedControl
						size='sm'
						value={format}
						onChange={setFormat}
						data={[
							{ label: t('agent.catalog.all'), value: 'all' },
							...LMS_FORMATS.map((f) => ({ label: t(`formats.${f}`), value: f })),
						]}
					/>
					<Chip.Group multiple value={areas} onChange={setAreas}>
						<Group gap='xs'>
							{LMS_AREAS.map((area) => (
								<Chip key={area} value={area} size='xs' variant='outline' color={LMS_AREA_META[area].color}>
									{t(LMS_AREA_META[area].labelKey)}
								</Chip>
							))}
						</Group>
					</Chip.Group>
				</Group>

				{grouped.length === 0 ? (
					<EmptyState message={t('agent.catalog.empty')} />
				) : (
					grouped.map((group) => (
						<Stack key={group.area} gap='xs'>
							<Title order={5} c={LMS_AREA_META[group.area].color}>
								{t(LMS_AREA_META[group.area].labelKey)}
							</Title>
							<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing='md'>
								{group.items.map((c) => (
									<ContentCard
										key={c.id}
										content={c}
										onOpen={() => onOpen(c.id)}
										onEnrol={openByContent.has(c.id) ? undefined : () => onEnrol(c.id)}
										assignment={openByContent.has(c.id) ? assignments.find((a) => a.contentId === c.id) : undefined}
									/>
								))}
							</SimpleGrid>
						</Stack>
					))
				)}
			</Stack>
		</SectionCard>
	);
}
