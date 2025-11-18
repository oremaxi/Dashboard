import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'neumorphic' | 'glass' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
}

const cardVariants = {
  default: 'bg-slate-800 border border-slate-700',
  neumorphic: 'bg-slate-800 shadow-[8px_8px_16px_#1a1a1a,-8px_-8px_16px_#2a2a2a]',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20',
  elevated: 'bg-slate-800 shadow-xl border border-slate-700 hover:shadow-2xl transition-shadow'
};

const paddingVariants = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md'
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        cardVariants[variant],
        paddingVariants[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('text-slate-300', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-slate-700', className)}>
      {children}
    </div>
  );
};