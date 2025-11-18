import React from 'react';
import { cn } from '../../lib/utils';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

interface IconSvgProps extends IconProps {
  children: React.ReactNode;
}

export const Icon: React.FC<IconSvgProps> = ({ 
  size = 'md', 
  className, 
  children, 
  ...props 
}) => {
  return (
    <svg
      className={cn(sizes[size], className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      {children}
    </svg>
  );
};

// 预定义的图标组件
export const WalletIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Icon>
);

export const SolIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2L3.5 9.5 12 17l8.5-7.5L12 2z" />
    <path d="M12 7l-4.5 3.5L12 14l4.5-3.5L12 7z" />
  </Icon>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </Icon>
);

export const GridIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </Icon>
);

export const ChartIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
  </Icon>
);

export const HistoryIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l3 3" />
  </Icon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 12v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m12 0h6" />
  </Icon>
);

export const GlobeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </Icon>
);

export const SunIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </Icon>
);

export const MoonIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Icon>
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="20,6 9,17 4,12" />
  </Icon>
);

export const ArrowUpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="18,15 12,9 6,15" />
  </Icon>
);

export const ArrowDownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="6,9 12,15 18,9" />
  </Icon>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="1,4 1,10 7,10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </Icon>
);

export const LinkIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icon>
);

export const InfoIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Icon>
);

export const AlertIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </Icon>
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </Icon>
);

// Additional icons for specific use cases
export const BookOpenIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Icon>
);

export const CodeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </Icon>
);

export const ListIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </Icon>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </Icon>
);

export const TrendingUpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
    <polyline points="16,7 22,7 22,13" />
  </Icon>
);

export const TrendingDownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="22,17 13.5,8.5 8.5,13.5 2,7" />
    <polyline points="16,17 22,17 22,11" />
  </Icon>
);

export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </Icon>
);

export const DollarSignIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
);

export const TrendingUp: React.FC<IconProps> = TrendingUpIcon;
export const TrendingDown: React.FC<IconProps> = TrendingDownIcon;
export const DollarSign: React.FC<IconProps> = DollarSignIcon;

// 额外图标
export const LoaderIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2v3m0 12v3m9-9h-3M6 12H3m12.364-6.364l-2.121 2.121m-7.071 7.071l-2.121 2.121M18.364 18.364l-2.121-2.121M6.636 6.636l-2.121-2.121" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const AlertCircleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);