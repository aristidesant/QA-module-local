export interface AgentSelectProps {
	error?: string;
	label: string;
	onChange: (value: string | null) => void;
	onValidityChange: (valid: boolean) => void;
	placeholder: string;
	value: string | null;
}
