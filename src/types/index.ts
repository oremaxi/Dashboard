// ORE挖矿相关类型定义

export interface MiningRound {
  id: string;
  roundNumber: number;
  startSlot: number;
  endSlot: number;
  currentSlot: number;
  startTime: number;
  endTime: number;
  totalDeployedSOL: number;
  uniqueMiners: number;
  bids: number;
  buyback: number;
  estimatedCost: number;
  status: 'active' | 'completed' | 'upcoming';
}

export interface GridCell {
  id: string;
  row: number;
  col: number;
  miners: number;
  deployedSOL: number;
  isAboveAverage: boolean;
  isSelected: boolean;
  colorIntensity: number;
}

export interface MiningStats {
  totalDeployedSOL: number;
  uniqueMiners: number;
  bids: number;
  buyback: number;
  estimatedCost: number;
  averageDeployedSOL: number;
}

export interface TransactionData {
  id: string;
  type: 'deploy' | 'bid' | 'buyback';
  amount: number;
  timestamp: number;
  slot: number;
  signer: string;
  success: boolean;
}

export interface WalletConnection {
  connected: boolean;
  publicKey?: string;
  balance?: number;
  connecting: boolean;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Timezone {
  code: string;
  name: string;
  offset: string;
}

// Web3 相关类型
export interface SolanaConnection {
  endpoint: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
}

export interface WalletAdapter {
  name: string;
  url: string;
  icon: string;
}