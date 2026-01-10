'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { TokenInfo, HolderInfo, FeePoolInfo, AirdropInfo } from './bags';
import { CONFIG } from './config';
import type { BagsSDK } from '@bagsfm/bags-sdk';

// Hook to get SDK instance (for transaction signing only)
export function useBagsSDK() {
    const { connection } = useConnection();
    const [sdk, setSDK] = useState<BagsSDK | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initSDK() {
            try {
                if (!CONFIG.BAGS_API_KEY) {
                    console.warn('Bags API key not configured, running in demo mode');
                    return;
                }
                // Dynamically import to avoid SSR issues
                const { BagsSDK } = await import('@bagsfm/bags-sdk');
                const sdkInstance = new BagsSDK(CONFIG.BAGS_API_KEY, connection, 'confirmed');
                setSDK(sdkInstance);
            } catch (err: any) {
                setError(err.message);
            }
        }
        initSDK();
    }, [connection]);

    return { sdk, error };
}

// Hook to fetch token information via our API route
export function useTokenInfo(tokenMint: string | null) {
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!tokenMint) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/tokens/${tokenMint}`);
            const data = await response.json();

            if (data.token) {
                setTokenInfo(data.token);
                setError(null);
            } else {
                // Use demo data if API fails
                setTokenInfo(null);
                setError(data.error || 'Token not found');
            }
        } catch (err: any) {
            setError(err.message);
            setTokenInfo(null);
        } finally {
            setLoading(false);
        }
    }, [tokenMint]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { tokenInfo, loading, error, refetch };
}

// Hook to fetch top holders via our API route
export function useTopHolders(tokenMint: string | null, limit: number = 100) {
    const [holders, setHolders] = useState<HolderInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!tokenMint) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/tokens/${tokenMint}/holders?limit=${limit}`);
            const data = await response.json();
            setHolders(data.holders || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setHolders([]);
        } finally {
            setLoading(false);
        }
    }, [tokenMint, limit]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { holders, loading, error, refetch };
}

// Hook to fetch fee pool info via our API route
export function useFeePool(tokenMint: string | null) {
    const [feePool, setFeePool] = useState<FeePoolInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!tokenMint) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/tokens/${tokenMint}/fees`);
            const data = await response.json();
            setFeePool(data.feePool);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setFeePool(null);
        } finally {
            setLoading(false);
        }
    }, [tokenMint]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(refetch, 30000);
        return () => clearInterval(interval);
    }, [refetch]);

    return { feePool, loading, error, refetch };
}

// Hook to fetch airdrop history via our API route
export function useAirdropHistory(tokenMint: string | null) {
    const [airdrops, setAirdrops] = useState<AirdropInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!tokenMint) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/tokens/${tokenMint}/airdrops`);
            const data = await response.json();
            setAirdrops(data.airdrops || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setAirdrops([]);
        } finally {
            setLoading(false);
        }
    }, [tokenMint]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { airdrops, loading, error, refetch };
}

// Hook to fetch all platform tokens via our API route
export function usePlatformTokens() {
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/tokens');
            const data = await response.json();

            if (data.tokens && data.tokens.length > 0) {
                setTokens(data.tokens);
                setError(null);
            } else {
                // Use mock data if API returns empty
                setTokens(MOCK_TOKENS);
                setError(data.error || null);
            }
        } catch (err: any) {
            setError(err.message);
            setTokens(MOCK_TOKENS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { tokens, loading, error, refetch };
}

// Hook for checking airdrop eligibility
export function useAirdropEligibility(tokenMint: string | null) {
    const { feePool } = useFeePool(tokenMint);
    const [isEligible, setIsEligible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (feePool) {
            setIsEligible(feePool.balance >= 0.5);
            setLoading(false);
        }
    }, [feePool]);

    return { isEligible, loading };
}

// Mock data for demo mode
const MOCK_TOKENS: TokenInfo[] = [
    {
        mint: 'DemoToken1111111111111111111111111111111111',
        name: 'Share Demo Token',
        symbol: 'DEMO',
        description: 'A demonstration token for Share Your BAGS',
        imageUrl: '',
        price: 0.00001234,
        marketCap: 12340,
        volume24h: 5678,
        holders: 150,
        feePoolBalance: 0.35,
        holderShareBps: 4000,
        createdAt: Date.now() - 86400000,
    },
    {
        mint: 'DemoToken2222222222222222222222222222222222',
        name: 'Community Rewards',
        symbol: 'CMNTY',
        description: 'A community-focused token with 50% holder rewards',
        imageUrl: '',
        price: 0.00005678,
        marketCap: 56780,
        volume24h: 12345,
        holders: 320,
        feePoolBalance: 0.78,
        holderShareBps: 5000,
        createdAt: Date.now() - 172800000,
    },
    {
        mint: 'DemoToken3333333333333333333333333333333333',
        name: 'Holder First',
        symbol: 'HLDR',
        description: 'Maximum holder rewards at 70%',
        imageUrl: '',
        price: 0.00009999,
        marketCap: 99990,
        volume24h: 45678,
        holders: 890,
        feePoolBalance: 1.23,
        holderShareBps: 7000,
        createdAt: Date.now() - 259200000,
    },
];
