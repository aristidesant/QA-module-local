import { useEffect, useRef, useState } from "react";
import { useDebouncedFilters } from "./AgentVoicesFilter/useDebouncedFilters";
import { useGetAllAgentVoices } from "~/queries/agentVoiceQueries";
import { Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { IconMicrophone } from "@tabler/icons-react";

import SectionCard from "~/components/SectionCard";
import classes from "./AgentVoices.module.css";
import { VoiceCard } from "./VoiceCard";
import type { AgentVoicesFilterValues } from "./AgentVoicesFilter/AgentVoicesFilter";
import AgentVoiceSettings from "../AgentVoiceSettings";
import VoiceDetails from "../VoiceDetails";
import type { AgentConfigModel } from "~/models/AgentListObject";
import AgentListObject from "~/models/AgentListObject";

type AgentVoicesProps = {
	onSelectVoice: (voiceId: string) => void;
	agentData?: Partial<AgentConfigModel>;
	onSetRightSection?: (rightSection: React.ReactNode) => void;
	onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
	agent?: AgentListObject;
};

const AgentVoices: React.FC<AgentVoicesProps> = ({
	onSelectVoice,
	agentData,
	onUpdateAgentData,
	onSetRightSection,
	agent,
}) => {
	const [filters] = useState<AgentVoicesFilterValues>({
		name: "",
		gender: "",
		language: "",
		status: "",
		age: "",
		accent: "",
	});
	const debouncedFilters = useDebouncedFilters(filters, 400);

	const {
		data: elevenLabsVoices,
		isLoading,
		isError,
	} = useGetAllAgentVoices(
		Object.fromEntries(
			Object.entries(debouncedFilters).filter(([_, value]) => value !== "")
		) as Record<string, string>
	);

	const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
	const [playProgress, setPlayProgress] = useState<number>(0);
	const audioRef = useRef<HTMLAudioElement>(null);
	// Track the current first visible index of the carousel
	const [currentIndex, setCurrentIndex] = useState(0);

	// For 5 visible slides, the center is at currentIndex + 2
	// With loop: true, handle circular distance
	const getScale = (idx: number, currentIndex: number) => {
		if (idx === currentIndex) {
			return 1.25;
		}
		return 0.9;
	};

	useEffect(() => {
		if (elevenLabsVoices && agent?.voice?.id) {
			const selectedVoiceIndex = elevenLabsVoices.findIndex((voice) => {
				return voice?.voiceId === agent?.voice?.id;
			});

			if (selectedVoiceIndex !== -1) {
				setCurrentIndex(selectedVoiceIndex);
				onSetRightSection?.(
					<VoiceDetails agentVoice={elevenLabsVoices[selectedVoiceIndex]} />
				);
			} else {
				onSetRightSection?.(<VoiceDetails agentVoice={elevenLabsVoices[0]} />);
			}
		} else if (elevenLabsVoices && elevenLabsVoices.length > 0) {
			// If no specific voice is selected, default to the first one
			setCurrentIndex(0);
			onSetRightSection?.(<VoiceDetails agentVoice={elevenLabsVoices[0]} />);
		}
	}, [elevenLabsVoices, agent?.voice?.id]);
	const handlePlayVoice = (voiceId: string, previewUrl: string) => {
		if (!previewUrl) return;

		if (playingVoiceId === voiceId) {
			audioRef.current?.pause();
			setPlayingVoiceId(null);
			setPlayProgress(0);
		} else {
			if (audioRef.current) {
				// Stop any currently playing audio
				if (playingVoiceId) {
					audioRef.current.pause();
					setPlayProgress(0);
				}

				audioRef.current.src = previewUrl;
				audioRef.current.play().catch(console.error);
				setPlayingVoiceId(voiceId);
			}
		}
		onSelectVoice(voiceId);
	};

	const handleAudioEnded = () => {
		setPlayingVoiceId(null);
		setPlayProgress(0);
	};

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			const progress =
				(audioRef.current.currentTime / audioRef.current.duration) * 100;
			setPlayProgress(progress);
		}
	};

	const voices = Array(8)
		.fill(null)
		.flatMap(() => elevenLabsVoices || []);

	let content: React.ReactNode = null;

	if (isLoading) {
		content = (
			<div className={classes.loadingContainer}>
				<IconMicrophone className={classes.loadingIcon} size={64} />
				<Text size="xl" fw={600}>
					Loading voices...
				</Text>
				<Text size="sm" c="dimmed">
					Fetching available voice options
				</Text>
			</div>
		);
	} else if (isError) {
		content = (
			<div className={classes.errorContainer}>
				<IconMicrophone className={classes.errorIcon} size={64} />
				<Text size="xl" fw={600} c="red">
					Failed to load voices
				</Text>
				<Text size="sm" c="dimmed">
					There was an error fetching the voice options. Please try again.
				</Text>
			</div>
		);
	} else if (voices.length === 0) {
		content = (
			<div className={classes.errorContainer}>
				<IconMicrophone className={classes.errorIcon} size={64} />
				<Text size="xl" fw={600}>
					No voices found
				</Text>
				<Text size="sm" c="dimmed">
					Try adjusting your filters or try again later.
				</Text>
			</div>
		);
	} else {
		content = (
			<div className={classes.container}>
				<audio
					ref={audioRef}
					onEnded={handleAudioEnded}
					onTimeUpdate={handleTimeUpdate}
					className={classes.hiddenAudio}
				/>
				<Carousel
					withControls
					slideSize="20%"
					slideGap="md"
					emblaOptions={{
						align: "center",
						loop: true,
					}}
					onSlideChange={(i) => {
						setCurrentIndex(i);
						onSetRightSection?.(<VoiceDetails agentVoice={voices[i]} />);
						onSelectVoice(voices[i].voice.id);
					}}
					initialSlide={currentIndex}
					classNames={{
						viewport: classes.carouselViewport,
						slide: classes.carouselSlide,
					}}
				>
					{voices.map((voice, idx) => {
						const scale = getScale(idx, currentIndex);
						return (
							<Carousel.Slide key={idx}>
								<div
									style={{
										transform: `scale(${scale})`,
										transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
									}}
								>
									<VoiceCard
										voice={voice.voice}
										isPlaying={playingVoiceId === voice.voice.id}
										isSelected={currentIndex === idx}
										playProgress={playProgress}
										onSelectVoice={onSelectVoice}
										onPlayVoice={handlePlayVoice}
									/>
								</div>
							</Carousel.Slide>
						);
					})}
				</Carousel>
			</div>
		);
	}

	return (
		<SectionCard
			icon={IconMicrophone}
			title="Choose AI voice"
			description="Select the voice that will represent during customer interactions.."
			contentSpacing="md"
			id="agent-voices-section"
		>
			{/* <AgentVoicesFilter filters={filters} onChange={handleFiltersChange} /> */}
			{content}
			<AgentVoiceSettings
				agentData={agentData}
				onUpdateAgentData={onUpdateAgentData}
			/>
		</SectionCard>
	);
};

export default AgentVoices;
