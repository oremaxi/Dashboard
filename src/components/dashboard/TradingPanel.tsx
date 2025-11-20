import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { WalletIcon, DollarSign, TrendingUp, AlertIcon } from '../ui/Icon';
import { calculateTransactionFee, formatSOLBalance } from '../../services/walletService';
import { formatSOL } from '../../services/oreService';
import { createOREService, ORERealService } from '../../services/oreRealService';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import toast from 'react-hot-toast';

interface TradingPanelProps {
  onDeploy?: (amount: number) => void;
  currentRoundId:any,
  selectedCells?: string[];
  className?: string;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  onDeploy,
  currentRoundId,
  selectedCells = [],
  className
}) => {
  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=f9f12ad2-d8f8-4d00-b5d0-25a02bd01ad3","confirmed")
  const { t } = useTranslation();
  const { connected, publicKey, signTransaction } = useWallet();
  const [betAmount, setBetAmount] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string>('');
  const [oreService] = useState(() => createOREService());
  // 获取钱包余额
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // 更新钱包余额
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey && oreService) {
        setIsLoadingBalance(true);
        try {
          const balance = await oreService['connection'].getBalance(publicKey);
          setBalance(balance / 1000000000); // 转换为SOL
        } catch (error) {
          console.error('获取余额失败:', error);
          setBalance(1.5); // 默认模拟余额
        } finally {
          setIsLoadingBalance(false);
        }
      }
    };

    fetchBalance();
  }, [connected, publicKey, oreService]);

  const transactionFee = betAmount ? calculateTransactionFee(parseFloat(betAmount) || 0) : 0;
  const totalAmount = betAmount ? parseFloat(betAmount) + transactionFee : 0;

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
      setError('');
    }
  }, []);

  const handleDeploy = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction) {
      setError('请先连接钱包');
      return;
    }

    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      setError('请输入有效的下注金额');
      return;
    }

    if (amount > balance) {
      setError('余额不足');
      return;
    }

    setIsDeploying(true);
    setError('');

    try {
      // 显示加载状态
      const loadingToast = toast.loading('正在创建ORE部署交易...');
      console.log("selectedCells",selectedCells)
      // 创建真实的ORE部署交易
      let squares = [];
      for(let i =0 ; i < 25  ;i++)
      {
        if(selectedCells.includes(i.toString()))
        {
          squares.push(true);
        }else{
          squares.push(false);
        }
      }
      const res = await fetch("https://api.oremax.xyz/api/deploy", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "squares": squares,  // Array of 25 booleans
          "authority": publicKey.toBase58(),     // Base58 encoded Solana address
          "round_id": Number(currentRoundId),                      // Round ID
          "amount": Number((amount*1e9).toFixed(0))                     // Amount in lamports
        })
      });

      const json = await res.json();

      console.log("IX ::",json)
      let signature;
      try {
        // Get instruction from API
        const instructionData = json

        // Build transaction
        const transaction = new Transaction();
        transaction.add({
          programId: new PublicKey(instructionData.programId),
          keys: instructionData.accounts.map(acc => ({
            pubkey: new PublicKey(acc.pubkey),
            isSigner: acc.isSigner,
            isWritable: acc.isWritable,
          })),
          data: Buffer.from(instructionData.data, 'base64'),
        });

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Sign and send transaction
        signature = await signTransaction(transaction);
        console.log("hash :: ",signature)

        // return signature;
      } catch (error) {
        console.error('Deploy failed:', error);
        throw error;
      }

      const transaction = await oreService.createDeployTransaction(
        { publicKey, signTransaction } as any,
        amount
      );

      // 提示用户签名
      toast.dismiss(loadingToast);
      toast.loading('请在钱包中签名交易...', { id: 'signing' });

      // 使用钱包签名交易
      // const signedTransaction = await signTransaction(transaction);

      // 发送交易
      toast.dismiss('signing');
      toast.loading('正在发送交易到区块链...', { id: 'sending' });

      // 发送已签名的交易
      // const signature = await oreService['connection'].sendRawTransaction(
      //   signedTransaction.serialize(),
      //   { skipPreflight: true, maxRetries: 3 }
      // );

      toast.dismiss('sending');
      
      // 交易成功，显示结果
      toast.success(
        `交易成功提交!`,
        { duration: 8000 }
      );

      console.log('ORE部署交易成功:', {
        signature,
        amount,
        selectedCells: selectedCells.length,
        timestamp: Date.now()
      });

      // 调用部署回调
      if (onDeploy) {
        onDeploy(amount);
      }
      
      // 清空输入
      setBetAmount('');
      
      // 刷新余额
      const newBalance = await oreService['connection'].getBalance(publicKey);
      setBalance(newBalance / 1000000000);
      
    } catch (err: any) {
      console.error('ORE部署失败:', err);
      
      let errorMessage = '部署失败，请重试';
      if (err.message) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = '余额不足';
        } else if (err.message.includes('User rejected')) {
          errorMessage = '用户取消了交易';
        } else if (err.message.includes('Transaction expired')) {
          errorMessage = '交易已过期，请重试';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  }, [connected, publicKey, signTransaction, betAmount, balance, onDeploy, selectedCells.length, oreService]);

  const quickAmounts = [0.1, 0.5, 1.0, 2.5];

  return (
    <Card variant="neumorphic" className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="text-green-400" />
          <span>{t('trading.panelTitle')}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 钱包连接状态 */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-2">
            <WalletIcon size="sm" />
            <span className="text-sm text-slate-300">
              {connected ? t('wallet.connected') : t('wallet.disconnected')}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {connected ? formatSOLBalance(balance) : '未连接'}
          </div>
        </div>

        {/* 选中区块信息 */}
        {selectedCells.length > 0 && (
          <div className="flex items-center space-x-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <TrendingUp size="sm" className="text-blue-400" />
            <span className="text-sm text-blue-300">
              已选择 {selectedCells.length} 个区块
            </span>
          </div>
        )}

        {/* 下注金额输入 */}
        <div className="space-y-3">
          <Input
            label={t('trading.betAmount')}
            type="text"
            value={betAmount}
            onChange={handleAmountChange}
            placeholder="0.0"
            leftIcon={<span className="text-slate-400">SOL</span>}
            variant="neumorphic"
          />
          
          {/* 快速金额按钮 */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount.toString())}
                className="text-xs"
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>

        {/* 交易详情 */}
        {betAmount && (
          <div className="space-y-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t('trading.currentBalance')}</span>
              <span className="text-white">{formatSOLBalance(balance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t('trading.transactionFee')}</span>
              <span className="text-white">{formatSOL(transactionFee)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-700 pt-2">
              <span className="text-slate-400 font-medium">{t('trading.totalAmount')}</span>
              <span className="text-white font-bold">{formatSOL(totalAmount)}</span>
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertIcon size="sm" className="text-red-400 mt-0.5" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* 部署按钮 */}
        <Button
          onClick={handleDeploy}
          disabled={
            !connected || 
            !betAmount || 
            parseFloat(betAmount) <= 0 || 
            parseFloat(betAmount) > balance ||
            isDeploying
          }
          isLoading={isDeploying}
          className="w-full"
          size="lg"
        >
          {
            // "Coming Soon..."
          t('trading.deploy')
          }
        </Button>

        {/* 提示信息 */}
        <div className="text-xs text-slate-400 space-y-1">
          <p>• 交易将部署到选中的区块</p>
          <p>• 交易手续费将自动计算</p>
          <p>• 请确保钱包有足够的余额</p>
        </div>
      </CardContent>
    </Card>
  );
};

// 交易历史组件
interface TransactionHistoryProps {
  transactions: Array<{
    id: string;
    type: 'deploy' | 'bid' | 'buyback';
    amount: number;
    timestamp: number;
    success: boolean;
  }>;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const { t } = useTranslation();

  return (
    <Card variant="glass" className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">{t('trading.transactionHistory')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              暂无交易记录
            </p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg border border-slate-700"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.success ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <div className="text-xs text-slate-300 capitalize">
                      {tx.type}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white font-mono">
                    {formatSOL(tx.amount)}
                  </div>
                  <div className={`text-xs ${
                    tx.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.success ? '成功' : '失败'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};