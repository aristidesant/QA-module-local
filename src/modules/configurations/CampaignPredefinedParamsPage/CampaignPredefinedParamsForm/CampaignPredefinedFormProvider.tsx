import React, { createContext, useContext } from 'react';
import { UseFormReturnType } from '@mantine/form';

export interface FormValues {
	id: string;
	name: string;
	asrQuality: string;
	asrKeywords: string[];
	asrProvider: string;
	asrUserInputAudioFormat: string;
	ttsModelId: string;
	ttsStability: number;
	ttsSpeed: number;
	ttsSimilarityBoost: number;
	ttsOptimizeStreamingLatency: number;
	ttsAgentOutputAudioFormat: string;
	agentPromptLlm: string;
	agentPromptReasoningEffort: string | null;
	agentPromptTemperature: number;
}

interface FormContextType {
	form: UseFormReturnType<FormValues>;
	isEditMode: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const CampaignPredefinedFormProvider: React.FC<{
	form: UseFormReturnType<FormValues>;
	isEditMode: boolean;
	children: React.ReactNode;
}> = ({ form, isEditMode, children }) => {
	return (
		<FormContext.Provider value={{ form, isEditMode }}>
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
