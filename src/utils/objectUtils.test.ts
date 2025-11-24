import { describe, it, expect } from 'vitest';
import { deepMergeConfig } from './objectUtils';

describe('deepMergeConfig', () => {
	it('merges tts-only config preserving agent fields', () => {
		const target = {
			tts: { voice: 'old' },
			agent: { prompt: { text: 'old' }, other: 'keep' },
		};
		const source = { tts: { voice: 'new' } };
		const merged = deepMergeConfig(target, source);
		expect(merged.tts.voice).toBe('new');
		expect(merged.agent.prompt.text).toBe('old');
		expect(merged.agent.other).toBe('keep');
	});

	it('merges agent-only config preserving tts', () => {
		const target = {
			tts: { voice: 'old' },
			agent: { prompt: { text: 'old' }, extra: 'keep' },
		};
		const source = { agent: { prompt: { text: 'updated' } } };
		const merged = deepMergeConfig(target, source);
		expect(merged.agent.prompt.text).toBe('updated');
		expect(merged.tts.voice).toBe('old');
		expect(merged.agent.extra).toBe('keep');
	});

	it('replaces arrays entirely', () => {
		const target = { arr: [1, 2, 3], nested: { arr: [1] } };
		const source = { arr: [4], nested: { arr: [2, 3] } };
		const merged = deepMergeConfig(target, source);
		expect(merged.arr).toEqual([4]);
		expect(merged.nested.arr).toEqual([2, 3]);
	});
});

export {};
