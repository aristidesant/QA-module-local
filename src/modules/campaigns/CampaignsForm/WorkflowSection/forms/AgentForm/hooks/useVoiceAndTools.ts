import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import type { BuiltInTool, SelectOption } from '../types';

export const useVoiceOptions = (): SelectOption[] => {
	const { data: voices } = useGetAllAgentVoices();

	return useMemo(
		() =>
			(voices || []).map((voice) => ({
				value: voice.voiceId,
				label: voice.voice?.name || voice.voiceId,
			})),
		[voices]
	);
};

export const useBuiltInTools = (): BuiltInTool[] => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);

	return useMemo(
		() => [
			{
				id: 'endConversation',
				label: t('form.workflow.forms.agent.toolsTab.builtIn.endConversation'),
				showSettings: true,
				switchDisabled: false,
			},
			{
				id: 'detectLanguage',
				label: t('form.workflow.forms.agent.toolsTab.builtIn.detectLanguage'),
				showSettings: true,
				switchDisabled: false,
			},
			{
				id: 'skipTurn',
				label: t('form.workflow.forms.agent.toolsTab.builtIn.skipTurn'),
				showSettings: true,
				switchDisabled: false,
			},
			{
				id: 'playKeypadTouchTone',
				label: t(
					'form.workflow.forms.agent.toolsTab.builtIn.playKeypadTouchTone'
				),
				showSettings: false,
				switchDisabled: true,
			},
			{
				id: 'voicemailDetection',
				label: t(
					'form.workflow.forms.agent.toolsTab.builtIn.voicemailDetection'
				),
				showSettings: true,
				switchDisabled: false,
			},
		],
		[t]
	);
};

export const eagernessOptions: SelectOption[] = [
	{ value: 'eager', label: 'Eager' },
	{ value: 'normal', label: 'Normal' },
	{ value: 'patient', label: 'Patient' },
];

export const spellingPatienceOptions: SelectOption[] = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'off', label: 'Off' },
];
