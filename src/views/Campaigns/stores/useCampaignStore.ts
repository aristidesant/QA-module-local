import { create } from 'zustand';

export interface UploadedFile {
  id: string;
  name: string;
  duration: string;
  format: string;
  agentName: string;
}

export interface SelectedQATest {
  id: string;
  name: string;
  qaType: string;
  status: string;
  createdDate: string;
  createdBy: string;
  description?: string;
}

export interface CampaignConfig {
  id: string;
  name: string;
  type: string;
  callDirection?: 'inbound' | 'outbound' | 'mixed';
  responsibleContact: string;
  description: string;
  uploadedFiles: UploadedFile[];
  selectedTests: SelectedQATest[];
  createdAt: string;
  source?: 'external' | 'cmx';
}

interface CampaignStore {
  campaigns: Record<string, CampaignConfig>;
  addCampaign: (campaign: CampaignConfig) => void;
  getCampaign: (id: string) => CampaignConfig | undefined;
  updateCampaign: (id: string, updates: Partial<CampaignConfig>) => void;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaigns: {},
  addCampaign: (campaign) =>
    set((state) => ({
      campaigns: {
        ...state.campaigns,
        [campaign.id]: campaign,
      },
    })),
  getCampaign: (id) => get().campaigns[id],
  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: {
        ...state.campaigns,
        [id]: {
          ...state.campaigns[id],
          ...updates,
        },
      },
    })),
}));
