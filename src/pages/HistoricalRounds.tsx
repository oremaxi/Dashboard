import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  HistoryIcon, 
  GridIcon, 
  ListIcon, 
  SearchIcon, 
  ClockIcon,
  TrendingUpIcon,
  ArrowLeftIcon,
  LoaderIcon,
  AlertCircleIcon,
  GlobeIcon
} from '../components/ui/Icon';
import { generateMockMiningRounds, formatSOL } from '../services/oreService';
import { createOREService, ORERealData } from '../services/oreRealService';
import { MiningRound } from '../types';
import { formatDateWithTimezone, formatTimeWithTimezone } from '../components/common/TimezoneSwitcher';

export const HistoricalRounds: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRound, setSelectedRound] = useState<any | null>(null);
  const [timezone] = useState<'local' | 'utc'>((localStorage.getItem('timezone') as 'local' | 'utc') || 'local');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realData, setRealData] = useState<ORERealData | null>(null);

  useEffect(() => {
    // 加载历史轮次数据
    init();
  }, []);

  const init =async ()=>
  {
    const oreService = createOREService();
    const data = await oreService.getRealOREData();
    const nowId = data.miningData.currentRound.roundNumber;
    const rounds = [];
    for(let i = 1 ; i <6 ; i++)
    {
      const res = await fetch('https://api.oremax.xyz/api/round/'+(nowId-i));
      const json = await res.json();
      // console.log("his :: ",json)
      rounds.push(json)
    }

    console.log("his :: ",rounds)
    let r = []
    if(rounds)
    {
      for(let i of rounds)
      {
        let totalMiners = 0;
        for(let u of i.count)
        {
          totalMiners+= u;
        }
        r.push({
          id: i?.round_id,
          roundNumber:i?.round_id,
          startSlot: 0, // 假设400ms per slot
          endSlot:0,
          currentSlot: 0,
          startTime:Date.now(),
          endTime:Date.now(),
          totalDeployedSOL:i?.total_deployed,
          uniqueMiners:totalMiners,
          bids:0,
          buyback:0,
          estimatedCost:0,
          status:'completed',
          raw:i,
          winning_square:i.winning_square
        });
      }
    setRounds(r)
    }

  }
  // const filteredRounds = rounds.filter(round => 
  //   round.roundNumber.toString().includes(searchTerm) ||
  //   round.status.includes(searchTerm.toLowerCase())
  // );

  const filteredRounds = rounds

  const handleRoundSelect = (round: MiningRound) => {
    setSelectedRound(round);
    navigate(`/historical/${round.id}`);
  };

  const handleBackToList = () => {
    setSelectedRound(null);
    navigate('/historical');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'completed':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'upcoming':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'upcoming':
        return '即将开始';
      default:
        return status;
    }
  };

  if (selectedRound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToList}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon size="sm" />
                <span>{t('historical.backToList')}</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  轮次 #{selectedRound.roundNumber}
                </h1>
                <p className="text-sm text-slate-400">
                  {(new Date(selectedRound.raw.resultUpdatedAt)).toString()}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(selectedRound.status)}`}>
              {getStatusText("completed")}
            </div>
          </div>

          {/* Round Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card variant="neumorphic">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatSOL(selectedRound.totalDeployedSOL)}
                  </div>
                  <div className="text-sm text-slate-400">{t('dashboard.totalDeployedSOL')}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="neumorphic">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {selectedRound.uniqueMiners}
                  </div>
                  <div className="text-sm text-slate-400">{"胜利矿工数"}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="neumorphic">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {selectedRound.raw.total_vaulted/1e9}
                  </div>
                  <div className="text-sm text-slate-400">{"项目方手续费"}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="neumorphic">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {selectedRound.raw.winning_square}
                  </div>
                  <div className="text-sm text-slate-400">{"胜利块"}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          {/* <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="text-blue-400" />
                <span>{t('historical.timeline')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-white">轮次开始</div>
                    <div className="text-xs text-slate-400">
                      {formatTimeWithTimezone(selectedRound.startTime, timezone)} {formatDateWithTimezone(selectedRound.startTime, timezone)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-white">当前进度</div>
                    <div className="text-xs text-slate-400">
                      Slot {selectedRound.currentSlot} / {selectedRound.endSlot}
                    </div>
                  </div>
                </div>
                
                {selectedRound.status === 'completed' && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-white">轮次结束</div>
                      <div className="text-xs text-slate-400">
                        {formatTimeWithTimezone(selectedRound.endTime, timezone)} {formatDateWithTimezone(selectedRound.endTime, timezone)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}

          {/* Detailed Statistics */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUpIcon className="text-blue-400" />
                <span>{t('historical.summary')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">交易分布</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">胜利块收益</span>
                      <span className="text-sm text-white">{formatSOL(selectedRound.raw.total_winnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">胜利块</span>
                      <span className="text-sm text-white">{selectedRound.raw.winning_square}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-sm text-slate-400">平均地址投注大小</span>
                      <span className="text-sm text-white">{formatSOL(selectedRound.raw.winningSquareDeployedSol/selectedRound.raw.winningSquareCount)}</span>
                    </div> */}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">性能指标</h4>
                  <div className="space-y-2">
                    {/* <div className="flex justify-between">
                      <span className="text-sm text-slate-400">平均胜利矿工收益</span>
                      <span className="text-sm text-white">
                        {formatSOL(selectedRound.raw.totalWinningsSol / selectedRound.uniqueMiners)}
                      </span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">轮次持续时间</span>
                      <span className="text-sm text-white">
                        {60} s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">母块ORE产出</span>
                      <span className="text-sm text-white">
                        {(Number(selectedRound.raw.motherlode)/1e6).toFixed(3)} ORE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('historical.title')}
            </h1>
            <p className="text-slate-400">
              查看历史挖矿轮次数据和统计信息
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ListIcon size="sm" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <GridIcon size="sm" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && rounds.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoaderIcon size="lg" className="animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-slate-400">正在加载历史数据...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <Card variant="glass" className="mb-6">
              <CardContent className="p-4 flex">
                <Input
                  placeholder="搜索轮次ID或状态..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<SearchIcon size="sm" />}
                  variant="neumorphic"
                />
            <Button
              variant={viewMode === 'card' ? 'primary' : 'outline'}
              size="sm"
              onClick={async () => {
                const oreService = createOREService();
                const nowId = searchTerm;
                const rounds = [];
                const res = await fetch('https://api.oremax.xyz/api/round/'+(nowId));
                const json = await res.json();
                rounds.push(json)
                console.log("his :: ",rounds)
                let r = []
                if(rounds)
                {
                  for(let i of rounds)
                  {
                    let totalMiners = 0;
                    for(let u of i.count)
                    {
                      totalMiners+= u;
                    }
                    r.push({
                      id: i?.round_id,
                      roundNumber:i?.round_id,
                      startSlot: 0, // 假设400ms per slot
                      endSlot:0,
                      currentSlot: 0,
                      startTime:Date.now(),
                      endTime:Date.now(),
                      totalDeployedSOL:i?.total_deployed,
                      uniqueMiners:totalMiners,
                      bids:0,
                      buyback:0,
                      estimatedCost:0,
                      status:'completed',
                      raw:i,
                      winning_square:i.winning_square
                    });
                  }
                setRounds(r)
                }
              }}
            >
              <GlobeIcon size="md" />
            </Button>
              </CardContent>
            </Card>

            {/* Rounds List/Card */}
            <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
              {filteredRounds.map((round) => (
                <div key={round.id} onClick={() => handleRoundSelect(round)}>
                  <Card 
                    variant="neumorphic" 
                    className="cursor-pointer hover:scale-105 transition-transform duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          轮次 #{round.roundNumber}
                        </CardTitle>
                        <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(round.status)}`}>
                          {getStatusText(round.status)}
                        </div>
                      </div>
                    </CardHeader>
                  
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">总部署SOL</span>
                          <span className="text-white font-mono">{formatSOL(round.totalDeployedSOL)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">胜利矿工数</span>
                          <span className="text-white">{round.uniqueMiners}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">胜利块</span>
                          <span className="text-white">#{round.winning_square}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">母块ORE产出</span>
                          <span className="text-white">{(Number(round.raw.motherlode)).toFixed(3)} ORE</span>
                        </div>
                        <div className="pt-3 border-t border-slate-700 text-xs text-slate-400">
                          {/* <div>{(new Date(round.raw.resultUpdatedAt)).toLocaleString()}</div> */}
                          <div>SLOT {round.raw.end_slot}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {/* {filteredRounds.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    上一页
                  </Button>
                  <span className="text-sm text-slate-400 px-4">
                    1 / {Math.ceil(filteredRounds.length / 10)}
                  </span>
                  <Button variant="outline" size="sm" disabled>
                    下一页
                  </Button>
                </div>
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  );
};