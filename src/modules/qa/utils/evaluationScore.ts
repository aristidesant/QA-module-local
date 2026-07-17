import type { EvaluationDetail, EvaluationSectionScore } from '~/models/qa';

export function calculateEvaluationScore(detail: EvaluationDetail) {
	const questions = detail.groups.flatMap((group) => group.questions);
	const maxScore = questions.reduce(
		(sum, question) => sum + Number(question.weight || 0),
		0
	);
	const overallScore = questions.reduce(
		(sum, question) => sum + Number(question.answer?.awardedScore ?? 0),
		0
	);
	const overallScorePct =
		maxScore > 0 ? Math.round((overallScore / maxScore) * 10000) / 100 : 0;

	return {
		answered: questions.filter((question) => question.answer).length,
		total: questions.length,
		maxScore,
		overallScore,
		overallScorePct,
	};
}

export function calculateSectionScores(
	detail: EvaluationDetail
): EvaluationSectionScore[] {
	return detail.groups.map((group) => {
		const maxScore = group.questions.reduce(
			(sum, question) => sum + Number(question.weight || 0),
			0
		);
		const score = group.questions.reduce(
			(sum, question) => sum + Number(question.answer?.awardedScore ?? 0),
			0
		);

		return {
			name: group.name,
			score,
			maxScore,
			scorePct: maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0,
			answered: group.questions.filter((question) => question.answer).length,
			total: group.questions.length,
		};
	});
}
