import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../ui/Card';
import { SolIcon, TrendingUp, DollarSign } from '../ui/Icon';
import { formatNumber, formatSOL } from '../../services/oreService';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  loading?: boolean;
}

const colorVariants = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  red: 'text-red-400 bg-red-500/10 border-red-500/20'
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  loading = false
}) => {
  return (
    <Card variant="neumorphic" className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-slate-700 rounded mb-1"></div>
                {subtitle && <div className="h-4 w-16 bg-slate-700 rounded"></div>}
              </div>
            ) : (
              <>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-white">
                    {typeof value === 'number' ? formatNumber(value) : value}
                  </h3>
                  {trend && (
                    <div className={`flex items-center space-x-1 text-xs ${
                      trend.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendingUp size="sm" className={trend.isPositive ? 'rotate-0' : 'rotate-180'} />
                      <span>{Math.abs(trend.value)}%</span>
                    </div>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                )}
              </>
            )}
          </div>
          
          {/* <div className={`p-3 rounded-xl ${colorVariants[color]}`}>
            {icon}
          </div> */}
        </div>
      </CardContent>
      
      {/* 装饰性背景 */}
      {/* <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 ${color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : color === 'purple' ? 'bg-purple-500' : 'bg-red-500'}`} /> */}
    </Card>
  );
};

interface MiningStatsProps {
  stats: {
    totalDeployedSOL: number;
    uniqueMiners: number;
    bids: number;
    buyback: number;
    estimatedCost: number;
    motherlode:number
  };
  lastStats: {
    totalDeployedSOL: number;
    uniqueMiners: number;
    bids: number;
    buyback: number;
    estimatedCost: number;
    motherlode:number
  };
  loading?: boolean;
}

export const MiningStatsCards: React.FC<MiningStatsProps> = ({ stats,lastStats, loading = false }) => {
  const { t } = useTranslation();
  // console.log(stats)
  const cards = [
    {
      title: t('dashboard.totalDeployedSOL'),
      value: formatSOL(stats.totalDeployedSOL),
      icon: <SolIcon size="md" className="text-blue-400" />,
      color: 'blue' as const,
      trend: { value: ((stats.totalDeployedSOL -lastStats.totalDeployedSOL)/stats.totalDeployedSOL).toFixed(3), isPositive: stats.totalDeployedSOL >lastStats.totalDeployedSOL }
    },
    {
      title: t('dashboard.uniqueMiners'),
      value: stats.uniqueMiners,
      icon: <TrendingUp size="md" className="text-green-400" />,
      color: 'green' as const,
      trend: { value: ((stats.uniqueMiners -lastStats.uniqueMiners)/stats.uniqueMiners).toFixed(3) , isPositive: stats.uniqueMiners >lastStats.uniqueMiners }
    },
    {
      title: t('dashboard.motherBlock'),
      value: `${Number((stats.motherlode/1e11).toFixed(3))}`,
      icon: <DollarSign size="md" className="text-purple-400" />,
      color: 'purple' as const,
      trend: { value: ((stats.motherlode -lastStats.motherlode)/stats.motherlode).toFixed(3), isPositive: true }
    },
    {
      title: t('dashboard.motherBlockInterval'),
      value: `${Number((stats.motherlode/(0.2*1e11)).toFixed(0))}`,
      icon: <TrendingUp size="md" className="text-red-400" />,
      color: 'red' as const,
      trend: { value: 0, isPositive: true }
    }
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          trend={card.trend}
          loading={loading}
        />
      ))}
    </div>
  );
};