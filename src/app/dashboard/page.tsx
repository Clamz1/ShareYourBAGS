'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
    { ssr: false }
);

// Placeholder data for demo
const DEMO_TOKENS = [
    {
        mint: 'DemoToken1...',
        name: 'Community Rewards Token',
        symbol: 'CRT',
        holderSharePercent: 50,
        pooledSol: 0.32,
        totalAirdrops: 2,
        lastAirdrop: '2 days ago',
    },
    {
        mint: 'DemoToken2...',
        name: 'Holder First Token',
        symbol: 'HFT',
        holderSharePercent: 70,
        pooledSol: 0.48,
        totalAirdrops: 5,
        lastAirdrop: '1 day ago',
    },
];

export default function DashboardPage() {
    const { connected, publicKey } = useWallet();

    if (!connected) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="glass-card p-12 text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                        <span className="text-4xl">📊</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">View Your Dashboard</h1>
                    <p className="text-gray-400 mb-8">
                        Connect your wallet to view your launched tokens and holder rewards.
                    </p>
                    <WalletMultiButton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
                        <p className="text-gray-400">
                            Connected: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-4)}
                        </p>
                    </div>
                    <Link href="/launch" className="btn-primary">
                        + Launch New Token
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="glass-card p-6">
                        <div className="text-gray-400 text-sm mb-1">Tokens Launched</div>
                        <div className="text-3xl font-bold">0</div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="text-gray-400 text-sm mb-1">Total Fees Earned</div>
                        <div className="text-3xl font-bold text-[#9945FF]">0 SOL</div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="text-gray-400 text-sm mb-1">Fees to Holders</div>
                        <div className="text-3xl font-bold text-[#14F195]">0 SOL</div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="text-gray-400 text-sm mb-1">Total Airdrops</div>
                        <div className="text-3xl font-bold">0</div>
                    </div>
                </div>

                {/* Your Tokens */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-bold mb-6">Your Tokens</h2>

                    {/* Empty State */}
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                            <span className="text-4xl opacity-50">🪙</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Tokens Yet</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            You haven't launched any tokens yet. Create your first token with
                            built-in holder rewards!
                        </p>
                        <Link href="/launch" className="btn-primary inline-block">
                            🚀 Launch Your First Token
                        </Link>
                    </div>

                    {/* Token List (shows when tokens exist) */}
                    {/* 
          <div className="space-y-4">
            {DEMO_TOKENS.map((token) => (
              <div key={token.mint} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                      <span className="text-xl">🪙</span>
                    </div>
                    <div>
                      <h3 className="font-bold">{token.name}</h3>
                      <p className="text-gray-400 text-sm">${token.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Holder Share</div>
                      <div className="font-bold text-[#14F195]">{token.holderSharePercent}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Pool Balance</div>
                      <div className="font-bold">{token.pooledSol} SOL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Airdrops</div>
                      <div className="font-bold">{token.totalAirdrops}</div>
                    </div>
                    <button className="btn-secondary text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Next airdrop at 0.5 SOL</span>
                    <span className="text-gray-400">{((token.pooledSol / 0.5) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all"
                      style={{ width: `${Math.min((token.pooledSol / 0.5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          */}
                </div>
            </div>
        </div>
    );
}
