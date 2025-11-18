import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MiningGrid } from '../components/dashboard/MiningGrid';
import { MiningStatsCards } from '../components/dashboard/StatsCards';
import { CountdownTimer } from '../components/dashboard/CountdownTimer';
import { TradingPanel } from '../components/dashboard/TradingPanel';
import { 
  generateMockMiningRounds, 
  generateGridData, 
  generateMiningStats,
  calculateCountdown,
  formatSOL 
} from '../services/oreService';
import { createOREService, ORERealData } from '../services/oreRealService';
import { GridIcon, RefreshIcon, AlertCircleIcon, LoaderIcon } from '../components/ui/Icon';
import { MiningRound } from '../types';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [realData, setRealData] = useState<ORERealData | null>(null);
  const [currentRound, setCurrentRound] = useState(generateMockMiningRounds(1)[0]);
  const [gridCells, setGridCells] = useState(generateGridData(currentRound));
  const [miningStats, setMiningStats] = useState(generateMiningStats([currentRound]));
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [timezone] = useState<'local' | 'utc'>((localStorage.getItem('timezone') as 'local' | 'utc') || 'local');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingRealData, setIsLoadingRealData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(true);

  // 初始化和定时刷新真实数据
  useEffect(() => {
    loadRealData();
    
    const interval = setInterval(() => {
      if (!isRefreshing) {
        loadRealData();
      }
    }, 30000); // 每30秒刷新一次

    return () => clearInterval(interval);
  }, [isRefreshing]);

  const loadRealData = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const oreService = createOREService();
      const data = await oreService.getRealOREData();
      setRealData(data);
      
      // 如果获取到真实数据，更新页面状态
      if (data?.miningData && data.miningData?.currentRound) {
        const currentTime = Date.now();
        const roundDuration = 24 * 60 * 60 * 1000; // 1天
        const startTime = data.miningData.currentRound.startTime;
        const endTime = data.miningData.currentRound.endTime;
        
        const realRound: any = {
          id: `round-${data.miningData.currentRound.roundNumber}`,
          roundNumber: data.miningData.currentRound.roundNumber,
          startTime,
          endTime,
          startSlot: data.realTimeData.slot,
          currentSlot: data.realTimeData.slot,
          endSlot: data.realTimeData.slot + 216000, // 一天的slots
          totalDeployedSOL: data.miningData.currentRound.totalDeployedSOL,
          uniqueMiners: data.miningData.statistics.activeMiners,
          bids: Math.floor(data.miningData.statistics.totalTransactions / 10), // 估算
          buyback: Math.random() * 1000 + 500, // 模拟
          estimatedCost: Math.random() * 500 + 200, // 模拟
          status: currentTime < endTime ? 'active' : 'completed',
          miningData : data.miningData
        };
        console.log("realRound",realRound)
        setCurrentRound(realRound);
        
        // 基于真实数据生成网格和统计
        const newGridCells = generateGridData(realRound);
        const newStats = generateMiningStats([realRound]);
        setGridCells(newGridCells);
        setMiningStats(newStats);
      }
      
      setLastUpdate(Date.now());
      setIsLoadingRealData(false);
    } catch (err) {
      console.error('加载真实数据失败:', err);
      setError('无法获取链上数据，使用模拟数据');
      setIsLoadingRealData(false);
      
      // 使用模拟数据作为降级
      const fallbackRound = generateMockMiningRounds(1)[0];
      setCurrentRound(fallbackRound);
      setGridCells(generateGridData(fallbackRound));
      setMiningStats(generateMiningStats([fallbackRound]));
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshData = () => {
    loadRealData();
  };

  const handleCellToggle = (cellId: string) => {
    const cellIndex = selectedCells.indexOf(cellId);
    if (cellIndex > -1) {
      setSelectedCells(prev => prev.filter(id => id !== cellId));
    } else {
      setSelectedCells(prev => [...prev, cellId]);
    }
  };

  const handleMultipleSelect = (cellIds: string[]) => {
    setSelectedCells(cellIds);
  };

  const handleDeploy = (amount: number) => {
    console.log(`部署 ${amount} SOL 到 ${selectedCells.length} 个区块`);
    // 这里可以添加实际的部署逻辑
    
    // 模拟交易成功后的反馈
    alert(`成功部署 ${amount} SOL 到 ${selectedCells.length} 个区块！`);
  };

  const countdown = calculateCountdown(currentRound.endTime);

  // 计算连接状态
  const getConnectionStatus = () => {
    if (isLoadingRealData) return { status: 'loading', text: '连接中...', color: 'yellow' };
    if (error && !realData) return { status: 'error', text: '数据获取失败', color: 'red' };
    if (realData?.realTimeData &&realData.realTimeData?.connectionHealth) return { status: 'connected', text: '已连接', color: 'green' };
    return { status: 'disconnected', text: '连接中断', color: 'red' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('navigation.dashboard')}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>{t('dashboard.roundId')}: {currentRound.roundNumber}</span>
              <span>•</span>
              <span>最后更新: {new Date(lastUpdate).toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 连接状态指示器 */}
            {/* <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus.color === 'green' ? 'bg-green-400 animate-pulse' :
                connectionStatus.color === 'yellow' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              <span className="text-xs text-slate-300">{connectionStatus.text}</span>
              {isLoadingRealData && <LoaderIcon size="sm" className="animate-spin" />}
            </div> */}

            <Button
              onClick={refreshData}
              isLoading={isRefreshing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshIcon size="sm" />
              <span>刷新数据</span>
            </Button>
          </div>
        </div>

        {/* 错误警告 */}
        {/* {error && (
          <div className="mb-6">
            <Card variant="glass" className="border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircleIcon size="md" className="text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="text-yellow-400 font-medium">数据获取警告</h3>
                    <p className="text-slate-300 text-sm mt-1">{error}</p>
                    <p className="text-slate-400 text-xs mt-1">当前显示的是模拟数据，实际链上数据可能有所不同。</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )} */}

        {/* Top Section: Stats and Countdown */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <MiningStatsCards stats={miningStats} />
          </div>
          <div>
            <CountdownTimer
              endTime={currentRound.endTime}
              currentSlot={currentRound.currentSlot}
              endSlot={currentRound.endSlot}
              timezone={timezone}
              onTimeUpdate={() => {}}
            />
          </div>
        </div>

        {/* Main Content: Grid and Trading Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Mining Grid */}
          <div className="xl:col-span-3">
            <MiningGrid
              cells={gridCells}
              onCellToggle={handleCellToggle}
              onMultipleSelect={handleMultipleSelect}
              className="h-full"
            />
          </div>

          {/* Trading Panel */}
          <div className="xl:col-span-1">
            <div className="sticky top-24">
              <TradingPanel
                onDeploy={handleDeploy}
                selectedCells={selectedCells}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GridIcon className="text-blue-400" />
                <span>快速导航</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                  <span className="text-xs">智能内存池</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                  <span className="text-xs">历史轮次</span>
                </Button>
                {/* <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                  <span className="text-xs">策略指南</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                  <span className="text-xs">API 文档</span>
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 系统状态 */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                connectionStatus.color === 'green' ? 'bg-green-400' :
                connectionStatus.color === 'yellow' ? 'bg-yellow-400' :
                'bg-red-400'
              }`}></div>
              <span>
                {connectionStatus.status === 'connected' ? '真实链上数据' :
                 connectionStatus.status === 'loading' ? '连接中' :
                 connectionStatus.status === 'error' ? '数据获取失败' :
                 '连接中断'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>实时数据同步</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                error ? 'bg-yellow-400' : 'bg-green-400'
              }`}></div>
              <span>{error ? '降级模式' : '系统正常'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};