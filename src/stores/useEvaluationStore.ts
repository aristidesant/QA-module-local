import { create } from 'zustand';

interface EvaluationStore {
  setAvailableEvaluations: (evaluations: any[]) => void;
  clearEvaluations: () => void;
}

export const useEvaluationStore = create<EvaluationStore>(() => ({
  setAvailableEvaluations: () => {},
  clearEvaluations: () => {},
}));
