import { describe, expect, it } from 'vitest';
import { voicesAges, voicesGenders, voicesStatuses } from './voicesFilters';

describe('voicesFilters', () => {
	describe('voicesGenders', () => {
		it('should contain the expected gender options', () => {
			expect(voicesGenders).toEqual(['FEMALE', 'MALE', 'NEUTRAL']);
		});

		it('should have exactly 3 gender options', () => {
			expect(voicesGenders).toHaveLength(3);
		});

		it('should include FEMALE option', () => {
			expect(voicesGenders).toContain('FEMALE');
		});

		it('should include MALE option', () => {
			expect(voicesGenders).toContain('MALE');
		});

		it('should include NEUTRAL option', () => {
			expect(voicesGenders).toContain('NEUTRAL');
		});
	});

	describe('voicesStatuses', () => {
		it('should contain the expected status options', () => {
			expect(voicesStatuses).toEqual(['ACTIVE', 'INACTIVE']);
		});

		it('should have exactly 2 status options', () => {
			expect(voicesStatuses).toHaveLength(2);
		});

		it('should include ACTIVE option', () => {
			expect(voicesStatuses).toContain('ACTIVE');
		});

		it('should include INACTIVE option', () => {
			expect(voicesStatuses).toContain('INACTIVE');
		});
	});

	describe('voicesAges', () => {
		it('should contain the expected age options', () => {
			expect(voicesAges).toEqual(['YOUNG', 'MIDDLE AGED', 'OLD']);
		});

		it('should have exactly 3 age options', () => {
			expect(voicesAges).toHaveLength(3);
		});

		it('should include YOUNG option', () => {
			expect(voicesAges).toContain('YOUNG');
		});

		it('should include MIDDLE AGED option', () => {
			expect(voicesAges).toContain('MIDDLE AGED');
		});

		it('should include OLD option', () => {
			expect(voicesAges).toContain('OLD');
		});
	});
});
