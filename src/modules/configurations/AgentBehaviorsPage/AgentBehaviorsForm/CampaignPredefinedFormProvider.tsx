import React, { createContext, useContext } from 'react';
import { UseFormReturnType } from '@mantine/form';
import type { AgentBehavior } from '~/models/AgentBehavior';
import type { SuggestedAudioTag } from '~/models/CampaignPredefinedParam';
import type { PlatformSettingsOverrides } from './platformSettingsConfig';

export interface FormValues {
	id: string;
	name: string;
	asrQuality: string;
	asrKeywords: string[];
	asrProvider: string;
	asrUserInputAudioFormat: string;
	ttsModelId: string;
	ttsVoiceId: string;
	ttsSupportedVoices: Record<string, unknown>[];
	ttsExpressiveMode: boolean;
	ttsSuggestedAudioTags: SuggestedAudioTag[];
	ttsStability: number;
	ttsSpeed: number;
	ttsSimilarityBoost: number;
	ttsOptimizeStreamingLatency: number;
	ttsAgentOutputAudioFormat: string;
	agentPromptLlm: string;
	agentPromptReasoningEffort: string | null;
	agentPromptTemperature: number;
	platformSettingsOverrides: PlatformSettingsOverrides;
	isBackup: boolean;
	backupBehaviorId: string | null;
}

interface FormContextType {
	form: UseFormReturnType<FormValues>;
	isEditMode: boolean;
	currentBehaviorId?: string;
	allBehaviors: AgentBehavior[];
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const CampaignPredefinedFormProvider: React.FC<{
	form: UseFormReturnType<FormValues>;
	isEditMode: boolean;
	currentBehaviorId?: string;
	allBehaviors?: AgentBehavior[];
	children: React.ReactNode;
}> = ({ form, isEditMode, currentBehaviorId, allBehaviors = [], children }) => {
	return (
		<FormContext.Provider
			value={{ form, isEditMode, currentBehaviorId, allBehaviors }}
		>
			{children}
		</FormContext.Provider>
	);
};

export const useFormContext = (): FormContextType => {
	const context = useContext(FormContext);
	if (!context) {
		throw new Error(
			'useFormContext must be used within CampaignPredefinedFormProvider'
		);
	}
	return context;
};

export default CampaignPredefinedFormProvider;
