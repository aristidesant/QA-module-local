import React, { useState } from 'react';
import {
	Stack,
	Group,
	Button,
	Slider,
	Text,
	Badge,
	ActionIcon,
	Paper,
} from '@mantine/core';
import {
	IconPlayerPlay,
	IconPlayerPause,
	IconPlayerStop,
	IconVolume2,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

interface AudioClip {
	id: number;
	label: string;
	startTime: number;
	endTime: number;
	description: string;
}

interface AudioPlayerWithClippingProps {
	duration?: number;
	clips: AudioClip[];
	onClipSelect?: (clip: AudioClip) => void;
}

export const AudioPlayerWithClipping: React.FC<AudioPlayerWithClippingProps> = ({
	duration = 300,
	clips,
	onClipSelect,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [selectedClipId, setSelectedClipId] = useState<number | null>(null);
	const [volume, setVolume] = useState(80);

	const selectedClip = clips.find(c => c.id === selectedClipId);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${String(secs).padStart(2, '0')}`;
	};

	const handlePlayClip = (clip: AudioClip) => {
		setSelectedClipId(clip.id);
		setCurrentTime(clip.startTime);
		setIsPlaying(true);
		onClipSelect?.(clip);
	};

	return (
		<SectionCard
			title='Call Recording'
			description='Listen to the full recording or specific problem areas'
		>
			<Stack gap='lg'>
				<Paper p='md' radius='md' bg='gray'>
					<Stack gap='md'>
						<Group justify='space-between'>
							<Text fw={500} size='sm'>
								Full Recording
							</Text>
							<Text size='sm' c='dimmed'>
								{formatTime(currentTime)} / {formatTime(duration)}
							</Text>
						</Group>

						<Slider
							value={currentTime}
							onChange={setCurrentTime}
							max={duration}
							step={1}
							marks={[
								{ value: 0, label: '0:00' },
								{ value: Math.floor(duration / 2), label: formatTime(Math.floor(duration / 2)) },
								{ value: duration, label: formatTime(duration) },
							]}
						/>

						<Group justify='center' gap='md'>
							<ActionIcon
								size='lg'
								color='blue'
								variant='light'
								onClick={() => setIsPlaying(!isPlaying)}
							>
								{isPlaying ? (
									<IconPlayerPause size={20} />
								) : (
									<IconPlayerPlay size={20} />
								)}
							</ActionIcon>

							<ActionIcon
								size='lg'
								color='gray'
								variant='light'
								onClick={() => {
									setIsPlaying(false);
									setCurrentTime(0);
								}}
							>
								<IconPlayerStop size={20} />
							</ActionIcon>

							<Group gap='xs' ml='auto'>
								<IconVolume2 size={20} />
								<Slider
									value={volume}
									onChange={setVolume}
									max={100}
									step={1}
									style={{ width: 120 }}
								/>
								<Text size='sm' w={30}>
									{volume}%
								</Text>
							</Group>
						</Group>

						{isPlaying && (
							<Badge color='green' variant='dot' size='lg'>
								Now Playing
							</Badge>
						)}
					</Stack>
				</Paper>

				{selectedClip && (
					<Paper p='md' radius='md' bg='blue' opacity={0.05}>
						<Stack gap='sm'>
							<Group justify='space-between'>
								<div>
									<Text fw={500} size='sm'>
										{selectedClip.label}
									</Text>
									<Text size='xs' c='dimmed'>
										{formatTime(selectedClip.startTime)} -{' '}
										{formatTime(selectedClip.endTime)}
									</Text>
								</div>
								<Badge color='blue' variant='light'>
									Selected
								</Badge>
							</Group>
							<Text size='sm'>{selectedClip.description}</Text>
						</Stack>
					</Paper>
				)}

				<div>
					<Text fw={500} size='sm' mb='md'>
						Problem Areas (Auto-Detected)
					</Text>
					<Stack gap='sm'>
						{clips.map(clip => (
							<Paper
								key={clip.id}
								p='md'
								radius='md'
								withBorder
								style={{
									borderColor:
										selectedClipId === clip.id
											? 'var(--mantine-color-blue-5)'
											: 'var(--mantine-color-gray-3)',
									backgroundColor:
										selectedClipId === clip.id
											? 'var(--mantine-color-blue-0)'
											: 'transparent',
									cursor: 'pointer',
								}}
								onClick={() => handlePlayClip(clip)}
							>
								<Group justify='space-between'>
									<div>
										<Group gap='sm' mb='xs'>
											<Badge color='red' size='sm' variant='light'>
												Issue
											</Badge>
											<Text size='sm' fw={500}>
												{clip.label}
											</Text>
										</Group>
										<Text size='xs' c='dimmed'>
											{clip.description}
										</Text>
										<Text size='xs' c='dimmed' mt='xs'>
											{formatTime(clip.startTime)} -{' '}
											{formatTime(clip.endTime)}
										</Text>
									</div>
									<Button
										size='sm'
										variant='light'
										onClick={() => handlePlayClip(clip)}
									>
										Play Clip
									</Button>
								</Group>
							</Paper>
						))}
					</Stack>
				</div>
			</Stack>
		</SectionCard>
	);
};
