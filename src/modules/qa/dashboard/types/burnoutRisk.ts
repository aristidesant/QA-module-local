export enum BurnoutRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface BurnoutRiskData {
  agentId: string;
  level: BurnoutRiskLevel;
  percentage: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string; // ISO date
}
