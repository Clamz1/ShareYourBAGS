'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlatformTokens } from '@/lib/hooks';
import { TokenInfo } from '@/lib/bags';

type FilterType = 'all' | 'share-your-bags';
type SortType = 'new' | 'trending' | 'top';

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(2);
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

function TokenCard({ token }: { token: TokenInfo }) {
    const holderShare = token.holderShareBps / 100;
    const isShareYourBags = token.holderShareBps >= 3000;

    return (
        <Link
            href={`/token/${token.mint}`}
            className="glass-card p-5 hover:scale-[1.02] transition-all group"
        >
            <div className="flex items-start gap-4">
                {/* Token Avatar */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {token.imageUrl ? (
                        <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-white">
                            {token.symbol.slice(0, 2)}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">{token.name}</h3>
                        {isShareYourBags && (
                            <span className="px-2 py-0.5 bg-[#14F195]/20 text-[#14F195] text-xs rounded-full flex-shrink-0">
                                💰 {holderShare}%
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
                <div>
                    <div className="text-xs text-gray-500">Holders</div>
                    <div className="font-medium">{token.holders}</div>
                </div>
                <div className="text-gray-400 group-hover:text-white transition-colors">
                    View →
                </div>
            </div>

            {/* Fee Pool Status */}
            {isShareYourBags && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Fee Pool</span>
                        <span className="text-[#14F195]">{token.feePoolBalance.toFixed(3)} SOL</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                            style={{ width: `${Math.min((token.feePoolBalance / 0.5) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {token.feePoolBalance >= 0.5
                            ? '🎉 Ready for airdrop!'
                            : `${((0.5 - token.feePoolBalance) / 0.5 * 100).toFixed(0)}% until airdrop`}
                    </div>
                </div>
            )}

            {/* Holder Share Progress */}
            {isShareYourBags && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Holder rewards</span>
                        <span className="text-[#14F195]">{holderShare}% of fees</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                            style={{ width: `${holderShare}%` }}
                        />
                    </div>
                </div>
            )}
        </Link>
    );
}

function LoadingCard() {
    return (
        <div className="glass-card p-5 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/10" />
                <div className="flex-1">
                    <div className="h-5 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-16 bg-white/10 rounded" />
                </div>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
                <div className="h-8 w-16 bg-white/10 rounded" />
                <div className="h-8 w-16 bg-white/10 rounded" />
                <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
        </div>
    );
}

export default function ExplorePage() {
    const { tokens, loading, error, refetch } = usePlatformTokens();
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortType>('new');

    const filteredTokens = tokens
        .filter(t => filter === 'all' || t.holderShareBps >= 3000)
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
                        Discover tokens launched through Share Your BAGS with built-in holder rewards.
                        All tokens shown share at least 30% of trading fees with holders.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    {/* Sort Tabs */}
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                        {[
                            { key: 'new', label: '🆕 New' },
                            { key: 'trending', label: '🔥 Trending' },
                            { key: 'top', label: '👑 Top' },
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

                    {/* Filter Toggle & Refresh */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setFilter(filter === 'all' ? 'share-your-bags' : 'all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'share-your-bags'
                                ? 'bg-[#14F195]/20 border border-[#14F195]/50 text-[#14F195]'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <span>💰</span>
                            High Rewards (50%+)
                            {filter === 'share-your-bags' && <span>✓</span>}
                        </button>
                        <button
                            onClick={() => refetch()}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Refresh"
                        >
                            🔄
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="glass-card p-4 mb-6 border border-red-500/30 bg-red-500/10">
                        <p className="text-red-400 text-sm">⚠️ {error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <LoadingCard key={i} />
                        ))}
                    </div>
                )}

                {/* Token Grid */}
                {!loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTokens.map((token) => (
                            <TokenCard key={token.mint} token={token} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredTokens.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">No tokens found</h3>
                        <p className="text-gray-400 mb-6">
                            {filter === 'share-your-bags'
                                ? 'No high-reward tokens yet. Be the first to launch one!'
                                : 'No tokens available. Launch the first one!'}
                        </p>
                        <Link href="/launch" className="btn-primary inline-block">
                            🚀 Launch a Token
                        </Link>
                    </div>
                )}

                {/* Stats Bar */}
                {!loading && tokens.length > 0 && (
                    <div className="mt-8 p-4 glass-card">
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold gradient-text">{tokens.length}</div>
                                <div className="text-gray-500">Total Tokens</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#14F195]">
                                    {tokens.filter(t => t.holderShareBps >= 3000).length}
                                </div>
                                <div className="text-gray-500">With Holder Rewards</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    ${formatNumber(tokens.reduce((sum, t) => sum + t.volume24h, 0))}
                                </div>
                                <div className="text-gray-500">24h Volume</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {tokens.reduce((sum, t) => sum + t.holders, 0).toLocaleString()}
                                </div>
                                <div className="text-gray-500">Total Holders</div>
                            </div>
                        </div>
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
