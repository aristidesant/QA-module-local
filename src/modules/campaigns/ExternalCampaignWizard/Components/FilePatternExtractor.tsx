import { useEffect, useState } from 'react';
import { Select, Stack, Text } from '@mantine/core';
import { PatternTag } from '../ExternalCampaignWizard';

interface FilePatternExtractorProps {
	onPatternsChange: (patterns: PatternTag[], delimiter: string) => void;
}

interface GlobalPattern {
	id: string;
	name: string;
	description: string;
	tags: PatternTag[];
	delimiter: string;
}

// Mock global patterns - configured in admin/settings section
const GLOBAL_PATTERNS: GlobalPattern[] = [
	{
		id: 'pattern_1',
		name: 'Standard Call Format',
		description: 'Client ID _ Date _ Time',
		tags: [
			{ id: 'tag_0', value: 'ACME', fieldType: 'clientId', order: 1 },
			{ id: 'tag_1', value: '20260810', fieldType: 'date', order: 2 },
			{ id: 'tag_2', value: '143022', fieldType: 'time', order: 3 },
		],
		delimiter: '_',
	},
	{
		id: 'pattern_2',
		name: 'Agent-Based Format',
		description: 'Client ID - Agent ID - Date - Time',
		tags: [
			{ id: 'tag_0', value: 'ACME', fieldType: 'clientId', order: 1 },
			{ id: 'tag_1', value: 'AGENT001', fieldType: 'agentId', order: 2 },
			{ id: 'tag_2', value: '20260810', fieldType: 'date', order: 3 },
			{ id: 'tag_3', value: '143022', fieldType: 'time', order: 4 },
		],
		delimiter: '-',
	},
	{
		id: 'pattern_3',
		name: 'Contact Number Format',
		description: 'Contact Number _ Date _ Time',
		tags: [
			{
				id: 'tag_0',
				value: '+14155550172',
				fieldType: 'contactNumber',
				order: 1,
			},
			{ id: 'tag_1', value: '20260810', fieldType: 'date', order: 2 },
			{ id: 'tag_2', value: '143022', fieldType: 'time', order: 3 },
		],
		delimiter: '_',
	},
];

export default function FilePatternExtractor({
	onPatternsChange,
}: FilePatternExtractorProps) {
	const [selectedGlobalPattern, setSelectedGlobalPattern] =
		useState<string>('');

	// Handle global pattern selection
	useEffect(() => {
		if (selectedGlobalPattern) {
			const pattern = GLOBAL_PATTERNS.find(
				(p) => p.id === selectedGlobalPattern
			);
			if (pattern) {
				onPatternsChange(pattern.tags, pattern.delimiter);
			}
		}
	}, [selectedGlobalPattern]);

	return (
		<Stack gap='md'>
			<div>
				{/* inline-style-allow: */}
				<h3
					style={{
						fontSize: 'var(--mantine-font-size-md)',
						fontWeight: 500,
						margin: '0 0 var(--mantine-spacing-sm) 0',
					}}
				>
					File Naming Pattern
				</h3>
				{/* inline-style-allow: */}
				<p
					style={{
						fontSize: 'var(--mantine-font-size-sm)',
						color: 'var(--mantine-color-gray-6)',
						margin: 0,
					}}
				>
					Select a file naming pattern from your organization's library
				</p>
			</div>

			<Select
				label='Global File Naming Pattern'
				placeholder='Select a pattern'
				value={selectedGlobalPattern}
				onChange={(value) => setSelectedGlobalPattern(value || '')}
				data={GLOBAL_PATTERNS.map((p) => ({
					value: p.id,
					label: `${p.name} — ${p.description}`,
				}))}
				searchable
				required
			/>

			{selectedGlobalPattern && (
				<>
					{/* inline-style-allow: */}
					<div
						style={{
							padding: 'var(--mantine-spacing-md)',
							backgroundColor: 'var(--mantine-color-green-0)',
							borderRadius: 'var(--mantine-radius-md)',
							border: '1px solid var(--mantine-color-green-2)',
						}}
					>
						<Text size='sm' c='green.9' fw={500}>
							✓ Pattern selected and configured
						</Text>
					</div>
				</>
			)}
		</Stack>
	);
}
