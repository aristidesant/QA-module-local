import { createContext, useContext } from 'react';
import type { NodeStyles } from '~/models/CampaignsModel';

/**
 * Provides the current campaign `nodeStyles` to every workflow node component
 * without prop-drilling through React Flow node data.
 */
const NodeStylesContext = createContext<NodeStyles | undefined>(undefined);

export const NodeStylesProvider = NodeStylesContext.Provider;

/**
 * Returns persisted styles for the given nodeId, or `undefined` if none set.
 */
export const useNodeStyle = (nodeId: string) => {
	const styles = useContext(NodeStylesContext);
	return styles?.[nodeId];
};

/**
 * Returns the full nodeStyles map (used by the popover to read/write).
 */
export const useNodeStyles = () => useContext(NodeStylesContext);
