import { createContext, useContext } from 'react';
import type { NodeStyles } from '~/models/CampaignsModel';

interface NodeStylesContextValue {
	nodeStyles?: NodeStyles;
	onNodeStylesChange?: (nodeStyles: NodeStyles) => void;
}

/**
 * Provides current workflow node styles and their write target without
 * prop-drilling through React Flow node data.
 */
const NodeStylesContext = createContext<NodeStylesContextValue>({
	nodeStyles: undefined,
});

export const NodeStylesProvider = NodeStylesContext.Provider;

/**
 * Returns persisted styles for the given nodeId, or `undefined` if none set.
 */
export const useNodeStyle = (nodeId: string) => {
	const { nodeStyles } = useContext(NodeStylesContext);
	return nodeStyles?.[nodeId];
};

/**
 * Returns the full nodeStyles map.
 */
export const useNodeStyles = () => useContext(NodeStylesContext).nodeStyles;

export const useNodeStylesController = () => useContext(NodeStylesContext);
