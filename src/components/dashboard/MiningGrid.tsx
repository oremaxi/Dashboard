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

// 生成真实的5x5网格数据
const generateRealGridData = (realData: any): GridCell[] => {
  const cells: GridCell[] = [];
  const totalMiners = realData.miningData.currentRound.activeMiners || 0;
  const totalDeployed = realData.miningData.currentRound.totalDeployedSOL || 0;
  const averagePerCell = totalDeployed / 25; // 5x5 = 25 cells
  let i = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cellId = `${row}-${col}`;
      const cellIndex = row * 5 + col;
      
      // 基于真实数据模拟每个区块的矿工分布
      // 使用算法生成有机的分布模式
      const miners =  realData?.miningData ? Number(realData.miningData.counts[i]) : 0;
      const deployedSOL = realData?.miningData ?  Number(realData.miningData.sols[i]) :0;
      const isAboveAverage = deployedSOL > averagePerCell;
      
      cells.push({
        id: cellId,
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
  const [cells, setCells] = useState<GridCell[]>(initialCells);
  const [realData, setRealData] = useState<ORERealData | null>(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载真实网格数据
  const loadRealGridData = async () => {
    if (!enableRealData) return;
    
    setIsLoadingRealData(true);
    setError(null);
    
    try {
      const oreService = createOREService();
      const data = await oreService.getRealOREData();
      setRealData(data);
      
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
    if (enableRealData) {
      loadRealGridData();
      
      // 每30秒自动刷新
      const interval = setInterval(loadRealGridData, 30000);
      return () => clearInterval(interval);
    }
  }, [enableRealData]);

  const handleCellClick = useCallback((cellId: string) => {
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
  }, [selectedCells, onCellToggle, onMultipleSelect]);

  const handleSelectAll = useCallback(() => {
    const allCellIds = cells.map(cell => cell.id);
    const newSelected = new Set(allCellIds);
    setSelectedCells(newSelected);
    
    if (onMultipleSelect) {
      onMultipleSelect(allCellIds);
    }
  }, [cells, onMultipleSelect]);

  const handleClearSelection = useCallback(() => {
    setSelectedCells(new Set());
    
    if (onMultipleSelect) {
      onMultipleSelect([]);
    }
  }, [onMultipleSelect]);

  // 计算颜色强度
  const getCellColor = (cell: GridCell) => {
    const baseColor = cell.isAboveAverage ? '#3b82f6' : '#64748b'; // blue or slate
    const intensity = cell.colorIntensity;
    
    if (cell.isSelected) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400';
    }
    
    return cn(
      'transition-all duration-300',
      cell.isAboveAverage 
        ? 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30 hover:border-blue-500' 
        : 'bg-slate-600/20 border-slate-500/50 hover:bg-slate-600/30 hover:border-slate-500'
    );
  };

  // 获取单元格的悬停文本
  const getCellTooltip = (cell: GridCell) => {
    return `${t('dashboard.minersPerCell')}: ${cell.miners}\n${t('dashboard.deployedSOLPerCell')}: ${cell.deployedSOL.toFixed(2)} SOL\n${cell.isAboveAverage ? t('dashboard.aboveAverage') : t('dashboard.belowAverage')}`;
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadRealGridData}
              disabled={isLoadingRealData}
              className="flex items-center space-x-1"
            >
              <RefreshIcon size="sm" />
              <span>刷新</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              disabled={selectedCells.size === 0}
            >
              清除选择
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              全选
            </Button>
          </div>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1">
            {error} - 显示模拟数据
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500/50 border border-blue-500 rounded"></div>
            <span>{t('dashboard.aboveAverage')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-slate-600/50 border border-slate-500 rounded"></div>
            <span>{t('dashboard.belowAverage')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <InfoIcon size="xs" />
            <span>{t('dashboard.selectMultiple')}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-5 gap-2 max-w-2xl">
          {cells.map((cell) => (
            <div
              key={cell.id}
              onClick={() => handleCellClick(cell.id)}
              className={cn(
                'relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200',
                'hover:scale-105 hover:shadow-lg',
                'flex flex-col items-center justify-center p-2',
                getCellColor(cell)
              )}
              title={getCellTooltip(cell)}
            >
              {/* 选择指示器 */}
              {selectedCells.has(cell.id) && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
              )}
              
              {/* 主要数据 */}
              <div className="text-center">
                <div className="text-xs font-bold text-white">
                  {cell.miners}
                </div>
                <div className="text-xs text-slate-300">
                  矿工
                </div>
              </div>
              
              {/* SOL 部署量 */}
              <div className="mt-1 text-center">
                <div className="text-xs text-slate-400">
                  {cell.deployedSOL.toFixed(1)}
                </div>
                <div className="text-xs text-slate-500">
                  SOL
                </div>
              </div>
              
              {/* 状态指示器 */}
              <div className={cn(
                'absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full',
                cell.isAboveAverage ? 'bg-blue-400' : 'bg-slate-400'
              )} />
            </div>
          ))}
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