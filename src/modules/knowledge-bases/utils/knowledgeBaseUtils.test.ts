import { describe, it, expect } from 'vitest';
import { isValidUrl, normalizeUrl, inferType } from './knowledgeBaseUtils';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';

describe('knowledgeBaseUtils', () => {
	describe('isValidUrl', () => {
		describe('valid URLs with protocol', () => {
			it('returns true for https URLs', () => {
				expect(isValidUrl('https://example.com')).toBe(true);
				expect(isValidUrl('https://www.example.com')).toBe(true);
				expect(isValidUrl('https://subdomain.example.com/path')).toBe(true);
			});

			it('returns true for http URLs', () => {
				expect(isValidUrl('http://example.com')).toBe(true);
				expect(isValidUrl('http://localhost:3000')).toBe(true);
			});

			it('returns true for URLs with paths and query strings', () => {
				expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
				expect(isValidUrl('https://example.com?query=value')).toBe(true);
				expect(isValidUrl('https://example.com/path?query=value&other=1')).toBe(
					true
				);
			});
		});

		describe('valid URLs without protocol', () => {
			it('returns true for common TLDs', () => {
				expect(isValidUrl('example.com')).toBe(true);
				expect(isValidUrl('hello.dev')).toBe(true);
				expect(isValidUrl('app.io')).toBe(true);
				expect(isValidUrl('site.ai')).toBe(true);
			});

			it('returns true for subdomains', () => {
				expect(isValidUrl('www.example.com')).toBe(true);
				expect(isValidUrl('api.service.example.com')).toBe(true);
			});

			it('returns true for country code TLDs', () => {
				expect(isValidUrl('example.uk')).toBe(true);
				expect(isValidUrl('example.de')).toBe(true);
				expect(isValidUrl('example.mx')).toBe(true);
			});

			it('returns true for URLs with paths', () => {
				expect(isValidUrl('example.com/path')).toBe(true);
				expect(isValidUrl('example.com/path/to/resource')).toBe(true);
			});
		});

		describe('invalid URLs', () => {
			it('returns false for empty strings', () => {
				expect(isValidUrl('')).toBe(false);
				expect(isValidUrl('   ')).toBe(false);
			});

			it('returns false for plain text', () => {
				expect(isValidUrl('hello world')).toBe(false);
				expect(isValidUrl('This is some text')).toBe(false);
			});

			it('returns false for invalid protocols', () => {
				expect(isValidUrl('ftp://example.com')).toBe(false);
				expect(isValidUrl('file://local/path')).toBe(false);
			});

			it('returns false for malformed URLs', () => {
				expect(isValidUrl('just-text')).toBe(false);
				expect(isValidUrl('no-dot-here')).toBe(false);
			});
		});
	});

	describe('normalizeUrl', () => {
		it('adds https:// to URLs without protocol', () => {
			expect(normalizeUrl('example.com')).toBe('https://example.com');
			expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
		});

		it('preserves existing https:// protocol', () => {
			expect(normalizeUrl('https://example.com')).toBe('https://example.com');
		});

		it('preserves existing http:// protocol', () => {
			expect(normalizeUrl('http://example.com')).toBe('http://example.com');
		});

		it('trims whitespace', () => {
			expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
		});

		it('handles empty strings', () => {
			expect(normalizeUrl('')).toBe('');
			expect(normalizeUrl('   ')).toBe('');
		});
	});

	describe('inferType', () => {
		it('returns FILE when file is provided', () => {
			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			expect(inferType('', file)).toBe(KnowledgeBaseType.FILE);
		});

		it('returns FILE even when content has URL (file takes priority)', () => {
			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			expect(inferType('https://example.com', file)).toBe(
				KnowledgeBaseType.FILE
			);
		});

		it('returns URL when content is a valid URL', () => {
			expect(inferType('https://example.com', null)).toBe(
				KnowledgeBaseType.URL
			);
			expect(inferType('example.com', null)).toBe(KnowledgeBaseType.URL);
			expect(inferType('hello.dev', null)).toBe(KnowledgeBaseType.URL);
		});

		it('returns TEXT when content is plain text', () => {
			expect(inferType('Hello world', null)).toBe(KnowledgeBaseType.TEXT);
			expect(inferType('Some knowledge base content here', null)).toBe(
				KnowledgeBaseType.TEXT
			);
		});

		it('returns null when no content and no file', () => {
			expect(inferType('', null)).toBeNull();
			expect(inferType('   ', null)).toBeNull();
		});
	});
});
