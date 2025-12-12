import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { GridIcon, HistoryIcon, SettingsIcon, BookOpenIcon, CodeIcon } from '../ui/Icon';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { TimezoneSwitcher,SolPrice,OrePrice } from '../common/TimezoneSwitcher';
import { WalletConnection } from '../wallet/WalletConnection';

const navItems = [
  {
    path: '/',
    label: 'navigation.dashboard',
    icon: GridIcon,
    exact: true
  },
  {
    path: '/historical',
    label: 'navigation.historical',
    icon: HistoryIcon,
    exact: true
  },
  // {
  //   path: '/strategies',
  //   label: 'navigation.strategies',
  //   icon: BookOpenIcon,
  //   exact: true
  // },
  // {
  //   path: '/api',
  //   label: 'navigation.api',
  //   icon: CodeIcon,
  //   exact: true
  // }
];

export const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActivePath = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div> */}
              <img src="/logo-white.png" alt="logo" style={{maxWidth:"50px",maxHeight:"50px"}} />
              <span className="text-xl font-bold text-white">OREMAX</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActivePath(item.path, item.exact) ? 'primary' : 'ghost'}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <item.icon size="sm" />
                  <span>{t(item.label)}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Timezone Switcher */}
            {/* <TimezoneSwitcher 
              value={localStorage.getItem('timezone') as 'local' | 'utc' || 'local'}
              onChange={(timezone) => {
                localStorage.setItem('timezone', timezone);
                window.location.reload();
              }}
            /> */}
            <SolPrice/>
            <OrePrice/>
            
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Wallet Connection */}
            <WalletConnection />

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <SettingsIcon size="sm" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActivePath(item.path, item.exact) ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <item.icon size="sm" />
                  <span className="text-xs">{t(item.label)}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};