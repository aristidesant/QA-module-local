import type { AgentBehavior } from '~/models/AgentBehavior';

export const getAgentBehaviorType = (
	behavior?: Pick<AgentBehavior, 'behaviorType' | 'isBackup'> | null
) => {
	if (!behavior) {
		return 'PRIMARY';
	}

	return behavior.behaviorType ?? (behavior.isBackup ? 'BACKUP' : 'PRIMARY');
};

export const isBackupBehavior = (
	behavior?: Pick<AgentBehavior, 'behaviorType' | 'isBackup'> | null
) => getAgentBehaviorType(behavior) === 'BACKUP';

export const isPrimaryBehavior = (
	behavior?: Pick<AgentBehavior, 'behaviorType' | 'isBackup'> | null
) => getAgentBehaviorType(behavior) === 'PRIMARY';
