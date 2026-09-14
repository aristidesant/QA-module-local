import { create } from 'zustand';
import type { ProgramDraft, RankingProgram } from '~/models/qa/rankingPrograms';
import type { UserReactionType } from '~/modules/qa/agent/rankings/types/leaderboard';
import {
	RANKING_PROGRAMS_SEED,
	REACTIONS_SEED,
} from '~/modules/qa/rankings/mockData';
import {
	computeStandings,
	conflictingProgram,
	leader,
} from '~/modules/qa/rankings/helpers';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TODAY } from '~/modules/qa/analytics/constants';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { buildNotification } from '~/modules/qa/inbox/helpers';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';

type SaveResult =
	| { ok: true; program: RankingProgram }
	| { ok: false; conflict: RankingProgram };

interface RankingsState {
	programs: RankingProgram[];
	/** programId → agentId → the reaction the current user left. */
	/** programId → target agent → reacting agent → emoji. */
	reactions: Record<string, Record<string, Record<string, UserReactionType>>>;
	createProgram: (draft: ProgramDraft) => SaveResult;
	updateProgram: (id: string, patch: Partial<ProgramDraft>) => SaveResult;
	endProgram: (id: string) => void;
	cancelProgram: (id: string) => void;
	duplicateProgram: (id: string) => RankingProgram;
	deleteProgram: (id: string) => void;
	/** Awards the badges of every milestone reached; safe to call repeatedly. */
	syncMilestones: (id: string) => void;
	/** Sets (or clears, with `null`) one agent's reaction to another's standing. */
	setReaction: (
		programId: string,
		targetAgentId: string,
		reactorId: string,
		reaction: UserReactionType | null
	) => void;
}

export const selectPrograms = (s: RankingsState) => s.programs;
export const selectReactions = (s: RankingsState) => s.reactions;

let counter = RANKING_PROGRAMS_SEED.length;
const nextId = () => `RP-${String(++counter).padStart(3, '0')}`;
let milestoneCounter = 100;
export const nextMilestoneId = () => `RPM-${++milestoneCounter}`;

const notify = (input: Parameters<typeof buildNotification>[0]) =>
	useNotificationStore.getState().addNotification(buildNotification(input));

/** A scheduled start date keeps the program out of the active tab until it begins. */
const normalizeStatus = (draft: ProgramDraft): RankingProgram['status'] =>
	draft.status === 'active' && draft.startDate > TODAY
		? 'scheduled'
		: draft.status;

const agentsOf = (program: RankingProgram) =>
	TEAM_AGENTS.filter((agent) => program.teams.includes(agent.team));

/** Completed seeds carry no winner so it always matches the computed standings. */
const resolveSeedWinners = (programs: RankingProgram[]): RankingProgram[] =>
	programs.map((program) => {
		if (program.status !== 'completed' || program.winnerId) return program;
		const top = leader(computeStandings(program, TEAM_CALLS, program.endDate));
		return top
			? { ...program, winnerId: top.agentId, winnerName: top.agentName }
			: program;
	});

export const useRankingsStore = create<RankingsState>((set, get) => ({
	programs: resolveSeedWinners(RANKING_PROGRAMS_SEED),
	reactions: REACTIONS_SEED,

	createProgram: (draft) => {
		const status = normalizeStatus(draft);
		if (status !== 'draft') {
			const conflict = conflictingProgram(
				get().programs,
				draft.teams,
				draft.startDate,
				draft.endDate
			);
			if (conflict) return { ok: false, conflict };
		}

		const program: RankingProgram = {
			...draft,
			status,
			id: nextId(),
			winnerId: null,
			winnerName: null,
			createdAt: NOW_ISO,
			updatedAt: NOW_ISO,
		};
		set((s) => ({ programs: [program, ...s.programs] }));

		if (status !== 'draft') {
			agentsOf(program).forEach((agent) =>
				notify({
					agentId: agent.id,
					recipientRole: 'AGENT',
					recipientId: agent.id,
					category: 'POSITIVE_RECOGNITION',
					priority: 'NORMAL',
					title: `New ranking: ${program.name}`,
					message: `${program.description} Prize: ${program.prize.title}.`,
					icon: 'trophy',
					sourceRole:
						program.createdByRole === 'QA_MANAGER'
							? 'QA_MANAGER'
							: 'SUPERVISOR',
					payload: {
						kind: 'RANKING_UPDATE',
						rankingId: program.id,
						rankingName: program.name,
						event: 'STARTED',
						prizeTitle: program.prize.title,
					},
				})
			);
		}

		return { ok: true, program };
	},

	updateProgram: (id, patch) => {
		const current = get().programs.find((p) => p.id === id);
		if (!current) return { ok: false, conflict: current as never };

		const merged = { ...current, ...patch };
		const status = normalizeStatus(merged);
		if (status !== 'draft') {
			const conflict = conflictingProgram(
				get().programs,
				merged.teams,
				merged.startDate,
				merged.endDate,
				id
			);
			if (conflict) return { ok: false, conflict };
		}

		const program: RankingProgram = { ...merged, status, updatedAt: NOW_ISO };
		set((s) => ({
			programs: s.programs.map((p) => (p.id === id ? program : p)),
		}));
		return { ok: true, program };
	},

	endProgram: (id) => {
		const program = get().programs.find((p) => p.id === id);
		if (!program || program.status === 'completed') return;

		const standings = computeStandings(program, TEAM_CALLS);
		const winner = leader(standings);

		set((s) => ({
			programs: s.programs.map((p) =>
				p.id === id
					? {
							...p,
							status: 'completed',
							winnerId: winner?.agentId ?? null,
							winnerName: winner?.agentName ?? null,
							endDate: p.endDate > TODAY ? TODAY : p.endDate,
							updatedAt: NOW_ISO,
						}
					: p
			),
		}));

		if (winner && program.winnerBadgeId) {
			useTriggerRulesStore.getState().awardBadge(program.winnerBadgeId, {
				agentId: winner.agentId,
				agentName: winner.agentName,
				team: winner.team,
				earnedAt: NOW_ISO,
			});
		}

		standings.forEach((standing) => {
			const won = standing.agentId === winner?.agentId;
			notify({
				agentId: standing.agentId,
				recipientRole: 'AGENT',
				recipientId: standing.agentId,
				category: 'POSITIVE_RECOGNITION',
				priority: won ? 'HIGH' : 'LOW',
				title: won ? `You won ${program.name}!` : `${program.name} has ended`,
				message: won
					? `You finished first. Prize: ${program.prize.title}.`
					: `${winner?.agentName ?? '—'} finished first.`,
				icon: 'trophy',
				sourceRole: 'SYSTEM',
				payload: {
					kind: 'RANKING_UPDATE',
					rankingId: program.id,
					rankingName: program.name,
					event: won ? 'WON' : 'ENDED',
					rank: standing.rank ?? undefined,
					prizeTitle: won ? program.prize.title : undefined,
				},
			});
		});

		notify({
			agentId: winner?.agentId ?? '',
			recipientRole:
				program.createdByRole === 'QA_MANAGER' ? 'QA_MANAGER' : 'SUPERVISOR',
			recipientId:
				program.createdByRole === 'QA_MANAGER' ? 'QAM-001' : 'SUP-001',
			category: 'POSITIVE_RECOGNITION',
			priority: 'NORMAL',
			title: `${program.name} has ended`,
			message: `${winner?.agentName ?? 'Nobody'} finished first.`,
			icon: 'trophy',
			sourceRole: 'SYSTEM',
			payload: {
				kind: 'RANKING_UPDATE',
				rankingId: program.id,
				rankingName: program.name,
				event: 'ENDED',
				prizeTitle: program.prize.title,
			},
		});
	},

	cancelProgram: (id) =>
		set((s) => ({
			programs: s.programs.map((p) =>
				p.id === id ? { ...p, status: 'cancelled', updatedAt: NOW_ISO } : p
			),
		})),

	deleteProgram: (id) =>
		set((s) => ({ programs: s.programs.filter((p) => p.id !== id) })),

	duplicateProgram: (id) => {
		const source = get().programs.find((p) => p.id === id);
		if (!source) throw new Error(`Unknown ranking ${id}`);
		const copy: RankingProgram = {
			...source,
			id: nextId(),
			name: `${source.name} (copy)`,
			status: 'draft',
			winnerId: null,
			winnerName: null,
			createdAt: NOW_ISO,
			updatedAt: NOW_ISO,
		};
		set((s) => ({ programs: [copy, ...s.programs] }));
		return copy;
	},

	syncMilestones: (id) => {
		const program = get().programs.find((p) => p.id === id);
		if (!program || program.milestones.length === 0) return;

		const badges = useTriggerRulesStore.getState().badges;
		const awardBadge = useTriggerRulesStore.getState().awardBadge;

		computeStandings(program, TEAM_CALLS).forEach((standing) => {
			standing.milestoneIds.forEach((milestoneId) => {
				const milestone = program.milestones.find((m) => m.id === milestoneId);
				if (!milestone) return;
				const badge = badges.find((b) => b.id === milestone.badgeId);
				if (!badge || badge.holders.some((h) => h.agentId === standing.agentId))
					return;

				awardBadge(milestone.badgeId, {
					agentId: standing.agentId,
					agentName: standing.agentName,
					team: standing.team,
					earnedAt: NOW_ISO,
				});
				notify({
					agentId: standing.agentId,
					recipientRole: 'AGENT',
					recipientId: standing.agentId,
					category: 'POSITIVE_RECOGNITION',
					priority: 'NORMAL',
					title: `Badge earned: ${badge.name}`,
					message: `${milestone.label} milestone reached in ${program.name}.`,
					icon: 'award',
					sourceRole: 'SYSTEM',
					payload: {
						kind: 'BADGE_EARNED',
						badgeId: badge.id,
						badgeName: badge.name,
						badgeIcon: badge.icon,
						badgeColor: badge.color,
						tier: badge.tier,
						reason: `${milestone.label} in ${program.name}`,
					},
				});
			});
		});
	},

	setReaction: (programId, targetAgentId, reactorId, reaction) =>
		set((s) => {
			const forProgram = { ...(s.reactions[programId] ?? {}) };
			const forTarget = { ...(forProgram[targetAgentId] ?? {}) };

			if (reaction === null) delete forTarget[reactorId];
			else forTarget[reactorId] = reaction;

			forProgram[targetAgentId] = forTarget;
			return { reactions: { ...s.reactions, [programId]: forProgram } };
		}),
}));
