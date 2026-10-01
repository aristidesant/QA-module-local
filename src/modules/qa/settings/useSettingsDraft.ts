import { useState } from 'react';

/**
 * Local copy of one saved settings slice: edits stay in the draft until `save`
 * commits them, `discard` drops them and `fillWith` loads other values (e.g. the
 * defaults) without saving.
 */
export const useSettingsDraft = <T>(stored: T) => {
	const [draft, setDraft] = useState<T>(stored);
	const dirty = JSON.stringify(draft) !== JSON.stringify(stored);

	return {
		draft,
		setDraft,
		dirty,
		discard: () => setDraft(stored),
		fillWith: (value: T) => setDraft(value),
	};
};
