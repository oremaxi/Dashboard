import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GridCell } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { InfoIcon, RefreshIcon, LoaderIcon } from '../ui/Icon';
import { cn } from '../../lib/utils';
import { createOREService, ORERealData } from '../../services/oreRealService';

interface MiningGridProps {
  cells: GridCell[];
  onCellToggle?: (cellId: string) => void;
  onMultipleSelect?: (cellIds: string[]) => void;
  className?: string;
  enableRealData?: boolean;
}

type CellLevel = 'farAbove' | 'above' | 'below' | 'farBelow' | 'normal';

// 生成真实的5x5网格数据
const generateRealGridData = (realData: any): any[] => {
  const cells: any[] = [];
  const totalMiners = realData.miningData.currentRound.activeMiners || 0;
  const totalDeployed = realData.miningData.currentRound.totalDeployedSOL || 0;
  const averagePerCell = totalDeployed / 25; // 5x5 = 25 cells
  let i = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cellId = i.toString();//`${row}-${col}`;
      const cellIndex = row * 5 + col;
      
      // 基于真实数据模拟每个区块的矿工分布
      // 使用算法生成有机的分布模式
      const miners =  realData?.miningData ? Number(realData.miningData.counts[i]) : 0;
      const deployedSOL = realData?.miningData ?  Number(realData.miningData.sols[i])/1e9 :0;
      const isAboveAverage = deployedSOL > averagePerCell;
      const totalDuration = realData.clock.endTime - realData.clock.startTime;
      const remaining = Math.max(0, realData.clock.endTime - Date.now());
      // const progress = realData.clock.endSlot > realData.clock.nowSlot ? (realData.clock.dStartSlot / realData.clock.dSlot)* 100 : 100;
      const progress = totalDuration > 0 ? ((totalDuration - remaining) / totalDuration) * 100 : 100;
      cells.push({
        id: cellId,
        progress,
        row,
        col,
        miners,
        deployedSOL,
        isSelected: false,
        isAboveAverage,
        colorIntensity: Math.min(deployedSOL / (averagePerCell * 1.5), 1)
      });

      i++;
    }
  }

  return cells;
};

export const MiningGrid: React.FC<MiningGridProps> = ({
  cells: initialCells,
  onCellToggle,
  onMultipleSelect,
  className,
  enableRealData = true
}) => {
  const { t } = useTranslation();
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [cells, setCells] = useState<any[]>(initialCells);
  const [realData, setRealData] = useState<ORERealData | null>(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 全局控制是否允许选择
  const [isSelectionEnabled, setIsSelectionEnabled] = useState(true);
  const [isTargetBlock, setIsTargetBlock] = useState('26');
  // 用当前 cells 计算部署均值（用于远高于/高于/低于/远低于）
  const totalDeployedSOL = cells.reduce((sum, cell) => sum + cell.deployedSOL, 0);
  const averageDeployedSOL = cells.length ? totalDeployedSOL / cells.length : 0;

  const getCellLevel = (cell: GridCell): CellLevel => {
    if (!averageDeployedSOL || !isFinite(averageDeployedSOL)) return 'normal';
    const ratio = cell.deployedSOL / averageDeployedSOL;

    if (ratio >= 1.1) return 'farAbove';   // 远高于均值
    if (ratio >= 1.0) return 'above';      // 高于均值
    if (ratio <= 0.9) return 'farBelow';   // 远低于均值
    if (ratio < 1.0) return 'below';       // 低于均值
    return 'normal';
  };

  // 颜色样式：四挡色块 + 选中态
  const getCellColorClasses = (cell: GridCell, level: CellLevel, isSelected: boolean) => {
    if (isSelected) {
      // 选中时高亮 + 渐变，背景主色保持一致系
      return 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300';
    }

    switch (level) {
      // case 'farAbove':
      //   // 远高于均值：亮绿色偏青
      //   return 'bg-emerald-500/30 border-emerald-300 hover:bg-emerald-500/40 hover:border-emerald-200';
      case 'above':case 'farAbove':
        // 偏红色
        return 'bg-rose-500/25 border-rose-500 hover:bg-rose-500/35 hover:border-rose-400';
      case 'below':
        // 稍浅绿色
        return 'bg-emerald-500/15 border-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-300';
      case 'farBelow':
        // 偏橙色
        return 'bg-amber-500/15 border-amber-400 hover:bg-amber-500/25 hover:border-amber-300';
      default:
        return 'bg-slate-600/20 border-slate-500/50 hover:bg-slate-600/30 hover:border-slate-500';
    }
  };

  // 加载真实网格数据
  const loadRealGridData = async () => {
    if (!enableRealData) return;
    
    setIsLoadingRealData(true);
    setError(null);
    
    try {
      const oreService = createOREService();
      const data = await oreService.getRealOREData();
      setRealData(data);
      const remaining = Math.max(0, data.clock.endTime - Date.now());
      // console.log("Now remaining",remaining)
      if(remaining)
      {
        setIsSelectionEnabled(true)
        localStorage.setItem("TargetBlock","26");
        setIsTargetBlock(`${26}`)
      }else{
        setIsSelectionEnabled(false)
        if(localStorage.getItem("TargetBlock")=="26")
        {
          try{
            console.log(isTargetBlock)
            const res = await fetch('https://api.oremax.xyz/api/round/'+(data.miningData.currentRound.roundNumber));
            const json = await res.json();
            console.log("Ret json :: ",json)
            localStorage.setItem("TargetBlock",`${json.winning_square}`);
            setIsTargetBlock(`${json.winning_square}`)
          }catch(e)
          {
            console.error(e)
          }
        }

      }
      const realCells = generateRealGridData(data);
      setCells(realCells);
    } catch (err) {
      console.error('获取真实网格数据失败:', err);
      setError('无法获取真实数据');
      // 保持使用传入的初始数据
    } finally {
      setIsLoadingRealData(false);
    }
  };

  // 初始化时加载数据
  useEffect(() => {
    localStorage.setItem("TargetBlock","26");
    if (enableRealData) {
      loadRealGridData();
      const interval = setInterval(loadRealGridData, 1000);
      return () => clearInterval(interval);
    }
  }, [enableRealData]);

  const handleCellClick = useCallback((cellId: string) => {
    // 选择被全局锁定时直接返回
    if (!isSelectionEnabled) return;

    const newSelected = new Set(selectedCells);
    
    if (newSelected.has(cellId)) {
      newSelected.delete(cellId);
    } else {
      newSelected.add(cellId);
    }
    
    setSelectedCells(newSelected);
    
    if (onCellToggle) {
      onCellToggle(cellId);
    }
    
    if (onMultipleSelect) {
      onMultipleSelect(Array.from(newSelected));
    }
  }, [selectedCells, onCellToggle, onMultipleSelect, isSelectionEnabled]);

  const handleSelectAll = useCallback(() => {
    if (!isSelectionEnabled) return;
    const allCellIds = cells.map(cell => cell.id);
    const newSelected = new Set(allCellIds);
    setSelectedCells(newSelected);
    
    if (onMultipleSelect) {
      onMultipleSelect(allCellIds);
    }
  }, [cells, onMultipleSelect, isSelectionEnabled]);

  const handleClearSelection = useCallback(() => {
    if (!isSelectionEnabled) return;
    setSelectedCells(new Set());
    
    if (onMultipleSelect) {
      onMultipleSelect([]);
    }
  }, [onMultipleSelect, isSelectionEnabled]);

  // 获取单元格的悬停文本
  const getCellTooltip = (cell: GridCell) => {
    const level = getCellLevel(cell);
    const levelTextMap: Record<CellLevel, string> = {
      farAbove: '远高于均值',
      above: '高于均值',
      below: '低于均值',
      farBelow: '远低于均值',
      normal: cell.isAboveAverage ? t('dashboard.aboveAverage') : t('dashboard.belowAverage')
    };

    return `${t('dashboard.minersPerCell')}: ${cell.miners}\n${t('dashboard.deployedSOLPerCell')}: ${cell.deployedSOL.toFixed(2)} SOL\n${levelTextMap[level]}`;
  };

  return (
    <Card variant="neumorphic" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{t('dashboard.gridTitle')}</span>
            {selectedCells.size > 0 && (
              <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg">
                {t('dashboard.selectedCells', { count: selectedCells.size })}
              </span>
            )}
            {isLoadingRealData && (
              <LoaderIcon size="sm" className="animate-spin text-blue-400" />
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* 真实数据指示器 */}
            <div className="flex items-center space-x-2 text-xs">
              {realData ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">真实数据</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400">模拟数据</span>
                </div>
              )}
            </div>
            
            {/* <Button
              variant="outline"
              size="sm"
              onClick={loadRealGridData}
              disabled={isLoadingRealData}
              className="flex items-center space-x-1"
            >
              <RefreshIcon size="sm" />
              <span>刷新</span>
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              disabled={selectedCells.size === 0 || !isSelectionEnabled}
            >
              清除选择
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={!isSelectionEnabled}
            >
              全选
            </Button>
            {/* 全局选择开关 */}
            {/* <Button
              variant="outline"
              size="sm"
              // onClick={() => setIsSelectionEnabled(prev => !prev)}
              className="flex items-center space-x-1"
            >
              <span>{isSelectionEnabled ? '🔓 进行中' : '🔒 已锁定'}</span>
            </Button> */}
          </div>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1">
            {error} - 显示模拟数据
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
          {/* <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-emerald-400/80 border border-emerald-300"></div>
            <span>远高于均值</span>
          </div> */}
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400"></div>
            <span>低于均值</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-amber-400/60 border border-amber-400"></div>
            <span>远低于均值</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-rose-500/70 border border-rose-500"></div>
            <span>高于均值</span>
          </div>
          {/* <div className="flex items-center space-x-1 ml-auto">
            <InfoIcon size="xs" />
            <span>{t('dashboard.selectMultiple')}</span>
          </div> */}
          {isTargetBlock}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-5 gap-2 max-w-2xl">
          {cells.map((cell) => {
            const isSelected = selectedCells.has(cell.id);
            const level = getCellLevel(cell);

            return (
              <div
                key={cell.id}
                onClick={() => handleCellClick(cell.id)}
                className={cn(
                  'relative aspect-square rounded-lg border-2 transition-all duration-200',
                  'flex flex-col items-center justify-center p-2 overflow-hidden',
                  (!isSelectionEnabled&&String(cell.id)!=isTargetBlock)
                    ? "hover:scale-105 hover:shadow-lg mask-enabled"
                    :'cursor-pointer hover:scale-105 hover:shadow-lg',// 'cursor-not-allowed opacity-60 ',
                  getCellColorClasses(cell, level, isSelected),
                  isSelected && 'scale-105 shadow-xl ring-2 ring-cyan-300'
                )}
                title={getCellTooltip(cell)}
              >
                {/* 选中高光层 */}
                {isSelected && (
                  <div className="pointer-events-none absolute inset-0 rounded-lg bg-white/10 mix-blend-screen" />
                )}

                {/* 禁用锁层 */}
                {/* {!isSelectionEnabled && (
                  <div className="pointer-events-none absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center text-2xl">
                    <span role="img" aria-label="locked">🔒</span>
                  </div>
                )} */}

                {/* 选择指示器 */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full shadow" />
                )}
                
                {/* 主要数据 */}
                <div className="relative text-center z-10">
                  <div className="text-xs text-slate-200">
                    #{cell.id}
                  </div>
                  <div className="text-xs font-bold text-white">
                    {cell.miners}👷
                  </div>
                </div>
                
                {/* SOL 部署量 */}
                <div className="relative mt-1 text-center z-10">
                  <div className="text-xs text-slate-100">
                    {cell.deployedSOL.toFixed(4)}
                  </div>
                  <div className="text-xs text-slate-300">
                    SOL
                  </div>
                </div>
                
                {/* 状态色块条：四挡强度可视化 */}
                <div
                  className={cn(
                    'absolute bottom-1 left-1 right-1 h-1.5 rounded-full z-10',
                   ( level === 'farAbove' ||  level === 'above') && 'bg-rose-500', 
                    // level === 'above' && 'bg-emerald-500',
                    level === 'below' && 'bg-emerald-300',
                    level === 'farBelow' && 'bg-amber-400',
                    level === 'normal' && 'bg-slate-400'
                  )}
                  style={{ width: `${cell.progress}%` }}
                />
              </div>
            );
          })}
        </div>
        
        {/* 统计信息 */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {cells.reduce((sum, cell) => sum + cell.miners, 0)}
              </div>
              <div className="text-slate-400">
                {realData ? '链上矿工' : '总矿工'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {cells.reduce((sum, cell) => sum + cell.deployedSOL, 0).toFixed(1)}
              </div>
              <div className="text-slate-400">
                {realData ? '链上SOL' : '总SOL'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                {cells.filter(cell => cell.isAboveAverage).length}
              </div>
              <div className="text-slate-400">高于均值</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {selectedCells.size}
              </div>
              <div className="text-slate-400">已选择</div>
            </div>
          </div>
          
          {/* 真实数据来源 */}
          {realData && (
            <div className="mt-2 text-xs text-slate-500 text-center">
              数据来源: Solana主网 (轮次 #{realData.miningData.currentRound.roundNumber})
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
