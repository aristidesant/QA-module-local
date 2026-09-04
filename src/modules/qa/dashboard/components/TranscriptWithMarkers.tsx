import React, { useState } from 'react';
import { Stack, Group, Badge, Text, Paper, Button } from '@mantine/core';
import { IconFlag } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

interface Marker {
	id: number;
	startTime: number;
	endTime: number;
	type: 'violation' | 'opportunity' | 'note';
	label: string;
	description: string;
	evaluatorComment: string;
	suggestion: string;
}

interface TranscriptSegment {
	id: number;
	timestamp: number;
	speaker: 'agent' | 'customer';
	text: string;
	markerId?: number;
}

interface TranscriptWithMarkersProps {
	segments: TranscriptSegment[];
	markers: Marker[];
	onMarkerClick?: (marker: Marker) => void;
}

const markerTypeColor = {
	violation: 'red',
	opportunity: 'blue',
	note: 'gray',
};

const markerTypeLabel = {
	violation: 'Violation',
	opportunity: 'Opportunity',
	note: 'Note',
};

export const TranscriptWithMarkers: React.FC<TranscriptWithMarkersProps> = ({
	segments,
	markers,
}) => {
	const [expandedMarkerId, setExpandedMarkerId] = useState<number | null>(null);

	const getMarkersForSegment = (segmentId: number) => {
		return markers.filter(m => {
			const segment = segments.find(s => s.id === segmentId);
			return segment && segment.timestamp >= m.startTime && segment.timestamp < m.endTime;
		});
	};

	return (
		<SectionCard title='Call Transcript' description='With automatic markers'>
			<Stack gap='md'>
				{segments.map(segment => {
					const segmentMarkers = getMarkersForSegment(segment.id);

					return (
						<div key={segment.id}>
							<Group gap='sm' mb='xs'>
								<Badge
									color={segment.speaker === 'agent' ? 'blue' : 'green'}
									variant='light'
									size='sm'
								>
									{segment.speaker === 'agent' ? 'Agent' : 'Customer'}
								</Badge>
								<Text size='xs' c='dimmed'>
									{Math.floor(segment.timestamp / 60)}:
									{String(segment.timestamp % 60).padStart(2, '0')}
								</Text>
							</Group>

							<Paper
								p='md'
								radius='md'
								style={{
									backgroundColor: segmentMarkers.length > 0
										? 'var(--mantine-color-red-0)'
										: 'var(--mantine-color-gray-0)',
									borderLeft: segmentMarkers.length > 0 ? '4px solid var(--mantine-color-red-5)' : 'none',
								}}
								mb='md'
							>
								<Text size='sm' style={{ lineHeight: 1.6 }}>
									{segment.text}
								</Text>

								{segmentMarkers.map(marker => (
									<Paper
										key={marker.id}
										mt='md'
										p='sm'
										bg='white'
										style={{ borderRadius: '4px' }}
										withBorder
									>
										<Group gap='sm'>
											<IconFlag size={16} color='var(--mantine-color-red-6)' />
											<Stack gap='xs' style={{ flex: 1 }}>
												<Group gap='xs'>
													<Badge
														color={markerTypeColor[marker.type]}
														size='sm'
													>
														{markerTypeLabel[marker.type]}
													</Badge>
													<Text size='sm' fw={500}>
														{marker.label}
													</Text>
												</Group>
												<Text size='xs' c='dimmed'>
													{marker.description}
												</Text>
												{expandedMarkerId === marker.id && (
													<Stack gap='xs' mt='sm'>
														<div>
															<Text size='xs' fw={500} c='dimmed'>
																Evaluator Comment:
															</Text>
															<Text size='sm'>
																{marker.evaluatorComment}
															</Text>
														</div>
														<div>
															<Text size='xs' fw={500} c='dimmed'>
																Suggested Improvement:
															</Text>
															<Text size='sm'>
																{marker.suggestion}
															</Text>
														</div>
													</Stack>
												)}
												<Button
													size='xs'
													variant='subtle'
													onClick={() =>
														setExpandedMarkerId(
															expandedMarkerId === marker.id ? null : marker.id
														)
													}
												>
													{expandedMarkerId === marker.id
														? 'Hide Details'
														: 'Show Details'}
												</Button>
											</Stack>
										</Group>
									</Paper>
								))}
							</Paper>
						</div>
					);
				})}
			</Stack>
		</SectionCard>
	);
};
