import { useRef, useState, useEffect } from 'react';
import { Loader } from '@mantine/core';
import styles from './EditableTitle.module.css';

interface EditableTitleProps {
	value: string;
	onSave: (newValue: string) => Promise<void>;
	placeholder?: string;
	maxLength?: number;
}

export const EditableTitle = ({
	value,
	onSave,
	placeholder,
	maxLength = 120,
}: EditableTitleProps) => {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	const [saving, setSaving] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!editing) setDraft(value);
	}, [value, editing]);

	useEffect(() => {
		if (editing) {
			inputRef.current?.select();
		}
	}, [editing]);

	const startEditing = () => {
		setDraft(value);
		setEditing(true);
	};

	const cancel = () => {
		setDraft(value);
		setEditing(false);
	};

	const commit = async () => {
		const trimmed = draft.trim();
		if (!trimmed) {
			cancel();
			return;
		}
		if (trimmed === value) {
			setEditing(false);
			return;
		}
		setSaving(true);
		try {
			await onSave(trimmed);
			setEditing(false);
		} catch {
			setDraft(value);
			setEditing(false);
		} finally {
			setSaving(false);
		}
	};

	return (
		<span className={styles.root}>
			{editing ? (
				<input
					ref={inputRef}
					className={styles.input}
					value={draft}
					disabled={saving}
					maxLength={maxLength}
					placeholder={placeholder}
					size={Math.max(draft.length || (placeholder?.length ?? 10), 8)}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={commit}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							inputRef.current?.blur();
						}
						if (e.key === 'Escape') {
							e.preventDefault();
							cancel();
						}
					}}
				/>
			) : (
				<span className={styles.text} onClick={startEditing} title={value}>
					{value || placeholder}
				</span>
			)}
			{saving && (
				<span className={styles.loader}>
					<Loader size='xs' />
				</span>
			)}
		</span>
	);
};

export default EditableTitle;
