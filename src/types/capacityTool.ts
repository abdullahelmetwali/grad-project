export interface TCellParams {
  carriers: string;
  layers: string;
  scalingFactor: string;
  rbsSec: string;
  resRb: string;
  bitsPerRe: string;
  codingRate: string;
  cch: string;
  q: string;
  numSectors: string;
}

export interface TCellResults {
  tCellValue: number | null;
  tSiteValue: number | null;
}

export interface ActiveUsersParams {
  totalPopulation: string;
  mobilePenetration: string;
  operatorMarketShare: string;
  bahu: string;
}

export interface ActiveUsersResults {
  activeUsers: number | null;
}

export interface TrafficInputParams {
  time: string; // minutes
  rate: string; // kbps
  dutyRatio: string; // %
}

export interface TrafficServiceData {
  voiceCall: TrafficInputParams & { resultMbp: number | null };
  browsing: TrafficInputParams & { resultMbp: number | null };
  gaming: TrafficInputParams & { resultMbp: number | null };
  streaming: TrafficInputParams & { resultMbp: number | null };
}

export interface TotalTrafficParams {
  voiceCallTrafficPercentage: string;
  browsingTrafficPercentage: string;
  gamingTrafficPercentage: string;
  streamingTrafficPercentage: string;
}

export interface TotalTrafficResults {
  totalTrafficMbps: number | null;
  numberOfSites: number | null;
}

// Overall state for the Capacity Tool
export interface CapacityToolState {
  tCellParams: TCellParams;
  tCellResults: TCellResults;
  activeUsersParams: ActiveUsersParams;
  activeUsersResults: ActiveUsersResults;
  trafficServices: TrafficServiceData;
  totalTrafficParams: TotalTrafficParams;
  totalTrafficResults: TotalTrafficResults;
  currentStep: CapacityToolStep;
}

export type CapacityToolStep = 'T_CELL' | 'ACTIVE_USERS' | 'TRAFFIC_CALCULATION';

