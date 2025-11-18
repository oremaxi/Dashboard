import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ClockIcon, RefreshIcon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { formatTimeWithTimezone, formatDateWithTimezone } from '../common/TimezoneSwitcher';

interface CountdownProps {
  endTime: number;
  currentSlot: number;
  endSlot: number;
  timezone: 'local' | 'utc';
  onTimeUpdate?: (currentTime: number) => void;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  progress: number;
}

export const CountdownTimer: React.FC<CountdownProps> = ({
  endTime,
  currentSlot,
  endSlot,
  timezone,
  onTimeUpdate
}) => {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    progress: 0
  });

  const [isManualRefresh, setIsManualRefresh] = useState(false);

  // 计算倒计时和进度
  const calculateTimeRemaining = () => {
    const now = Date.now();
    const totalDuration = endTime - (now - 300000); // 假设开始时间比现在早5分钟
    const remaining = Math.max(0, endTime - now);
    const progress = totalDuration > 0 ? ((totalDuration - remaining) / totalDuration) * 100 : 100;

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    const result = {
      hours,
      minutes,
      seconds,
      isExpired: remaining === 0,
      progress: Math.min(Math.max(progress, 0), 100)
    };

    setTimeRemaining(result);
    onTimeUpdate?.(now);
  };

  // 更新倒计时
  useEffect(() => {
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [endTime, onTimeUpdate]);

  const handleManualRefresh = () => {
    setIsManualRefresh(true);
    calculateTimeRemaining();
    setTimeout(() => setIsManualRefresh(false), 1000);
  };

  // 计算基于slot的进度
  const slotProgress = endSlot > currentSlot 
    ? ((currentSlot - (endSlot - 7200)) / 7200) * 100 // 假设轮次持续2小时(7200 slots)
    : 100;

  return (
    <Card variant="neumorphic" className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="text-blue-400" />
            <span>{t('dashboard.countdown')}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            className="p-1"
            disabled={isManualRefresh}
          >
            <RefreshIcon size="sm" className={isManualRefresh ? 'animate-spin' : ''} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* 时间显示 */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {timeRemaining.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-slate-400">{t('time.hours')}</div>
            </div>
            <div className="text-2xl text-slate-400">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {timeRemaining.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-slate-400">{t('time.minutes')}</div>
            </div>
            <div className="text-2xl text-slate-400">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {timeRemaining.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-slate-400">{t('time.seconds')}</div>
            </div>
          </div>
          
          {/* 时间戳信息 */}
          <div className="text-xs text-slate-400 space-y-1">
            <div>{formatTimeWithTimezone(endTime, timezone)}</div>
            <div>{formatDateWithTimezone(endTime, timezone)}</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="space-y-3">
          {/* 时间进度 */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>时间进度</span>
              <span>{timeRemaining.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${timeRemaining.progress}%` }}
              />
            </div>
          </div>

          {/* Slot进度 */}
          {/* <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Slot进度</span>
              <span>{Math.max(0, Math.min(100, slotProgress)).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(0, Math.min(100, slotProgress))}%` }}
              />
            </div>
          </div> */}
        </div>

        {/* 状态指示 */}
        <div className="mt-4 flex items-center justify-center">
          {timeRemaining.isExpired ? (
            <div className="flex items-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-sm">轮次已结束</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">轮次进行中</span>
            </div>
          )}
        </div>

        {/* Slot信息 */}
        {/* <div className="mt-4 pt-4 border-t border-slate-700 text-center">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-slate-400">当前Slot</div>
              <div className="text-white font-mono">{currentSlot.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-slate-400">结束Slot</div>
              <div className="text-white font-mono">{endSlot.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-slate-400">剩余Slots</div>
              <div className="text-white font-mono">{Math.max(0, endSlot - currentSlot).toLocaleString()}</div>
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
};