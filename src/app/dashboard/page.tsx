'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePlatformTokens, useBagsSDK } from '@/lib/hooks';
import { claimFees, getBagsUrl, TokenInfo } from '@/lib/bags';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14F195]"></div>
    </div>
  );
}

function TokenCard({ token, onClaimFees }: { token: TokenInfo; onClaimFees: (mint: string) => void }) {
  const holderShare = token.holderShareBps / 100;
  const poolProgress = Math.min((token.feePoolBalance / 0.5) * 100, 100);

  return (
    <div className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center overflow-hidden">
            {token.imageUrl ? (
              <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🪙</span>
            )}
          </div>
          <div>
            <h3 className="font-bold">{token.name}</h3>
            <p className="text-gray-400 text-sm">${token.symbol}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          <div className="text-center md:text-right">
            <div className="text-xs text-gray-400">Holder Share</div>
            <div className="font-bold text-[#14F195]">{holderShare}%</div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-xs text-gray-400">Market Cap</div>
            <div className="font-bold">${formatNumber(token.marketCap)}</div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-xs text-gray-400">Fee Pool</div>
            <div className="font-bold text-[#14F195]">{token.feePoolBalance.toFixed(3)} SOL</div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-xs text-gray-400">Holders</div>
            <div className="font-bold">{token.holders}</div>
          </div>
          <div className="flex gap-2">
            <Link href={`/token/${token.mint}`} className="btn-secondary text-sm py-2 px-4">
              Analytics →
            </Link>
            <button
              onClick={() => onClaimFees(token.mint)}
              className="btn-primary text-sm py-2 px-4"
            >
              Claim
            </button>
          </div>
        </div>
      </div>

      {/* Fee Pool Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Next airdrop at 0.5 SOL</span>
          <span className={poolProgress >= 100 ? 'text-[#14F195] font-medium' : 'text-gray-400'}>
            {poolProgress >= 100 ? '🎉 Ready!' : `${poolProgress.toFixed(0)}%`}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all"
            style={{ width: `${poolProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { sdk } = useBagsSDK();
  const { tokens, loading, refetch } = usePlatformTokens();
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  // In a real app, filter tokens by creator wallet
  // For demo, show all platform tokens as if they belong to the user
  const userTokens = tokens;

  const handleClaimFees = async (tokenMint: string) => {
    if (!sdk || !publicKey || !signTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    setIsClaiming(tokenMint);
    try {
      const sig = await claimFees(sdk, tokenMint, publicKey, signTransaction);
      alert(`Fees claimed successfully! Signature: ${sig.slice(0, 8)}...`);
      refetch();
    } catch (error: any) {
      alert(`Failed to claim fees: ${error.message}`);
    } finally {
      setIsClaiming(null);
    }
  };

  // Calculate totals
  const totalTokens = userTokens.length;
  const totalFeePool = userTokens.reduce((sum, t) => sum + t.feePoolBalance, 0);
  const totalVolume = userTokens.reduce((sum, t) => sum + t.volume24h, 0);
  const totalHolders = userTokens.reduce((sum, t) => sum + t.holders, 0);

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">View Your Dashboard</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to view your launched tokens and analytics.
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
              Connected: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-4)}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={refetch} className="btn-secondary">
              🔄 Refresh
            </button>
            <Link href="/launch" className="btn-primary">
              + Launch New Token
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="glass-card p-6">
            <div className="text-gray-400 text-sm mb-1">Tokens Launched</div>
            <div className="text-3xl font-bold">{totalTokens}</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-gray-400 text-sm mb-1">Total Fee Pool</div>
            <div className="text-3xl font-bold text-[#14F195]">{totalFeePool.toFixed(3)} SOL</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-gray-400 text-sm mb-1">24h Volume</div>
            <div className="text-3xl font-bold text-[#9945FF]">${formatNumber(totalVolume)}</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-gray-400 text-sm mb-1">Total Holders</div>
            <div className="text-3xl font-bold">{totalHolders.toLocaleString()}</div>
          </div>
        </div>

        {/* Your Tokens */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Tokens</h2>
            <span className="text-gray-400 text-sm">{userTokens.length} tokens</span>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : userTokens.length === 0 ? (
            /* Empty State */
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
          ) : (
            /* Token List */
            <div className="space-y-4">
              {userTokens.map((token) => (
                <TokenCard
                  key={token.mint}
                  token={token}
                  onClaimFees={handleClaimFees}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link href="/explore" className="glass-card p-6 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#9945FF]/20 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="font-bold group-hover:text-[#14F195] transition-colors">Explore Tokens</h3>
                <p className="text-gray-400 text-sm">Discover Share Your BAGS tokens</p>
              </div>
            </div>
          </Link>

          <a
            href="https://docs.bags.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-6 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#14F195]/20 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="font-bold group-hover:text-[#14F195] transition-colors">Documentation</h3>
                <p className="text-gray-400 text-sm">Learn about the Bags API</p>
              </div>
            </div>
          </a>

          <a
            href="https://bags.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-6 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#9945FF]/20 flex items-center justify-center">
                <span className="text-2xl">🎒</span>
              </div>
              <div>
                <h3 className="font-bold group-hover:text-[#14F195] transition-colors">Bags.fm</h3>
                <p className="text-gray-400 text-sm">Trade on the main platform</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
