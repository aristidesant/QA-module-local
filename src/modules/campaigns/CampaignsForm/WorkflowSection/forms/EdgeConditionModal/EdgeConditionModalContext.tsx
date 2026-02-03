import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {
	ForwardCondition,
	WorkflowEdge,
} from '~/models/AgentWorkflowModel';
import { WORKFLOW_NODE_TYPES, type WorkflowNodeType } from '../../nodeTypes';

export type ConditionType =
	| 'none'
	| 'unconditional'
	| 'llm'
	| 'result'
	| 'expression';
export type ConditionDirection = 'forward' | 'backward';

export interface ConditionFormState {
	type: ConditionType;
	label?: string;
	llmCondition?: string;
	resultSuccessful?: boolean;
}

interface EdgeConditionModalContextValue {
	opened: boolean;
	edgeId?: string;
	edge?: WorkflowEdge;
	sourceLabel?: string;
	targetLabel?: string;
	sourceNodeType?: WorkflowNodeType;
	targetNodeType?: WorkflowNodeType;
	activeTab: ConditionDirection | null;
	setActiveTab: React.Dispatch<React.SetStateAction<ConditionDirection | null>>;
	forwardState: ConditionFormState;
	setForwardState: React.Dispatch<React.SetStateAction<ConditionFormState>>;
	backwardState: ConditionFormState;
	setBackwardState: React.Dispatch<React.SetStateAction<ConditionFormState>>;
	isToolEdge: boolean;
	isConditionAllowed: (
		type: ConditionType,
		direction: ConditionDirection
	) => boolean;
	buildCondition: (state: ConditionFormState) => ForwardCondition | undefined;
	handleSave: () => void;
	onClose: () => void;
}

interface EdgeConditionModalProviderProps {
	opened: boolean;
	edgeId?: string;
	edge?: WorkflowEdge;
	sourceLabel?: string;
	targetLabel?: string;
	sourceNodeType?: WorkflowNodeType;
	targetNodeType?: WorkflowNodeType;
	onClose: () => void;
	onSave: (
		edgeId: string,
		forwardCondition?: ForwardCondition,
		backwardCondition?: ForwardCondition
	) => void;
	children: React.ReactNode;
}

const EdgeConditionModalContext =
	createContext<EdgeConditionModalContextValue | null>(null);

const statesEqual = (a: ConditionFormState, b: ConditionFormState) =>
	a.type === b.type &&
	a.label === b.label &&
	a.llmCondition === b.llmCondition &&
	a.resultSuccessful === b.resultSuccessful;

export const EdgeConditionModalProvider = ({
	opened,
	edgeId,
	edge,
	sourceLabel,
	targetLabel,
	sourceNodeType,
	targetNodeType,
	onClose,
	onSave,
	children,
}: EdgeConditionModalProviderProps) => {
	const isToolEdge =
		sourceNodeType === WORKFLOW_NODE_TYPES.TOOL ||
		targetNodeType === WORKFLOW_NODE_TYPES.TOOL;

	const isConditionAllowed = useCallback(
		(type: ConditionType, direction: ConditionDirection): boolean => {
			if (type === 'unconditional' || type === 'result') {
				return isToolEdge && direction === 'backward';
			}
			return type === 'none' || type === 'llm' || type === 'expression';
		},
		[isToolEdge]
	);

	const deriveStateFromCondition = useCallback(
		(
			condition: ForwardCondition | undefined,
			direction: ConditionDirection
		): ConditionFormState => {
			if (!condition) {
				return { type: 'none' };
			}
			switch (condition.type) {
				case 'llm':
					return {
						type: 'llm',
						label: condition.label,
						llmCondition: condition.condition,
					};
				case 'result':
					return isConditionAllowed('result', direction)
						? {
								type: 'result',
								resultSuccessful: condition.successful,
							}
						: { type: 'none' };
				case 'unconditional':
					return isConditionAllowed('unconditional', direction)
						? { type: 'unconditional' }
						: { type: 'none' };
				case 'expression':
					return isConditionAllowed('expression', direction)
						? { type: 'expression', label: condition.label }
						: { type: 'none' };
				default:
					return { type: 'none' };
			}
		},
		[isConditionAllowed]
	);

	const [activeTab, setActiveTab] = useState<ConditionDirection | null>(
		'forward'
	);
	const [forwardState, setForwardState] = useState<ConditionFormState>(() =>
		deriveStateFromCondition(edge?.forwardCondition, 'forward')
	);
	const [backwardState, setBackwardState] = useState<ConditionFormState>(() =>
		deriveStateFromCondition(edge?.backwardCondition, 'backward')
	);

	useEffect(() => {
		if (!opened) return;

		const nextForward = deriveStateFromCondition(
			edge?.forwardCondition,
			'forward'
		);
		const nextBackward = deriveStateFromCondition(
			edge?.backwardCondition,
			'backward'
		);

		setForwardState((prev) =>
			statesEqual(prev, nextForward) ? prev : nextForward
		);
		setBackwardState((prev) =>
			statesEqual(prev, nextBackward) ? prev : nextBackward
		);
	}, [
		opened,
		edgeId,
		edge?.forwardCondition,
		edge?.backwardCondition,
		deriveStateFromCondition,
	]);

	useEffect(() => {
		if (!opened) return;
		setActiveTab('forward');
	}, [opened, edgeId]);

	const buildCondition = useCallback(
		(state: ConditionFormState): ForwardCondition | undefined => {
			switch (state.type) {
				case 'none':
					return undefined;
				case 'unconditional':
					return { type: 'unconditional' };
				case 'llm':
					return {
						type: 'llm',
						condition: state.llmCondition || '',
						label: state.label,
					};
				case 'result':
					return {
						type: 'result',
						successful: state.resultSuccessful ?? true,
					};
				case 'expression':
					return {
						type: 'expression',
						expression: {
							type: 'or_operator',
							children: [],
						},
						label: state.label,
					};
				default:
					return undefined;
			}
		},
		[]
	);

	const handleSave = useCallback(() => {
		if (!edgeId) return;

		const forwardCondition = buildCondition(forwardState);
		const backwardCondition = buildCondition(backwardState);
		onSave(edgeId, forwardCondition, backwardCondition);
		onClose();
	}, [edgeId, forwardState, backwardState, buildCondition, onSave, onClose]);

	const value = useMemo<EdgeConditionModalContextValue>(
		() => ({
			opened,
			edgeId,
			edge,
			sourceLabel,
			targetLabel,
			sourceNodeType,
			targetNodeType,
			activeTab,
			setActiveTab,
			forwardState,
			setForwardState,
			backwardState,
			setBackwardState,
			isToolEdge,
			isConditionAllowed,
			buildCondition,
			handleSave,
			onClose,
		}),
		[
			opened,
			edgeId,
			edge,
			sourceLabel,
			targetLabel,
			sourceNodeType,
			targetNodeType,
			activeTab,
			forwardState,
			backwardState,
			isToolEdge,
			isConditionAllowed,
			buildCondition,
			handleSave,
			onClose,
		]
	);

	return (
		<EdgeConditionModalContext.Provider value={value}>
			{children}
		</EdgeConditionModalContext.Provider>
	);
};

export const useEdgeConditionModal = () => {
	const context = useContext(EdgeConditionModalContext);
	if (!context) {
		throw new Error(
			'useEdgeConditionModal must be used within EdgeConditionModalProvider'
		);
	}
	return context;
};
