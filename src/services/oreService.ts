import { MiningRound, GridCell, MiningStats, TransactionData } from '../types';

// 生成随机数的工具函数
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomIntBetween(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

// 生成模拟的挖矿轮次数据
export function generateMockMiningRounds(count: number = 10): MiningRound[] {
  const rounds: MiningRound[] = [];
  const currentTime = Date.now();
  
  for (let i = 0; i < count; i++) {
    const roundNumber = 1000 + i;
    const duration = randomIntBetween(4, 8) * 60 * 1000; // 4-8分钟
    const startTime = currentTime - (count - i) * duration;
    const endTime = startTime + duration;
    const currentSlot = startTime + randomIntBetween(0, duration);
    
    const totalDeployedSOL = randomBetween(1000, 5000);
    const uniqueMiners = randomIntBetween(50, 200);
    const bids = randomIntBetween(100, 500);
    const buyback = randomBetween(100, 500);
    const estimatedCost = randomBetween(50, 200);
    
    let status: 'active' | 'completed' | 'upcoming' = 'completed';
    if (currentTime < startTime) status = 'upcoming';
    else if (currentTime >= startTime && currentTime <= endTime) status = 'active';
    
    rounds.push({
      id: `round_${roundNumber}`,
      roundNumber,
      startSlot: Math.floor(startTime / 400), // 假设400ms per slot
      endSlot: Math.floor(endTime / 400),
      currentSlot: Math.floor(currentSlot / 400),
      startTime,
      endTime,
      totalDeployedSOL,
      uniqueMiners,
      bids,
      buyback,
      estimatedCost,
      status
    });
  }
  
  return rounds.sort((a, b) => b.roundNumber - a.roundNumber);
}

// 生成5x5网格数据
export function generateGridData(round: MiningRound): GridCell[] {
  const cells: GridCell[] = [];
  const averageDeployedSOL = round.totalDeployedSOL / 25; // 平均每个网格的SOL
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      const miners = randomIntBetween(5, 30);
      const deployedSOL = randomBetween(averageDeployedSOL * 0.5, averageDeployedSOL * 1.5);
      const isAboveAverage = deployedSOL > averageDeployedSOL;
      
      // 基于部署SOL数量计算颜色强度
      const intensity = Math.min(deployedSOL / (averageDeployedSOL * 1.5), 1);
      
      cells.push({
        id: `cell_${index}`,
        row,
        col,
        miners,
        deployedSOL,
        isAboveAverage,
        isSelected: false,
        colorIntensity: intensity
      });
    }
  }
  
  return cells;
}

// 生成挖矿统计数据
export function generateMiningStats(rounds: MiningRound[]): MiningStats {
  const latestRound = rounds[0];
  return {
    totalDeployedSOL: latestRound.totalDeployedSOL,
    uniqueMiners: latestRound.uniqueMiners,
    bids: latestRound.bids,
    buyback: latestRound.buyback,
    estimatedCost: latestRound.estimatedCost,
    averageDeployedSOL: rounds.reduce((sum, round) => sum + round.totalDeployedSOL, 0) / rounds.length
  };
}

// 生成交易数据
export function generateTransactionData(roundId: string, count: number = 20): TransactionData[] {
  const transactions: TransactionData[] = [];
  const types: ('deploy' | 'bid' | 'buyback')[] = ['deploy', 'bid', 'buyback'];
  const signers = Array.from({ length: 15 }, (_, i) => `Signer${i.toString().padStart(3, '0')}`);
  
  for (let i = 0; i < count; i++) {
    const type = types[randomIntBetween(0, types.length - 1)];
    const baseAmount = type === 'deploy' ? randomBetween(10, 100) : 
                      type === 'bid' ? randomBetween(1, 10) : 
                      randomBetween(5, 50);
    
    transactions.push({
      id: `${roundId}_tx_${i}`,
      type,
      amount: baseAmount,
      timestamp: Date.now() - randomIntBetween(0, 3600000), // 最近1小时内
      slot: randomIntBetween(1000000, 2000000),
      signer: signers[randomIntBetween(0, signers.length - 1)],
      success: Math.random() > 0.1 // 90% 成功率
    });
  }
  
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// 计算倒计时
export function calculateCountdown(endTime: number): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const now = Date.now();
  const remaining = Math.max(0, endTime - now);
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return {
    hours,
    minutes,
    seconds,
    isExpired: remaining === 0
  };
}

// 格式化数字
export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(decimals) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

// 格式化SOL数量
export function formatSOL(amount: number): string {
  return `${formatNumber(amount, 4)} SOL`;
}

// 格式化时间
export function formatTime(timestamp: number, timezone: 'local' | 'utc' = 'local'): string {
  const date = new Date(timestamp);
  
  if (timezone === 'utc') {
    return date.toISOString().slice(11, 19); // HH:MM:SS format
  }
  
  return date.toLocaleTimeString();
}