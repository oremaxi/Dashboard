import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { WalletIcon, CheckIcon, InfoIcon } from '../ui/Icon';
import { formatSOLBalance, getAvailableWallets, getWalletInstallUrl } from '../../services/walletService';
import { createOREService } from '../../services/oreRealService';
import { Transaction } from '@solana/web3.js';
import toast from 'react-hot-toast';
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletConnection: React.FC = () => {
  const { t } = useTranslation();
  const { connected, connecting, publicKey } = useWallet();
  const { connection } = useConnection();
  const [availableWallets] = useState(getAvailableWallets());
  const [balance, setBalance] = useState<number | undefined>(undefined);
  
  // 更新钱包余额
  useEffect(() => {
    if (connected && connection && publicKey) {
      connection.getBalance(publicKey).then((balance) => {
        setBalance(balance);
        console.log('Wallet balance:', balance);
      }).catch((error) => {
        console.error('Failed to get balance:', error);
      });
    } else {
      setBalance(undefined);
    }
  }, [connected, connection, publicKey]);

  const handleDisconnect = () => {
    // 钱包适配器会自动处理断开连接
  };

  return (
    <div className="relative">
      <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-blue-600 !hover:!from-blue-600 !hover:!to-blue-700 !text-white !font-medium !rounded-xl !px-4 !py-2 !transition-all !duration-200 !shadow-lg" />
      
      {/* 连接状态指示器 */}
      {connected && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export const WalletInfo: React.FC = () => {
  const { t } = useTranslation();
  const { connected, publicKey } = useWallet();
  
  if (!connected || !publicKey) {
    return null;
  }
  
  return (
    <Card variant="glass" className="mt-4">
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckIcon size="sm" className="text-green-500" />
            <span className="text-sm text-slate-300">
              {t('wallet.connected')}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {publicKey.toString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SupportedWallets: React.FC = () => {
  const { t } = useTranslation();
  const wallets = getAvailableWallets();
  const installedWallets = wallets.filter(wallet => {
    // 这里可以检查钱包是否已安装
    return true; // 简化处理，显示所有钱包
  });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300 flex items-center space-x-2">
        <InfoIcon size="sm" />
        <span>{t('wallet.supportedWallets')}</span>
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {installedWallets.map((wallet) => (
          <div
            key={wallet.name}
            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {wallet.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-slate-300">{wallet.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(wallet.url, '_blank')}
            >
              {t('wallet.installWallet')}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-slate-400 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <InfoIcon size="sm" className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-300 mb-1">
              钱包连接说明
            </p>
            <p>
              点击上方任意钱包按钮进行连接。确保您的钱包已解锁并允许此网站访问。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};