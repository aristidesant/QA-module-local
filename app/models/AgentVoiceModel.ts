export type AgentVoiceResponse = {
  voices: AgentVoice[];
  has_more: boolean;
  total_count: number;
  next_page_token?: string;
};

export type AgentVoice = {
  voice_id: string;
  name: string;
  samples: any; // Assuming unknown type, can change if you have schema
  category: string;
  fine_tuning: AgentVoiceFineTuning;
  labels: AgentVoiceLabels;
  description: string | null;
  preview_url: string | null;
  available_for_tiers: string[];
  settings: any; // Unknown type
  sharing: any; // Unknown type
  high_quality_base_model_ids: string[];
  verified_languages: AgentVoiceVerifiedLanguage[];
  safety_control: any; // Unknown type
  voice_verification: AgentVoiceVerification;
  permission_on_resource: any; // Unknown type
  is_owner: boolean;
  is_legacy: boolean;
  is_mixed: boolean;
  created_at_unix: number | null;
};

export type AgentVoiceFineTuning = {
  is_allowed_to_fine_tune: boolean;
  state: { [model: string]: string };
  verification_failures: string[];
  verification_attempts_count: number;
  manual_verification_requested: boolean;
  language: string | null;
  progress: { [model: string]: number };
  message: { [model: string]: string };
  dataset_duration_seconds: number | null;
  verification_attempts: any; // Unknown type
  slice_ids: any; // Unknown type
  manual_verification: any; // Unknown type
  max_verification_attempts: number | null;
  next_max_verification_attempts_reset_unix_ms: number | null;
};

export type AgentVoiceLabels = {
  accent?: string;
  description?: string;
  age?: string;
  gender?: string;
  use_case?: string;
  language?: string;
  descriptive?: string;
  [key: string]: any; // Flexibility for additional label fields
};

export type AgentVoiceVerifiedLanguage = {
  language: string;
  model_id: string;
  accent: string | null;
  locale: string | null;
  preview_url: string;
};

export type AgentVoiceVerification = {
  requires_verification: boolean;
  is_verified: boolean;
  verification_failures: string[];
  verification_attempts_count: number;
  language: string | null;
  verification_attempts: any; // Unknown type
};

export type AgentVoiceDBModel = {
  id: number;
  voiceId: string;
  name: string;
  previewUrl: string;
  labels: {};
  status: "ACTIVE";
};
