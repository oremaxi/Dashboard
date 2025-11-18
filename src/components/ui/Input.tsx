import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'neumorphic';
}

const inputVariants = {
  default: 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500',
  neumorphic: 'bg-slate-800 text-white placeholder-slate-400 shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#2a2a2a] focus:shadow-[inset_6px_6px_12px_#1a1a1a,inset_-6px_-6px_12px_#2a2a2a]'
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">{leftIcon}</span>
          </div>
        )}
        <input
          className={cn(
            'w-full px-3 py-2 rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-2',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            inputVariants[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-slate-400">{rightIcon}</span>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
};