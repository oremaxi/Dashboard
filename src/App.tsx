import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Navigation } from './components/common/Navigation';
import { Dashboard } from './pages/Dashboard';
import { HistoricalRounds } from './pages/HistoricalRounds';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Import i18n configuration
import './locales';

import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

// Web3 配置
const network = 'devnet'; // 可以改为 'mainnet-beta' 用于生产环境
const endpoint = clusterApiUrl(network as any);

// 简化的钱包配置，避免依赖冲突
const wallets: any[] = [];

function App() {
  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Router>
              <div className="min-h-screen bg-slate-900 text-white">
                <Navigation />
                <main>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/historical" element={<HistoricalRounds />} />
                    <Route path="/historical/:id" element={<HistoricalRounds />} />
                    <Route path="/strategies" element={<StrategiesPage />} />
                    <Route path="/api" element={<ApiDocumentationPage />} />
                  </Routes>
                </main>
                <Toaster 
                  position="bottom-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1e293b',
                      color: '#ffffff',
                      border: '1px solid #475569',
                      borderRadius: '12px',
                    },
                  }}
                />
              </div>
            </Router>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}

// 策略页面占位组件
const StrategiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">策略指南</h1>
        <p className="text-slate-400">此页面正在开发中...</p>
      </div>
    </div>
  );
};

// API 文档页面占位组件
const ApiDocumentationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">API 文档</h1>
        <p className="text-slate-400">此页面正在开发中...</p>
      </div>
    </div>
  );
};

export default App;
