import { describe, expect, it } from 'vitest';
import { financeForm } from './finance';

describe('financeForm', () => {
	describe('form structure', () => {
		it('should have type FINANCE', () => {
			expect(financeForm.type).toBe('FINANCE');
		});

		it('should have fields array', () => {
			expect(Array.isArray(financeForm.fields)).toBe(true);
		});

		it('should have exactly 6 fields', () => {
			expect(financeForm.fields).toHaveLength(6);
		});
	});

	describe('required fields', () => {
		it('should have agent_name as a required field', () => {
			const agentNameField = financeForm.fields.find(
				(field) => field.name === 'agent_name'
			);
			expect(agentNameField).toBeDefined();
			expect(agentNameField?.required).toBe(true);
			expect(agentNameField?.label).toBe('Agent Name');
			expect(agentNameField?.type).toBe('text');
		});

		it('should have financial_product_type as a required field', () => {
			const productTypeField = financeForm.fields.find(
				(field) => field.name === 'financial_product_type'
			);
			expect(productTypeField).toBeDefined();
			expect(productTypeField?.required).toBe(true);
			expect(productTypeField?.label).toBe('Financial Product Type');
			expect(productTypeField?.type).toBe('text');
		});

		it('should have target_audience as a required field', () => {
			const targetAudienceField = financeForm.fields.find(
				(field) => field.name === 'target_audience'
			);
			expect(targetAudienceField).toBeDefined();
			expect(targetAudienceField?.required).toBe(true);
			expect(targetAudienceField?.label).toBe('Target Audience');
			expect(targetAudienceField?.type).toBe('text');
		});

		it('should have agent_goal as a required field', () => {
			const agentGoalField = financeForm.fields.find(
				(field) => field.name === 'agent_goal'
			);
			expect(agentGoalField).toBeDefined();
			expect(agentGoalField?.required).toBe(true);
			expect(agentGoalField?.label).toBe('Agent Goal');
			expect(agentGoalField?.type).toBe('text');
		});
	});

	describe('optional fields', () => {
		it('should have communication_tone as an optional field', () => {
			const communicationToneField = financeForm.fields.find(
				(field) => field.name === 'communication_tone'
			);
			expect(communicationToneField).toBeDefined();
			expect(communicationToneField?.required).toBe(false);
			expect(communicationToneField?.label).toBe('Communication Tone');
			expect(communicationToneField?.type).toBe('text');
		});

		it('should have key_messages as an optional textarea field', () => {
			const keyMessagesField = financeForm.fields.find(
				(field) => field.name === 'key_messages'
			);
			expect(keyMessagesField).toBeDefined();
			expect(keyMessagesField?.required).toBe(false);
			expect(keyMessagesField?.label).toBe('Restrictions or Key Messages');
			expect(keyMessagesField?.type).toBe('textarea');
		});
	});

	describe('field properties', () => {
		it('all fields should have label property', () => {
			financeForm.fields.forEach((field) => {
				expect(field.label).toBeDefined();
				expect(typeof field.label).toBe('string');
				expect(field.label.length).toBeGreaterThan(0);
			});
		});

		it('all fields should have name property', () => {
			financeForm.fields.forEach((field) => {
				expect(field.name).toBeDefined();
				expect(typeof field.name).toBe('string');
				expect(field.name.length).toBeGreaterThan(0);
			});
		});

		it('all fields should have placeholder property', () => {
			financeForm.fields.forEach((field) => {
				expect(field.placeholder).toBeDefined();
				expect(typeof field.placeholder).toBe('string');
			});
		});

		it('all fields should have description property', () => {
			financeForm.fields.forEach((field) => {
				expect(field.description).toBeDefined();
				expect(typeof field.description).toBe('string');
			});
		});

		it('all fields should have type property', () => {
			financeForm.fields.forEach((field) => {
				expect(field.type).toBeDefined();
				expect(typeof field.type).toBe('string');
			});
		});

		it('all fields should have required property as boolean', () => {
			financeForm.fields.forEach((field) => {
				expect(typeof field.required).toBe('boolean');
			});
		});
	});

	describe('field names uniqueness', () => {
		it('should have unique field names', () => {
			const fieldNames = financeForm.fields.map((field) => field.name);
			const uniqueNames = new Set(fieldNames);
			expect(uniqueNames.size).toBe(fieldNames.length);
		});
	});

	describe('field types', () => {
		it('should have 5 text fields and 1 textarea field', () => {
			const textFields = financeForm.fields.filter(
				(field) => field.type === 'text'
			);
			const textareaFields = financeForm.fields.filter(
				(field) => field.type === 'textarea'
			);
			expect(textFields).toHaveLength(5);
			expect(textareaFields).toHaveLength(1);
		});
	});
});
