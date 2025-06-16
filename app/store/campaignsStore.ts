import { create } from "zustand";
import type { Campaign } from "../models/CampaignsModel";

interface CampaignsStoreState {
  selectedCampaign: Campaign | null;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectCampaign: (campaign: Campaign | null) => void;
  rightComponent?: React.ReactNode;
  setRightComponent?: (component: React.ReactNode) => void;
  resetView: () => void;
}

export const useCampaignsStore = create<CampaignsStoreState>((set) => ({
  selectedCampaign: null,
  selectCampaign: (campaign) => set({ selectedCampaign: campaign }),
  selectedTab: "general",
  rightComponent: null,
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setRightComponent: (component) => set({ rightComponent: component }),
  resetView: () =>
    set({
      selectedCampaign: null,
      rightComponent: null,
      selectedTab: "general",
    }),
}));
