'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import {
    createBagsSDK,
    fetchTokenInfo,
    fetchTopHolders,
    fetchFeePoolInfo,
    fetchAirdropHistory,
    fetchPlatformTokens,
    checkAirdropEligibility,
    TokenInfo,
    HolderInfo,
    FeePoolInfo,
    AirdropInfo
} from './bags';
import { CONFIG } from './config';
import type { BagsSDK } from '@bagsfm/bags-sdk';

// Hook to get SDK instance
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
                const sdkInstance = await createBagsSDK(connection);
                setSDK(sdkInstance);
            } catch (err: any) {
                setError(err.message);
            }
        }
        initSDK();
    }, [connection]);

    return { sdk, error };
}

// Hook to fetch token information
export function useTokenInfo(tokenMint: string | null) {
    const { sdk } = useBagsSDK();
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!sdk || !tokenMint) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const info = await fetchTokenInfo(sdk, tokenMint);
            setTokenInfo(info);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sdk, tokenMint]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { tokenInfo, loading, error, refetch };
}

// Hook to fetch top holders
export function useTopHolders(tokenMint: string | null, limit: number = 100) {
    const { sdk } = useBagsSDK();
    const [holders, setHolders] = useState<HolderInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!sdk || !tokenMint) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const holderList = await fetchTopHolders(sdk, tokenMint, limit);
            setHolders(holderList);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sdk, tokenMint, limit]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { holders, loading, error, refetch };
}

// Hook to fetch fee pool info
export function useFeePool(tokenMint: string | null) {
    const { sdk } = useBagsSDK();
    const [feePool, setFeePool] = useState<FeePoolInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!sdk || !tokenMint) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const pool = await fetchFeePoolInfo(sdk, tokenMint);
            setFeePool(pool);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sdk, tokenMint]);

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

// Hook to fetch airdrop history
export function useAirdropHistory(tokenMint: string | null) {
    const { sdk } = useBagsSDK();
    const [airdrops, setAirdrops] = useState<AirdropInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!sdk || !tokenMint) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const airdropList = await fetchAirdropHistory(sdk, tokenMint);
            setAirdrops(airdropList);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sdk, tokenMint]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { airdrops, loading, error, refetch };
}

// Hook to fetch all platform tokens
export function usePlatformTokens() {
    const { sdk } = useBagsSDK();
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!sdk) {
            // Return mock data in demo mode
            setTokens(MOCK_TOKENS);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const tokenList = await fetchPlatformTokens();
            setTokens(tokenList.length > 0 ? tokenList : MOCK_TOKENS);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setTokens(MOCK_TOKENS);
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { tokens, loading, error, refetch };
}

// Hook for checking airdrop eligibility
export function useAirdropEligibility(tokenMint: string | null) {
    const { sdk } = useBagsSDK();
    const [isEligible, setIsEligible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function check() {
            if (!sdk || !tokenMint) {
                setLoading(false);
                return;
            }

            try {
                const eligible = await checkAirdropEligibility(sdk, tokenMint);
                setIsEligible(eligible);
            } catch {
                setIsEligible(false);
            } finally {
                setLoading(false);
            }
        }
        check();
    }, [sdk, tokenMint]);

    return { isEligible, loading };
}

// Mock data for demo mode
const MOCK_TOKENS: TokenInfo[] = [
    {
        mint: 'DemoToken1111111111111111111111111111111111',
        name: 'Share Demo Token',
        symbol: 'DEMO',
        description: 'A demonstration token for Share Your BAGS',
        imageUrl: '/demo-token.png',
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
        imageUrl: '/community-token.png',
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
        imageUrl: '/holder-token.png',
        price: 0.00009999,
        marketCap: 99990,
        volume24h: 45678,
        holders: 890,
        feePoolBalance: 1.23,
        holderShareBps: 7000,
        createdAt: Date.now() - 259200000,
    },
];
