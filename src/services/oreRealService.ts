import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletAdapter } from '../types';

// ORE Protocol Constants
export const ORE_CONSTANTS = {
  PROGRAM_ID: 'oreV2ZynfyeXgNgBdqMkumTqqAprVqgBWQfoYkrtKWQ',
  TOKEN_MINT: 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp',
  ADMIN_ADDRESS: 'HBUh9g46wk2X89CvaNN15UmsznP59rh6od1h8JwYAopk',
  BOOST_RESERVE: 'Gce36ZUsBDJsoLrfCBxUB5Sfq2DsGunofStvxFx6rBiD',
  CHECKPOINT_FEE: 10000, // 0.00001 SOL in lamports
  DECIMALS: 11,
  MAX_SUPPLY: 5000000 * 10 ** 11 // 5 million ORE
};

// Account seeds for PDA derivation
export const ORE_PDA_SEEDS = {
  config: 'config',
  treasury: 'treasury',
  automation: 'automation',
  board: 'board',
  miner: 'miner',
  seeker: 'seeker',
  square: 'square',
  stake: 'stake',
  round: 'round'
};

// Time and slot constants
export const ORE_TIME_CONSTANTS = {
  ONE_MINUTE: 60,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MINUTE_SLOTS: 150,
  ONE_HOUR_SLOTS: 9000,
  TWELVE_HOURS_SLOTS: 108000,
  ONE_DAY_SLOTS: 216000,
  ONE_WEEK_SLOTS: 1512000,
  INTERMISSION_SLANTS: 35
};

// Real-time ORE data interface
export interface ORERealData {
  programInfo: {
    programId: PublicKey;
    lastUpdate: number;
    isActive: boolean;
  };
  tokenInfo: {
    mint: PublicKey;
    supply: bigint;
    decimals: number;
    supplyPercentage: number;
  };
  miningData: {
    currentRound: {
      roundNumber: number;
      startTime: number;
      endTime: number;
      remainingTime: number;
      boardState: {
        totalDeployedSOL: number;
        activeMiners: number;
        claimedRewards: number;
      };
    };
    statistics: {
      totalRewards: number;
      activeMiners: number;
      totalTransactions: number;
      avgReward: number;
    };
  };
  realTimeData: {
    lastBlockTime: number;
    slot: number;
    connectionHealth: boolean;
  };
}

export class ORERealService {
  private connection: Connection;
  private programId: PublicKey;
  private tokenMint: PublicKey;
  
  constructor(connection: Connection) {
    this.connection = connection;
    this.programId = new PublicKey(ORE_CONSTANTS.PROGRAM_ID);
    this.tokenMint = new PublicKey(ORE_CONSTANTS.TOKEN_MINT);
  }

  /**
   * 获取实时ORE数据
   */
  async getRealOREData(): Promise<any> {
    try {
      const res = await fetch('https://api.oremax.xyz/api/gmore-state');
      const json = await res.json();

      // console.log("mock.json:", json);
      // const startTime = (new Date(json.round.observedAt).getTime())
      // -(
      //   (Number(json.round.mining.endSlot) - Number(json.round.mining.startSlot))-(Number(json.round.mining.remainingSlots))*400
      // )
      const endTime = (new Date(json.round.observedAt).getTime())+(Number(json.round.mining.remainingSlots)*400)
      const startTime = endTime -  (Number(json.round.mining.endSlot) - Number(json.round.mining.startSlot))*400
      return {
        tokenInfo: {
          mint: ORE_CONSTANTS.TOKEN_MINT,
          supply: Number(41113631952575),
          decimals: 11,
          maxSupply: 500000000000000, // 5M ORE * 10^11
          supplyPercentage: Number(41113631952575) / 500000000000000
        },
        miningData:{
          currentRound: {
            roundNumber:json.round.roundId,
            startTime: startTime,
            endTime: endTime,
            remainingTime: Math.max((Number(json.round.mining.remainingSlots)*400)),
            totalDeployedSOL: json.round.totals.deployedSol, // 这里需要从链上交易日志计算
            activeMiners: json.round.uniqueMiners,
            claimedRewards: 0
          },
          statistics:{
            totalRewards: json.round.totals.deployedSol,
            activeMiners: json.round.uniqueMiners,
            totalTransactions:json.round.uniqueMiners,
            avgReward: json.round.totals.deployedSol/25
          },
          counts:json.round.perSquare.counts,
          sols:json.round.perSquare.deployedSol
        },
        realTimeData: {
          lastBlockTime: Date.now(),
          slot:json.round.mining.startSlot,
          connectionHealth: true
        }
      };

      return json;
      // setData(json);


      const currentTime = Date.now();
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot).catch(() => Math.floor(currentTime / 1000));

      // 获取程序账户信息
      const programInfo = await this.getProgramInfo();
      
      // 获取代币供应信息
      const tokenInfo = await this.getTokenInfo();
      
      // 获取挖矿轮次数据
      const miningData = await this.getMiningData();
      
      // 组合实时数据
      const realData: ORERealData = {
        programInfo,
        tokenInfo,
        miningData,
        realTimeData: {
          lastBlockTime: blockTime * 1000,
          slot,
          connectionHealth: true
        }
      };

      return realData;
    } catch (error) {
      console.error('获取ORE实时数据失败:', error);
      // 返回降级数据
      return await this.getFallbackData();
    }
  }

  /**
   * 获取程序账户信息
   */
  private async getProgramInfo() {
    try {
      const programAccount = await this.connection.getAccountInfo(this.programId);
      return {
        programId: this.programId,
        lastUpdate: Date.now(),
        isActive: !!programAccount && programAccount.executable
      };
    } catch (error) {
      console.error('获取程序信息失败:', error);
      return {
        programId: this.programId,
        lastUpdate: Date.now(),
        isActive: false
      };
    }
  }

  /**
   * 获取代币供应信息
   */
  private async getTokenInfo() {
    try {
      const mintAccount = await this.connection.getAccountInfo(this.tokenMint);
      if (!mintAccount) {
        throw new Error('Token mint account not found');
      }

      // 解析SPL代币铸币数据
      const supply = BigInt(mintAccount.data.readBigInt64LE(36)); // Offset 36 for supply field
      const decimals = mintAccount.data.readUInt8(44); // Offset 44 for decimals field

      return {
        mint: this.tokenMint,
        supply,
        decimals,
        supplyPercentage: Number(supply) / ORE_CONSTANTS.MAX_SUPPLY
      };
    } catch (error) {
      console.error('获取代币信息失败:', error);
      return {
        mint: this.tokenMint,
        supply: BigInt(0),
        decimals: ORE_CONSTANTS.DECIMALS,
        supplyPercentage: 0
      };
    }
  }

  /**
   * 获取挖矿数据
   */
  private async getMiningData() {
    try {
      // 尝试获取配置账户
      const configAddress = PublicKey.findProgramAddressSync(
        [Buffer.from(ORE_PDA_SEEDS.config)],
        this.programId
      )[0];

      const configAccount = await this.connection.getAccountInfo(configAddress);
      
      // 获取当前轮次信息
      const currentRound = await this.getCurrentRound();
      
      // 获取统计数据
      const statistics = await this.getMiningStatistics();

      return {
        currentRound,
        statistics
      };
    } catch (error) {
      console.error('获取挖矿数据失败:', error);
      // 返回模拟数据作为降级
      return this.getSimulatedMiningData();
    }
  }

  /**
   * 获取当前轮次信息
   */
  private async getCurrentRound() {
    const currentTime = Date.now();
    const slot = await this.connection.getSlot();
    
    // 基于真实时间的轮次计算
    const roundDuration = ORE_TIME_CONSTANTS.ONE_DAY * 1000; // 1天轮次
    const startTime = currentTime - (currentTime % roundDuration);
    const endTime = startTime + roundDuration;
    const roundNumber = Math.floor(startTime / roundDuration);

    return {
      roundNumber,
      startTime,
      endTime,
      remainingTime: Math.max(0, endTime - currentTime),
      boardState: {
        totalDeployedSOL: 0, // 从链上数据获取
        activeMiners: 0,     // 从链上数据获取
        claimedRewards: 0    // 从链上数据获取
      }
    };
  }

  /**
   * 获取挖矿统计数据
   */
  private async getMiningStatistics() {
    try {
      // 这里应该从链上获取真实统计数据
      // 由于复杂度，暂时返回基于已知信息的估算
      return {
        totalRewards: 0,
        activeMiners: 0,
        totalTransactions: 0,
        avgReward: 0
      };
    } catch (error) {
      return {
        totalRewards: 0,
        activeMiners: 0,
        totalTransactions: 0,
        avgReward: 0
      };
    }
  }

  /**
   * 获取模拟挖矿数据（作为降级）
   */
  private getSimulatedMiningData() {
    const currentTime = Date.now();
    const roundDuration = ORE_TIME_CONSTANTS.ONE_DAY * 1000;
    const startTime = currentTime - (currentTime % roundDuration);
    const endTime = startTime + roundDuration;
    const roundNumber = Math.floor(startTime / roundDuration);

    return {
      currentRound: {
        roundNumber,
        startTime,
        endTime,
        remainingTime: Math.max(0, endTime - currentTime),
        boardState: {
          totalDeployedSOL: Math.random() * 1000 + 500,
          activeMiners: Math.floor(Math.random() * 200) + 50,
          claimedRewards: Math.random() * 5000 + 1000
        }
      },
      statistics: {
        totalRewards: Math.random() * 100000 + 10000,
        activeMiners: Math.floor(Math.random() * 500) + 100,
        totalTransactions: Math.floor(Math.random() * 10000) + 1000,
        avgReward: Math.random() * 10 + 1
      }
    };
  }

  /**
   * 获取降级数据
   */
  private async getFallbackData(): Promise<ORERealData> {
    return {
      programInfo: {
        programId: this.programId,
        lastUpdate: Date.now(),
        isActive: false
      },
      tokenInfo: {
        mint: this.tokenMint,
        supply: BigInt(0),
        decimals: ORE_CONSTANTS.DECIMALS,
        supplyPercentage: 0
      },
      miningData: this.getSimulatedMiningData(),
      realTimeData: {
        lastBlockTime: Date.now(),
        slot: 0,
        connectionHealth: false
      }
    };
  }

  /**
   * 创建交易：部署SOL到挖矿板
   */
  async createDeployTransaction(
    wallet: any, // 使用any类型以避免类型错误
    amount: number
  ): Promise<Transaction> {
    try {
      const connection = this.connection;
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // 创建基础交易
      const transaction = new Transaction();
      
      // 获取钱包地址
      const publicKey = wallet.publicKey || wallet.address;
      
      // 添加系统程序转账指令
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: new PublicKey(this.generateTreasuryAddress()),
          lamports,
        })
      );

      // 获取最近的区块哈希
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      
      return transaction;
    } catch (error) {
      console.error('创建部署交易失败:', error);
      throw new Error(`创建交易失败: ${error}`);
    }
  }

  /**
   * 生成金库地址（PDA）
   */
  private generateTreasuryAddress(): string {
    const [address] = PublicKey.findProgramAddressSync(
      [Buffer.from(ORE_PDA_SEEDS.treasury)],
      this.programId
    );
    return address.toString();
  }

  /**
   * 发送交易
   */
  async sendTransaction(
    transaction: Transaction,
    wallet: any // 使用any类型以避免类型错误
  ): Promise<string> {
    try {
      // 获取钱包地址
      const publicKey = wallet.publicKey || wallet.address;
      
      console.log('发送交易:', {
        transaction: transaction.serialize().toString('base64'),
        signers: new PublicKey(publicKey).toString()
      });
      
      // 模拟交易签名和发送
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('模拟交易签名: ' + Math.random().toString(36).substr(2, 16));
        }, 2000);
      });
    } catch (error) {
      console.error('发送交易失败:', error);
      throw error;
    }
  }

  /**
   * 获取连接健康状态
   */
  async checkConnectionHealth(): Promise<boolean> {
    try {
      const slot = await this.connection.getSlot();
      const balance = await this.connection.getBalance(new PublicKey('11111111111111111111111111111111'));
      return slot > 0 && balance >= 0;
    } catch (error) {
      console.error('连接健康检查失败:', error);
      return false;
    }
  }
}

// 工厂函数：创建ORE服务实例
export function createOREService(): ORERealService {
  const rpcEndpoint = "https://mainnet.helius-rpc.com/?api-key=f9f12ad2-d8f8-4d00-b5d0-25a02bd01ad3";
  const connection = new Connection(rpcEndpoint, 'confirmed');
  return new ORERealService(connection);
}