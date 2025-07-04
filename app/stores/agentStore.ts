import { create } from "zustand";
import type { ReactNode } from "react";

export interface AgentStoreState {
  selectedElement: ReactNode | null;
  setSelectedElement: (element: ReactNode | null) => void;
  agentConfigurationType?: "custom" | "campaign";
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  selectedElement: null,
  setSelectedElement: (element) => set({ selectedElement: element }),
  agentConfigurationType: "custom",
  setAgentConfigurationType: (type: "custom" | "campaign") =>
    set({ agentConfigurationType: type }),
}));
