import { Connection, clusterApiUrl, Cluster } from '@solana/web3.js';
import { WalletAdapter } from '../types';

// Solana 网络配置
export const CLUSTERS: Record<string, { name: string; endpoint: string; cluster: Cluster }> = {
  mainnet: {
    name: 'Mainnet Beta',
    endpoint: clusterApiUrl('mainnet-beta'),
    cluster: 'mainnet-beta'
  },
  devnet: {
    name: 'Devnet',
    endpoint: clusterApiUrl('devnet'),
    cluster: 'devnet'
  },
  testnet: {
    name: 'Testnet',
    endpoint: clusterApiUrl('testnet'),
    cluster: 'testnet'
  }
};

export const DEFAULT_CLUSTER = 'devnet';

// 创建Solana连接
export function createConnection(cluster: string = DEFAULT_CLUSTER): Connection {
  const clusterConfig = CLUSTERS[cluster] || CLUSTERS[DEFAULT_CLUSTER];
  return new Connection(clusterConfig.endpoint, 'confirmed');
}

// 钱包适配器配置
export const WALLET_ADAPTERS: WalletAdapter[] = [
  {
    name: 'Phantom',
    url: 'https://phantom.app',
    icon: '/icons/phantom.svg'
  },
  {
    name: 'Solflare',
    url: 'https://solflare.com',
    icon: '/icons/solflare.svg'
  },
  {
    name: 'Sollet',
    url: 'https://sollet.io',
    icon: '/icons/sollet.svg'
  },
  {
    name: 'Clover',
    url: 'https://clover.finance',
    icon: '/icons/clover.svg'
  },
  {
    name: 'Coinbase Wallet',
    url: 'https://wallet.coinbase.com',
    icon: '/icons/coinbase.svg'
  },
  {
    name: 'Backpack',
    url: 'https://backpack.app',
    icon: '/icons/backpack.svg'
  }
];

// 获取钱包列表（基于可用的适配器）
export function getAvailableWallets() {
  return WALLET_ADAPTERS.filter(wallet => {
    // 检查钱包是否已安装
    switch (wallet.name.toLowerCase()) {
      case 'phantom':
        return typeof (window as any).solana !== 'undefined' && (window as any).solana.isPhantom;
      case 'solflare':
        return typeof (window as any).solflare !== 'undefined';
      case 'sollet':
        return typeof (window as any).sollet !== 'undefined';
      default:
        return true; // 对于其他钱包，我们显示它们供用户安装
    }
  });
}

// 检查钱包是否已安装
export function isWalletInstalled(walletName: string): boolean {
  switch (walletName.toLowerCase()) {
    case 'phantom':
      return typeof (window as any).solana !== 'undefined' && (window as any).solana.isPhantom;
    case 'solflare':
      return typeof (window as any).solflare !== 'undefined';
    case 'sollet':
      return typeof (window as any).sollet !== 'undefined';
    default:
      return false;
  }
}

// 获取钱包安装链接
export function getWalletInstallUrl(walletName: string): string {
  switch (walletName.toLowerCase()) {
    case 'phantom':
      return 'https://phantom.app/download';
    case 'solflare':
      return 'https://solflare.com/academy/what-is-solflare-wallet/';
    case 'sollet':
      return 'https://sollet.io';
    case 'clover':
      return 'https://clover.finance';
    case 'coinbase wallet':
      return 'https://wallet.coinbase.com/';
    case 'backpack':
      return 'https://backpack.app';
    default:
      return 'https://solana.com/wallets';
  }
}

// 格式化钱包地址
export function formatWalletAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// 格式化SOL余额
export function formatSOLBalance(balance: number): string {
  return `${balance.toFixed(4)} SOL`;
}

// 计算交易费用（模拟）
export function calculateTransactionFee(amount: number): number {
  // Solana交易费用通常很低，这里使用一个固定的模拟值
  return 0.000005; // 0.000005 SOL
}

// 验证SOL地址格式
export function isValidSolanaAddress(address: string): boolean {
  // Solana地址是32字节的Base58编码，通常以特定字符开头
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
}