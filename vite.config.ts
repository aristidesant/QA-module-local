/// <reference types="vitest" />
/// <reference types="node" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'~': new URL('./src', import.meta.url).pathname,
		},
	},
	server: {
		port: 8080,
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setupTests.ts',
		// Disable css transforms during tests to avoid CSS module processing
		css: false,
		coverage: ((): any => {
			const baseInclude = ['src/**/*.{ts,tsx}'];
			const baseExclude = [
				'src/models/**',
				'src/**/*.test.{ts,tsx}',
				'src/**/*.spec.{ts,tsx}',
				'src/test-utils/**',
				'src/setupTests.ts',
			];

			if (process.env.VALID_COVERAGE_ONLY === 'true') {
				// Build a list of source files that have corresponding test files
				const testFiles: string[] = [];

				const walk = (dir: string) => {
					const items = fs.readdirSync(dir);
					for (const item of items) {
						const full = path.join(dir, item);
						const stats = fs.statSync(full);
						if (stats.isDirectory()) {
							walk(full);
						} else if (stats.isFile() && /\.test\.(ts|tsx)$/.test(full)) {
							testFiles.push(full);
						}
					}
				};
				// also collect .spec files
				const walkSpecs = (dir: string) => {
					const items = fs.readdirSync(dir);
					for (const item of items) {
						const full = path.join(dir, item);
						const stats = fs.statSync(full);
						if (stats.isDirectory()) {
							walkSpecs(full);
						} else if (stats.isFile() && /\.spec\.(ts|tsx)$/.test(full)) {
							testFiles.push(full);
						}
					}
				};
				try {
					walkSpecs(path.resolve(__dirname, 'src'));
				} catch (e) {
					// ignore
				}

				try {
					walk(path.resolve(__dirname, 'src'));
				} catch (e) {
					// nothing
				}

				const includes = new Set<string>();
				for (const tf of testFiles) {
					const base = tf.replace(/(\.test|\.spec)\.(ts|tsx)$/, '');
					const tsx = `${base}.tsx`;
					const ts = `${base}.ts`;
					if (fs.existsSync(tsx))
						includes.add(path.relative(process.cwd(), tsx).replace(/\\/g, '/'));
					if (fs.existsSync(ts))
						includes.add(path.relative(process.cwd(), ts).replace(/\\/g, '/'));
					// If test is in __tests__ directory, search for files outside that folder
					if (tf.includes(`${path.sep}__tests__${path.sep}`)) {
						const candidate = tf
							.replace(`${path.sep}__tests__${path.sep}`, `${path.sep}`)
							.replace(/(\.test|\.spec)\.(ts|tsx)$/, '.tsx');
						if (fs.existsSync(candidate))
							includes.add(
								path.relative(process.cwd(), candidate).replace(/\\/g, '/')
							);
						const candidateTs = candidate.replace(/\.tsx$/, '.ts');
						if (fs.existsSync(candidateTs))
							includes.add(
								path.relative(process.cwd(), candidateTs).replace(/\\/g, '/')
							);
					}
					// also try the parent directory in case test file is nested
					const parentCandidate = path.join(
						path.dirname(tf),
						'..',
						path.basename(base) + '.tsx'
					);
					if (fs.existsSync(parentCandidate))
						includes.add(
							path.relative(process.cwd(), parentCandidate).replace(/\\/g, '/')
						);
					const parentCandidateTs = parentCandidate.replace(/\.tsx$/, '.ts');
					if (fs.existsSync(parentCandidateTs))
						includes.add(
							path
								.relative(process.cwd(), parentCandidateTs)
								.replace(/\\/g, '/')
						);
				}

				// fallback: if no matched includes, use baseInclude
				const include = includes.size ? Array.from(includes) : baseInclude;
				return {
					provider: 'v8',
					include,
					exclude: baseExclude,
				};
			}

			return {
				provider: 'v8',
				include: baseInclude,
				exclude: baseExclude,
			};
		})(),
	},
});
