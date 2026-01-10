'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useTokenInfo, useTopHolders, useFeePool, useAirdropHistory, useBagsSDK } from '@/lib/hooks';
import { claimFees, getBagsUrl, getSolscanUrl } from '@/lib/bags';

// Mock data for chart visualization (in production, fetch from API)
const PRICE_HISTORY = [
    { time: '00:00', price: 0.000100 },
    { time: '04:00', price: 0.000105 },
    { time: '08:00', price: 0.000098 },
    { time: '12:00', price: 0.000115 },
    { time: '16:00', price: 0.000120 },
    { time: '20:00', price: 0.000118 },
    { time: 'Now', price: 0.000125 },
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

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14F195]"></div>
        </div>
    );
}

function MetricCard({ label, value, subValue, variant = 'default' }: {
    label: string;
    value: string;
    subValue?: string;
    variant?: 'default' | 'success' | 'purple';
}) {
    const valueColor = variant === 'success' ? 'text-[#14F195]' : variant === 'purple' ? 'text-[#9945FF]' : '';
    return (
        <div className="glass-card p-4">
            <div className="text-gray-400 text-xs mb-1">{label}</div>
            <div className={`text-xl font-bold ${valueColor}`}>{value}</div>
            {subValue && <div className="text-xs text-gray-400">{subValue}</div>}
        </div>
    );
}

export default function TokenAnalyticsPage() {
    const params = useParams();
    const mint = params.mint as string;
    const { connected, publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const { sdk } = useBagsSDK();

    const [activeTab, setActiveTab] = useState<'overview' | 'holders' | 'airdrops' | 'analytics'>('overview');
    const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
    const [isClaiming, setIsClaiming] = useState(false);

    // Fetch real data using hooks
    const { tokenInfo, loading: tokenLoading, error: tokenError } = useTokenInfo(mint);
    const { holders, loading: holdersLoading } = useTopHolders(mint, 100);
    const { feePool, loading: feePoolLoading, refetch: refetchFeePool } = useFeePool(mint);
    const { airdrops, loading: airdropsLoading } = useAirdropHistory(mint);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        return num.toFixed(2);
    };

    const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    const handleClaimFees = async () => {
        if (!sdk || !publicKey || !signTransaction) return;

        setIsClaiming(true);
        try {
            const sig = await claimFees(sdk, mint, publicKey, signTransaction);
            alert(`Fees claimed successfully! Signature: ${sig.slice(0, 8)}...`);
            refetchFeePool();
        } catch (error: any) {
            alert(`Failed to claim fees: ${error.message}`);
        } finally {
            setIsClaiming(false);
        }
    };

    // Show loading state
    if (tokenLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-12 text-center">
                    <LoadingSpinner />
                    <p className="text-gray-400 mt-4">Loading token data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (tokenError || !tokenInfo) {
        // Use demo data for display
        const demoToken = {
            mint: mint,
            name: 'Demo Token',
            symbol: 'DEMO',
            description: 'This token data is displayed in demo mode.',
            imageUrl: '',
            price: 0.000125,
            marketCap: 125000,
            volume24h: 45000,
            holders: 847,
            holderShareBps: 4000,
            feePoolBalance: 0.42,
            createdAt: Date.now() - 86400000 * 4,
        };

        return renderTokenPage(demoToken);
    }

    function renderTokenPage(token: typeof tokenInfo) {
        if (!token) return null;

        const holderSharePercent = token.holderShareBps / 100;
        const creatorSharePercent = 100 - holderSharePercent;
        const poolBalance = feePool?.balance ?? token.feePoolBalance;

        return (
            <div className="min-h-screen py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
                        <span>/</span>
                        <span className="text-white">{token.symbol}</span>
                    </div>

                    {/* Token Header */}
                    <div className="glass-card p-8 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center overflow-hidden">
                                    {token.imageUrl ? (
                                        <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">🪙</span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold">{token.name}</h1>
                                        <span className="px-3 py-1 rounded-full bg-[#14F195]/20 text-[#14F195] text-sm font-medium">
                                            {holderSharePercent}% to Holders
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
                                    href={getBagsUrl(mint)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                >
                                    Trade on Bags.fm →
                                </a>
                                <a
                                    href={getSolscanUrl(mint, 'token')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                >
                                    Solscan
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                        <MetricCard
                            label="Price"
                            value={`$${token.price.toFixed(6)}`}
                        />
                        <MetricCard
                            label="Market Cap"
                            value={`$${formatNumber(token.marketCap)}`}
                        />
                        <MetricCard
                            label="24h Volume"
                            value={`$${formatNumber(token.volume24h)}`}
                        />
                        <MetricCard
                            label="Holders"
                            value={token.holders.toLocaleString()}
                        />
                        <MetricCard
                            label="Fee Pool"
                            value={`${poolBalance.toFixed(3)} SOL`}
                            subValue={`${Math.min((poolBalance / 0.5) * 100, 100).toFixed(0)}% to airdrop`}
                            variant="success"
                        />
                        <MetricCard
                            label="Holder Share"
                            value={`${holderSharePercent}%`}
                            subValue="of trading fees"
                            variant="purple"
                        />
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
                                        style={{ width: `${creatorSharePercent}%` }}
                                    >
                                        {creatorSharePercent}%
                                    </div>
                                    <div
                                        className="bg-[#14F195] flex items-center justify-center text-xs font-bold text-black"
                                        style={{ width: `${holderSharePercent}%` }}
                                    >
                                        {holderSharePercent}%
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-[#9945FF]" />
                                            <span className="text-gray-400">Creator</span>
                                        </div>
                                        <span className="font-medium">{creatorSharePercent}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-[#14F195]" />
                                            <span className="text-gray-400">Holders (Top 100)</span>
                                        </div>
                                        <span className="font-medium">{holderSharePercent}%</span>
                                    </div>
                                </div>

                                <hr className="border-white/10 my-6" />

                                {/* Next Airdrop Progress */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Next Airdrop</span>
                                        <span className="text-[#14F195]">{poolBalance.toFixed(3)} / 0.5 SOL</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all duration-500"
                                            style={{ width: `${Math.min((poolBalance / 0.5) * 100, 100)}%` }}
                                        />
                                    </div>
                                    {poolBalance >= 0.5 ? (
                                        <p className="text-sm text-[#14F195] mt-2 font-medium">
                                            🎉 Ready for airdrop!
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-2">
                                            {((0.5 - poolBalance) * 100 / 0.5).toFixed(0)}% remaining
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'holders' && (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Top Holders List */}
                            <div className="lg:col-span-2 glass-card p-6">
                                <h3 className="text-lg font-bold mb-6">Top 100 Holders</h3>
                                {holdersLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="space-y-3">
                                        {holders.slice(0, 10).map((holder) => (
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
                                                        <a
                                                            href={getSolscanUrl(holder.address, 'account')}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono text-sm hover:text-[#14F195] transition-colors"
                                                        >
                                                            {formatAddress(holder.address)}
                                                        </a>
                                                        <div className="text-xs text-gray-400">
                                                            {formatNumber(holder.balance)} {token.symbol}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-[#14F195]">{holder.percentage.toFixed(2)}%</div>
                                                    <div className="text-xs text-gray-400">of supply</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {holders.length > 10 && (
                                    <button className="w-full mt-4 py-3 text-center text-gray-400 hover:text-white transition-colors">
                                        View all {holders.length} holders →
                                    </button>
                                )}
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
                                            strokeDasharray={`${(holders[0]?.percentage || 12.5) * 2.51} ${100 * 2.51}`}
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
                                        <span className="font-medium">
                                            {holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Top 50 Hold</span>
                                        <span className="font-medium">
                                            {holders.slice(0, 50).reduce((sum, h) => sum + h.percentage, 0).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Top 100 Hold</span>
                                        <span className="font-medium">
                                            {holders.reduce((sum, h) => sum + h.percentage, 0).toFixed(1)}%
                                        </span>
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
                                {airdropsLoading ? (
                                    <LoadingSpinner />
                                ) : airdrops.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-4xl mb-4">💸</div>
                                        <p className="text-gray-400">No airdrops yet</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Fee pool needs 0.5 SOL to trigger an airdrop
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {airdrops.map((airdrop, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-[#14F195]/20 flex items-center justify-center">
                                                        <span className="text-2xl">💸</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">Airdrop #{i + 1}</div>
                                                        <div className="text-sm text-gray-400">
                                                            {new Date(airdrop.timestamp).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-[#14F195]">{airdrop.totalAmount.toFixed(3)} SOL</div>
                                                    <div className="text-sm text-gray-400">{airdrop.recipientCount} recipients</div>
                                                </div>
                                                <a
                                                    href={getSolscanUrl(airdrop.signature, 'tx')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    🔗
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Airdrop Stats */}
                            <div className="space-y-6">
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold mb-4">Stats</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-gray-400 text-sm">Total Distributed</div>
                                            <div className="text-2xl font-bold text-[#14F195]">
                                                {airdrops.reduce((sum, a) => sum + a.totalAmount, 0).toFixed(3)} SOL
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm">Total Airdrops</div>
                                            <div className="text-2xl font-bold">{airdrops.length}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm">Avg. per Airdrop</div>
                                            <div className="text-2xl font-bold">
                                                {airdrops.length > 0
                                                    ? (airdrops.reduce((sum, a) => sum + a.totalAmount, 0) / airdrops.length).toFixed(3)
                                                    : '0'} SOL
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold mb-4">Claim Fees</h3>
                                    {connected ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-400">
                                                If you're the token creator, you can claim your share of accumulated fees.
                                            </p>
                                            <button
                                                onClick={handleClaimFees}
                                                disabled={isClaiming}
                                                className="btn-primary w-full"
                                            >
                                                {isClaiming ? 'Claiming...' : 'Claim Creator Fees'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-sm">
                                            Connect wallet to claim fees
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
                                        <div className="text-gray-400 text-xs mb-1">Market Cap</div>
                                        <div className="text-lg font-bold">${formatNumber(token.marketCap)}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="text-gray-400 text-xs mb-1">24h Volume</div>
                                        <div className="text-lg font-bold">${formatNumber(token.volume24h)}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="text-gray-400 text-xs mb-1">Holders</div>
                                        <div className="text-lg font-bold">{token.holders.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="text-gray-400 text-xs mb-1">Holder Share</div>
                                        <div className="text-lg font-bold text-[#14F195]">{holderSharePercent}%</div>
                                    </div>
                                </div>

                                <hr className="border-white/10 my-6" />

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Current Price</span>
                                        <span className="font-bold">${token.price.toFixed(8)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Fee Pool</span>
                                        <span className="font-bold text-[#14F195]">{poolBalance.toFixed(3)} SOL</span>
                                    </div>
                                </div>
                            </div>

                            {/* Token Description */}
                            <div className="glass-card p-6 lg:col-span-2">
                                <h3 className="text-lg font-bold mb-4">About {token.name}</h3>
                                <p className="text-gray-400">{token.description || 'No description provided.'}</p>

                                <div className="mt-6 flex gap-4">
                                    <a
                                        href={getBagsUrl(mint)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary"
                                    >
                                        Trade on Bags.fm
                                    </a>
                                    <a
                                        href={getSolscanUrl(mint, 'token')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary"
                                    >
                                        View on Solscan
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return renderTokenPage(tokenInfo);
}
