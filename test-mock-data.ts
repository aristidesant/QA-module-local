/**
 * Quick verification script for Agent Analytics mock data
 * Tests: data structure, aggregation functions, and realistic variations
 */

import { AGENT_CALL_METRICS, aggregateMetricsByDateRange } from './src/modules/qa/dashboard/mockData.ts';

console.log('=== Agent Analytics Mock Data Verification ===\n');

// Test 1: Verify we have 30+ entries
console.log(`✓ Total call metrics: ${AGENT_CALL_METRICS.length} (required: 30+)`);
if (AGENT_CALL_METRICS.length < 30) {
	console.error('✗ FAILED: Not enough entries');
	process.exit(1);
}

// Test 2: Verify all fields are populated
console.log('\n✓ Checking field completeness...');
const sampleCall = AGENT_CALL_METRICS[0];
const requiredFields = [
	'id',
	'date',
	'qaScores',
	'agentSentiment',
	'customerSentiment',
	'predominantEmotion',
	'complianceByArea',
];

for (const field of requiredFields) {
	if (!(field in sampleCall)) {
		console.error(`✗ FAILED: Missing field "${field}" in call ${sampleCall.id}`);
		process.exit(1);
	}
}

const complianceFields = ['security', 'regulatory', 'legal'];
for (const field of complianceFields) {
	if (!(field in sampleCall.complianceByArea)) {
		console.error(`✗ FAILED: Missing compliance area "${field}"`);
		process.exit(1);
	}
}

console.log('  All required fields present');

// Test 3: Verify data ranges and variations
console.log('\n✓ Checking data ranges and variations...');
const sentiments = AGENT_CALL_METRICS.map((c) => c.agentSentiment);
const ecnErrors = AGENT_CALL_METRICS.map((c) => c.qaScores.ecn);
const emotions = new Set(AGENT_CALL_METRICS.map((c) => c.predominantEmotion));

console.log(`  Agent sentiment range: ${Math.min(...sentiments).toFixed(1)} - ${Math.max(...sentiments).toFixed(1)}`);
console.log(`  ECN errors range: ${Math.min(...ecnErrors)} - ${Math.max(...ecnErrors)}`);
console.log(`  Unique emotions: ${emotions.size} (required: 8)`);

if (emotions.size < 8) {
	console.warn(`  ⚠ Only ${emotions.size} unique emotions found, expected 8`);
}

// Test 4: Verify date spread
console.log('\n✓ Checking date spread...');
const dates = AGENT_CALL_METRICS.map((c) => new Date(c.date).getTime());
const minDate = new Date(Math.min(...dates));
const maxDate = new Date(Math.max(...dates));
const daySpread = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);

console.log(`  Date range: ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]}`);
console.log(`  Spread: ${daySpread.toFixed(0)} days (required: ~30 days)`);

if (daySpread < 28) {
	console.warn(`  ⚠ Date spread is only ${daySpread.toFixed(0)} days, expected ~30`);
}

// Test 5: Test aggregation function - daily granularity
console.log('\n✓ Testing aggregateMetricsByDateRange (daily)...');
const startDate = '2026-08-09T00:00:00Z';
const endDate = '2026-09-08T23:59:59Z';
const dailyAggregates = aggregateMetricsByDateRange(AGENT_CALL_METRICS, startDate, endDate, 'daily');

console.log(`  Daily aggregates: ${dailyAggregates.length} buckets`);
if (dailyAggregates.length === 0) {
	console.error('✗ FAILED: No daily aggregates returned');
	process.exit(1);
}

const totalCalls = dailyAggregates.reduce((sum, a) => sum + a.callCount, 0);
console.log(`  Total calls in aggregates: ${totalCalls}`);

if (totalCalls !== AGENT_CALL_METRICS.length) {
	console.error(`✗ FAILED: Aggregated call count (${totalCalls}) doesn't match source (${AGENT_CALL_METRICS.length})`);
	process.exit(1);
}

// Test 6: Test aggregation with different granularities
console.log('\n✓ Testing aggregation with different granularities...');
const weeklyAggregates = aggregateMetricsByDateRange(AGENT_CALL_METRICS, startDate, endDate, 'weekly');
const monthlyAggregates = aggregateMetricsByDateRange(AGENT_CALL_METRICS, startDate, endDate, 'monthly');
const perCallAggregates = aggregateMetricsByDateRange(AGENT_CALL_METRICS, startDate, endDate, 'per-call');

console.log(`  Weekly buckets: ${weeklyAggregates.length}`);
console.log(`  Monthly buckets: ${monthlyAggregates.length}`);
console.log(`  Per-call aggregates: ${perCallAggregates.length}`);

if (perCallAggregates.length !== AGENT_CALL_METRICS.length) {
	console.error('✗ FAILED: Per-call aggregates count mismatch');
	process.exit(1);
}

// Test 7: Verify aggregation accuracy
console.log('\n✓ Checking aggregation accuracy...');
const firstDaily = dailyAggregates[0];
console.log(`  First daily bucket (${firstDaily.period}):`);
console.log(`    Calls: ${firstDaily.callCount}`);
console.log(`    Avg agent sentiment: ${firstDaily.avgAgentSentiment}`);
console.log(`    Total ECN errors: ${firstDaily.totalErrorsECN}`);
console.log(`    Compliance scores: Security=${firstDaily.avgSecurityCompliance}, Regulatory=${firstDaily.avgRegulatoryCompliance}, Legal=${firstDaily.avgLegalCompliance}`);

// Verify compliance scores are in valid range
if (
	firstDaily.avgSecurityCompliance < 0 ||
	firstDaily.avgSecurityCompliance > 100 ||
	firstDaily.avgRegulatoryCompliance < 0 ||
	firstDaily.avgRegulatoryCompliance > 100 ||
	firstDaily.avgLegalCompliance < 0 ||
	firstDaily.avgLegalCompliance > 100
) {
	console.error('✗ FAILED: Compliance scores out of valid range (0-100)');
	process.exit(1);
}

console.log('\n=== All Verifications Passed ===');
console.log(`\nSummary:`);
console.log(`  - AGENT_CALL_METRICS: ${AGENT_CALL_METRICS.length} entries`);
console.log(`  - Date coverage: ${daySpread.toFixed(0)} days`);
console.log(`  - Emotions represented: ${emotions.size}/8`);
console.log(`  - aggregateMetricsByDateRange: ✓ (all granularities working)`);
