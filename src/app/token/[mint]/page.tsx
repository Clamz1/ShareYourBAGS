'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Mock data for demo - in production, fetch from Bags API
const MOCK_TOKEN_DATA = {
    name: 'Community Rewards Token',
    symbol: 'CRT',
    description: 'A token with built-in holder rewards. 50% of all trading fees go directly to top 100 holders.',
    imageUrl: '/token-placeholder.png',
    createdAt: '2024-01-05T12:00:00Z',
    creator: '8CrnUPw3g9aeCeqUSJhy1RUoGMw4WojPyjkcL5iDDmSa',
    marketCap: 125000,
    price: 0.000125,
    priceChange24h: 12.5,
    volume24h: 45000,
    holders: 847,
    holderSharePercent: 50,
    creatorSharePercent: 50,
    pooledFees: 0.42,
    totalAirdrops: 8,
    totalDistributed: 4.2,
};

const PRICE_HISTORY = [
    { time: '00:00', price: 0.000100 },
    { time: '04:00', price: 0.000105 },
    { time: '08:00', price: 0.000098 },
    { time: '12:00', price: 0.000115 },
    { time: '16:00', price: 0.000120 },
    { time: '20:00', price: 0.000118 },
    { time: 'Now', price: 0.000125 },
];

const TOP_HOLDERS = [
    { rank: 1, address: '7xKXtg2CW87d97xz8kM6HVLzqBe5x5WDvMa4ejKPLxJY', balance: 125000000, percentage: 12.5 },
    { rank: 2, address: '3zxQPL6BpDmfrZtBvA5JuLkvHVq7yFZqPMnVL6TvYqRk', balance: 98000000, percentage: 9.8 },
    { rank: 3, address: '9hFkJPqRVmLgZ7wqJvHbN8K4dE5pMnC2xBvAYrQWjPxy', balance: 75000000, percentage: 7.5 },
    { rank: 4, address: '2kPxR8T4mNvLqZcYwD6jF5b3H8sKpQvXyJuMdEaWbCnr', balance: 62000000, percentage: 6.2 },
    { rank: 5, address: '5mRzXv7kLqP2wYjNbD4gH8cF6tAeKsJnMpBxVuQyCfWz', balance: 48000000, percentage: 4.8 },
];

const AIRDROP_HISTORY = [
    { id: 1, date: '2024-01-08', amount: 0.52, recipients: 100, txSignature: '5KqR...x7Pz' },
    { id: 2, date: '2024-01-07', amount: 0.51, recipients: 98, txSignature: '3MnT...k2Lq' },
    { id: 3, date: '2024-01-06', amount: 0.55, recipients: 95, txSignature: '8JvP...m4Wy' },
    { id: 4, date: '2024-01-05', amount: 0.48, recipients: 89, txSignature: '2RxL...n6Bz' },
];

const VOLUME_DATA = [
    { day: 'Mon', volume: 32000 },
    { day: 'Tue', volume: 45000 },
    { day: 'Wed', volume: 28000 },
    { day: 'Thu', volume: 52000 },
    { day: 'Fri', volume: 61000 },
    { day: 'Sat', volume: 38000 },
    { day: 'Sun', volume: 45000 },
];

export default function TokenAnalyticsPage() {
    const params = useParams();
    const mint = params.mint as string;
    const { connected } = useWallet();
    const [activeTab, setActiveTab] = useState<'overview' | 'holders' | 'airdrops' | 'analytics'>('overview');
    const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');

    // In production, fetch real data here
    const token = MOCK_TOKEN_DATA;

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        return num.toFixed(2);
    };

    const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    return (
        <div className="min-h-screen py-8 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <span>/</span>
                    <span className="text-white">{token.symbol}</span>
                </div>

                {/* Token Header */}
                <div className="glass-card p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-4xl">
                                🪙
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold">{token.name}</h1>
                                    <span className="px-3 py-1 rounded-full bg-[#14F195]/20 text-[#14F195] text-sm font-medium">
                                        {token.holderSharePercent}% to Holders
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-400">
                                    <span className="font-mono">${token.symbol}</span>
                                    <span>•</span>
                                    <span className="font-mono text-sm">{formatAddress(mint)}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(mint)}
                                        className="hover:text-white transition-colors"
                                        title="Copy address"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <a
                                href={`https://bags.fm/${mint}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                Trade on Bags.fm →
                            </a>
                            <button className="btn-secondary">
                                Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="glass-card p-4">
                        <div className="text-gray-400 text-xs mb-1">Price</div>
                        <div className="text-xl font-bold">${token.price.toFixed(6)}</div>
                        <div className={`text-sm ${token.priceChange24h >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>
                            {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h}%
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="text-gray-400 text-xs mb-1">Market Cap</div>
                        <div className="text-xl font-bold">${formatNumber(token.marketCap)}</div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="text-gray-400 text-xs mb-1">24h Volume</div>
                        <div className="text-xl font-bold">${formatNumber(token.volume24h)}</div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="text-gray-400 text-xs mb-1">Holders</div>
                        <div className="text-xl font-bold">{token.holders.toLocaleString()}</div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="text-gray-400 text-xs mb-1">Fee Pool</div>
                        <div className="text-xl font-bold text-[#14F195]">{token.pooledFees} SOL</div>
                        <div className="text-xs text-gray-400">{((token.pooledFees / 0.5) * 100).toFixed(0)}% to airdrop</div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="text-gray-400 text-xs mb-1">Total Distributed</div>
                        <div className="text-xl font-bold text-[#9945FF]">{token.totalDistributed} SOL</div>
                        <div className="text-xs text-gray-400">{token.totalAirdrops} airdrops</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {(['overview', 'holders', 'airdrops', 'analytics'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab
                                    ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Price Chart */}
                        <div className="lg:col-span-2 glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Price Chart</h3>
                                <div className="flex gap-2">
                                    {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
                                        <button
                                            key={tf}
                                            onClick={() => setTimeframe(tf)}
                                            className={`px-3 py-1 rounded-lg text-sm ${timeframe === tf
                                                    ? 'bg-[#9945FF] text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Simple Chart Visualization */}
                            <div className="h-64 flex items-end gap-2">
                                {PRICE_HISTORY.map((point, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-to-t from-[#9945FF] to-[#14F195] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                            style={{ height: `${(point.price / 0.00013) * 100}%` }}
                                        />
                                        <span className="text-xs text-gray-500">{point.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fee Split Info */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">Fee Distribution</h3>

                            {/* Visual Split */}
                            <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-4">
                                <div
                                    className="bg-[#9945FF] flex items-center justify-center text-xs font-bold"
                                    style={{ width: `${token.creatorSharePercent}%` }}
                                >
                                    {token.creatorSharePercent}%
                                </div>
                                <div
                                    className="bg-[#14F195] flex items-center justify-center text-xs font-bold text-black"
                                    style={{ width: `${token.holderSharePercent}%` }}
                                >
                                    {token.holderSharePercent}%
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-[#9945FF]" />
                                        <span className="text-gray-400">Creator</span>
                                    </div>
                                    <span className="font-medium">{token.creatorSharePercent}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-[#14F195]" />
                                        <span className="text-gray-400">Holders (Top 100)</span>
                                    </div>
                                    <span className="font-medium">{token.holderSharePercent}%</span>
                                </div>
                            </div>

                            <hr className="border-white/10 my-6" />

                            {/* Next Airdrop Progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Next Airdrop</span>
                                    <span className="text-[#14F195]">{token.pooledFees} / 0.5 SOL</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all duration-500"
                                        style={{ width: `${Math.min((token.pooledFees / 0.5) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Estimated: ~{Math.ceil((0.5 - token.pooledFees) / 0.05)} days at current volume
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'holders' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Top Holders List */}
                        <div className="lg:col-span-2 glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">Top 100 Holders</h3>
                            <div className="space-y-3">
                                {TOP_HOLDERS.map((holder) => (
                                    <div
                                        key={holder.rank}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${holder.rank === 1 ? 'bg-yellow-500 text-black' :
                                                    holder.rank === 2 ? 'bg-gray-300 text-black' :
                                                        holder.rank === 3 ? 'bg-amber-600 text-white' :
                                                            'bg-white/10 text-gray-400'
                                                }`}>
                                                {holder.rank}
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm">{formatAddress(holder.address)}</div>
                                                <div className="text-xs text-gray-400">
                                                    {formatNumber(holder.balance)} {token.symbol}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-[#14F195]">{holder.percentage}%</div>
                                            <div className="text-xs text-gray-400">of supply</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-3 text-center text-gray-400 hover:text-white transition-colors">
                                View all 100 holders →
                            </button>
                        </div>

                        {/* Holder Distribution */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">Distribution</h3>

                            {/* Pie Chart Visualization */}
                            <div className="relative w-48 h-48 mx-auto mb-6">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="none"
                                        stroke="#9945FF"
                                        strokeWidth="20"
                                        strokeDasharray={`${12.5 * 2.51} ${100 * 2.51}`}
                                    />
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="none"
                                        stroke="#14F195"
                                        strokeWidth="20"
                                        strokeDasharray={`${9.8 * 2.51} ${100 * 2.51}`}
                                        strokeDashoffset={`${-12.5 * 2.51}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{token.holders}</div>
                                        <div className="text-xs text-gray-400">Holders</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Top 10 Hold</span>
                                    <span className="font-medium">45.2%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Top 50 Hold</span>
                                    <span className="font-medium">72.8%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Top 100 Hold</span>
                                    <span className="font-medium">85.4%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'airdrops' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Airdrop History */}
                        <div className="lg:col-span-2 glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">Airdrop History</h3>
                            <div className="space-y-4">
                                {AIRDROP_HISTORY.map((airdrop) => (
                                    <div
                                        key={airdrop.id}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#14F195]/20 flex items-center justify-center">
                                                <span className="text-2xl">💸</span>
                                            </div>
                                            <div>
                                                <div className="font-bold">Airdrop #{airdrop.id}</div>
                                                <div className="text-sm text-gray-400">{airdrop.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-[#14F195]">{airdrop.amount} SOL</div>
                                            <div className="text-sm text-gray-400">{airdrop.recipients} recipients</div>
                                        </div>
                                        <a
                                            href={`https://solscan.io/tx/${airdrop.txSignature}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            🔗
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Airdrop Stats */}
                        <div className="space-y-6">
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold mb-4">Stats</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-gray-400 text-sm">Total Distributed</div>
                                        <div className="text-2xl font-bold text-[#14F195]">{token.totalDistributed} SOL</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Total Airdrops</div>
                                        <div className="text-2xl font-bold">{token.totalAirdrops}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Avg. per Airdrop</div>
                                        <div className="text-2xl font-bold">{(token.totalDistributed / token.totalAirdrops).toFixed(2)} SOL</div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold mb-4">Your Rewards</h3>
                                {connected ? (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-gray-400 text-sm">Your Balance</div>
                                            <div className="text-xl font-bold">0 {token.symbol}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm">Total Earned</div>
                                            <div className="text-xl font-bold text-[#14F195]">0 SOL</div>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Hold tokens to earn from airdrops!
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">
                                        Connect wallet to see your rewards
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Volume Chart */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">7-Day Volume</h3>
                            <div className="h-48 flex items-end gap-3">
                                {VOLUME_DATA.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-to-t from-[#9945FF] to-[#14F195] rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                            style={{ height: `${(day.volume / 65000) * 100}%` }}
                                            title={`$${formatNumber(day.volume)}`}
                                        />
                                        <span className="text-xs text-gray-500">{day.day}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">7-Day Total</span>
                                    <span className="font-bold">${formatNumber(VOLUME_DATA.reduce((a, b) => a + b.volume, 0))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trading Stats */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">Trading Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="text-gray-400 text-xs mb-1">All-Time High</div>
                                    <div className="text-lg font-bold">$0.000185</div>
                                    <div className="text-xs text-gray-400">Jan 3, 2024</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="text-gray-400 text-xs mb-1">All-Time Low</div>
                                    <div className="text-lg font-bold">$0.000042</div>
                                    <div className="text-xs text-gray-400">Jan 1, 2024</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="text-gray-400 text-xs mb-1">Total Trades</div>
                                    <div className="text-lg font-bold">12,847</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="text-gray-400 text-xs mb-1">Unique Traders</div>
                                    <div className="text-lg font-bold">1,256</div>
                                </div>
                            </div>

                            <hr className="border-white/10 my-6" />

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Buys (24h)</span>
                                    <span className="text-[#14F195]">+234</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Sells (24h)</span>
                                    <span className="text-red-400">-189</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Buy/Sell Ratio</span>
                                    <span className="font-bold">1.24</span>
                                </div>
                            </div>
                        </div>

                        {/* Fee Generation */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">Fee Generation</h3>
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Today</span>
                                        <span className="text-xl font-bold text-[#14F195]">+0.08 SOL</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">This Week</span>
                                        <span className="text-xl font-bold text-[#14F195]">+0.42 SOL</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">All Time</span>
                                        <span className="text-xl font-bold text-[#14F195]">+4.62 SOL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Stats */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">Community</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <a href="#" className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🐦</span>
                                        <div>
                                            <div className="font-medium">Twitter</div>
                                            <div className="text-sm text-gray-400">2.4K followers</div>
                                        </div>
                                    </div>
                                </a>
                                <a href="#" className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💬</span>
                                        <div>
                                            <div className="font-medium">Telegram</div>
                                            <div className="text-sm text-gray-400">1.8K members</div>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            <hr className="border-white/10 my-6" />

                            <div className="text-center">
                                <div className="text-gray-400 text-sm mb-2">Token Age</div>
                                <div className="text-2xl font-bold">4 days</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
