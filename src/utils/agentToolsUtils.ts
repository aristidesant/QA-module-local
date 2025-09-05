import toolApi from '~/api/toolApi';

/**
 * Handles tool assignment/unassignment for an agent when saving
 * @param agentId - The ID of the agent
 * @param newToolIds - Array of tool identifiers that should be assigned
 * @param currentAssignedTools - Current assigned tools from the API
 * @returns Promise that resolves when all operations are complete
 */
export const handleAgentToolsUpdate = async (
	agentId: string,
	newToolIds: string[],
	currentAssignedTools: Array<{ tool: { identifier: string } }> = []
) => {
	const api = toolApi();

	// Get currently assigned tool identifiers
	const currentToolIds = currentAssignedTools.map(
		(assignedTool) => assignedTool.tool.identifier
	);

	// Find tools to assign (in newToolIds but not in currentToolIds)
	const toolsToAssign = newToolIds.filter(
		(toolId) => !currentToolIds.includes(toolId)
	);

	// Find tools to unassign (in currentToolIds but not in newToolIds)
	const toolsToUnassign = currentToolIds.filter(
		(toolId) => !newToolIds.includes(toolId)
	);

	// Execute assignments and unassignments
	const promises: Promise<any>[] = [];

	if (toolsToAssign.length > 0) {
		promises.push(api.assignToolsToAgent(agentId, toolsToAssign));
	}

	if (toolsToUnassign.length > 0) {
		promises.push(api.unassignToolsFromAgent(agentId, toolsToUnassign));
	}

	// Wait for all operations to complete
	if (promises.length > 0) {
		await Promise.all(promises);
	}

	return {
		assigned: toolsToAssign.length,
		unassigned: toolsToUnassign.length,
		hasChanges: promises.length > 0,
	};
};
