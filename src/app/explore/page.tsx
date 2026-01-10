'use client';

import { useState } from 'react';
import Link from 'next/link';

type FilterType = 'all' | 'share-your-bags';
type SortType = 'new' | 'trending' | 'top';

// Mock data for demo - in production, fetch from Bags API
const MOCK_TOKENS = [
    {
        mint: 'Token1abc...',
        name: 'Community First',
        symbol: 'CF',
        imageUrl: '',
        holderShare: 50,
        volume24h: 125000,
        marketCap: 450000,
        createdAt: Date.now() - 1000 * 60 * 30,
        isShareYourBags: true,
    },
    {
        mint: 'Token2def...',
        name: 'Diamond Hands',
        symbol: 'DIAMOND',
        imageUrl: '',
        holderShare: 40,
        volume24h: 89000,
        marketCap: 320000,
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        isShareYourBags: true,
    },
    {
        mint: 'Token3ghi...',
        name: 'Solana Meme',
        symbol: 'SMEME',
        imageUrl: '',
        holderShare: 0,
        volume24h: 560000,
        marketCap: 1200000,
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        isShareYourBags: false,
    },
    {
        mint: 'Token4jkl...',
        name: 'Holder Rewards',
        symbol: 'HOLD',
        imageUrl: '',
        holderShare: 70,
        volume24h: 45000,
        marketCap: 180000,
        createdAt: Date.now() - 1000 * 60 * 60 * 8,
        isShareYourBags: true,
    },
    {
        mint: 'Token5mno...',
        name: 'Pump Token',
        symbol: 'PUMP',
        imageUrl: '',
        holderShare: 0,
        volume24h: 890000,
        marketCap: 2500000,
        createdAt: Date.now() - 1000 * 60 * 60 * 12,
        isShareYourBags: false,
    },
    {
        mint: 'Token6pqr...',
        name: 'Fair Launch',
        symbol: 'FAIR',
        imageUrl: '',
        holderShare: 35,
        volume24h: 67000,
        marketCap: 290000,
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        isShareYourBags: true,
    },
];

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function ExplorePage() {
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortType>('new');

    const filteredTokens = MOCK_TOKENS
        .filter(t => filter === 'all' || t.isShareYourBags)
        .sort((a, b) => {
            if (sort === 'new') return b.createdAt - a.createdAt;
            if (sort === 'trending') return b.volume24h - a.volume24h;
            return b.marketCap - a.marketCap;
        });

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Explore <span className="gradient-text">Tokens</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Discover the latest token launches. Filter by Share Your BAGS tokens to find
                        projects with built-in holder rewards.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    {/* Sort Tabs */}
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                        {[
                            { key: 'new', label: '🆕 New' },
                            { key: 'trending', label: '🔥 Trending' },
                            { key: 'top', label: '👑 Top 100' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSort(tab.key as SortType)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sort === tab.key
                                    ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                                    : 'hover:bg-white/10'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Filter:</span>
                        <button
                            onClick={() => setFilter(filter === 'all' ? 'share-your-bags' : 'all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'share-your-bags'
                                ? 'bg-[#14F195]/20 border border-[#14F195]/50 text-[#14F195]'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <span>💰</span>
                            Share Your BAGS Only
                            {filter === 'share-your-bags' && <span>✓</span>}
                        </button>
                    </div>
                </div>

                {/* Token Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTokens.map((token, i) => (
                        <Link
                            key={token.mint}
                            href={`/token/${token.mint}`}
                            className="glass-card p-5 hover:scale-[1.02] transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Token Avatar */}
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl font-bold text-white">
                                        {token.symbol.slice(0, 2)}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold truncate">{token.name}</h3>
                                        {token.isShareYourBags && (
                                            <span className="px-2 py-0.5 bg-[#14F195]/20 text-[#14F195] text-xs rounded-full flex-shrink-0">
                                                💰 {token.holderShare}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm">${token.symbol}</p>
                                </div>

                                <span className="text-gray-500 text-xs">{formatTimeAgo(token.createdAt)}</span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                <div>
                                    <div className="text-xs text-gray-500">Market Cap</div>
                                    <div className="font-medium">${formatNumber(token.marketCap)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">24h Volume</div>
                                    <div className="font-medium text-[#14F195]">${formatNumber(token.volume24h)}</div>
                                </div>
                                <div className="text-gray-400 group-hover:text-white transition-colors">
                                    View →
                                </div>
                            </div>

                            {/* Holder Share Progress (if applicable) */}
                            {token.isShareYourBags && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Holder rewards</span>
                                        <span className="text-[#14F195]">{token.holderShare}% of fees</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                                            style={{ width: `${token.holderShare}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {filteredTokens.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">No tokens found</h3>
                        <p className="text-gray-400 mb-6">
                            {filter === 'share-your-bags'
                                ? 'No Share Your BAGS tokens yet. Be the first to launch one!'
                                : 'No tokens available.'}
                        </p>
                        <Link href="/launch" className="btn-primary inline-block">
                            🚀 Launch a Token
                        </Link>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-12 text-center">
                    <div className="glass-card p-8 inline-block">
                        <h3 className="text-xl font-bold mb-2">Want holder rewards on your token?</h3>
                        <p className="text-gray-400 mb-4">Launch with Share Your BAGS and give back to your community.</p>
                        <Link href="/launch" className="btn-primary">
                            Launch with 30%+ to Holders
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
