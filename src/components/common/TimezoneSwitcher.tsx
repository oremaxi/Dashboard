import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SunIcon, ClockIcon } from '../ui/Icon';
import { Button } from '../ui/Button';

type Timezone = 'local' | 'utc';

interface TimezoneSwitcherProps {
  value: Timezone;
  onChange: (timezone: Timezone) => void;
}

export const TimezoneSwitcher: React.FC<TimezoneSwitcherProps> = ({
  value,
  onChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
      <Button
        variant={value === 'local' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onChange('local')}
        className="flex items-center space-x-1 px-3"
      >
        <SunIcon size="sm" />
        <span className="hidden sm:inline text-xs">{t('time.localTime')}</span>
      </Button>
      {/* <Button
        variant={value === 'utc' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onChange('utc')}
        className="flex items-center space-x-1 px-3"
      >
        <ClockIcon size="sm" />
        <span className="hidden sm:inline text-xs">UTC</span>
      </Button> */}
    </div>
  );
};

// 自定义Hook用于管理时区
export const useTimezone = () => {
  const [timezone, setTimezone] = useState<Timezone>(() => {
    return (localStorage.getItem('timezone') as Timezone) || 'local';
  });

  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  return { timezone, setTimezone };
};

// 时区转换工具函数
export const formatTimeWithTimezone = (
  timestamp: number,
  timezone: Timezone
): string => {
  const date = new Date(timestamp);
  
  if (timezone === 'utc') {
    return date.toISOString().slice(11, 19); // HH:MM:SS format
  }
  
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDateWithTimezone = (
  timestamp: number,
  timezone: Timezone
): string => {
  const date = new Date(timestamp);
  
  if (timezone === 'utc') {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD format
  }
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};