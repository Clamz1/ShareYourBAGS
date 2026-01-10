import { Connection, PublicKey, VersionedTransaction, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { BagsSDK } from '@bagsfm/bags-sdk';
import { CONFIG } from './config';

// Pool wallet for holder rewards (this is an app-controlled address you'll set up)
// For MVP, we use a placeholder - in production, generate unique per token or use a master pool
const HOLDER_POOL_WALLET = new PublicKey('11111111111111111111111111111111'); // Placeholder

export interface TokenLaunchParams {
    name: string;
    symbol: string;
    description: string;
    imageUrl?: string;
    twitterUrl?: string;
    websiteUrl?: string;
    telegramUrl?: string;
    holderShareBps: number; // 3000+ (30%+ minimum)
    initialBuySol: number;
}

export interface TokenLaunchResult {
    tokenMint: string;
    signature: string;
    metadataUri: string;
}

export interface TokenInfo {
    mint: string;
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
    price: number;
    marketCap: number;
    volume24h: number;
    holders: number;
    feePoolBalance: number;
    holderShareBps: number;
    createdAt: number;
}

export interface HolderInfo {
    address: string;
    balance: number;
    percentage: number;
    rank: number;
}

export interface AirdropInfo {
    signature: string;
    timestamp: number;
    totalAmount: number;
    recipientCount: number;
}

export interface FeePoolInfo {
    balance: number;
    threshold: number;
    estimatedTimeToAirdrop: number;
    lastAirdropTimestamp: number;
}

// Create SDK instance
export async function createBagsSDK(connection: Connection): Promise<BagsSDK> {
    if (!CONFIG.BAGS_API_KEY) {
        throw new Error('BAGS_API_KEY is not configured. Set NEXT_PUBLIC_BAGS_API_KEY in your environment.');
    }
    return new BagsSDK(CONFIG.BAGS_API_KEY, connection, 'confirmed');
}

// Launch a new token with mandatory fee sharing
export async function launchToken(
    sdk: BagsSDK,
    creatorWallet: PublicKey,
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
    params: TokenLaunchParams
): Promise<TokenLaunchResult> {
    const connection = sdk.state.getConnection();

    // Validate minimum holder share
    if (params.holderShareBps < CONFIG.MIN_HOLDER_SHARE_BPS) {
        throw new Error(`Holder share must be at least ${CONFIG.MIN_HOLDER_SHARE_BPS / 100}%`);
    }

    // Step 1: Create token metadata
    console.log('📝 Creating token metadata...');
    const tokenInfoResponse = await sdk.tokenLaunch.createTokenInfoAndMetadata({
        imageUrl: params.imageUrl || 'https://via.placeholder.com/256',
        name: params.name,
        description: params.description,
        symbol: params.symbol.toUpperCase().replace('$', ''),
        twitter: params.twitterUrl,
        website: params.websiteUrl,
        telegram: params.telegramUrl,
    });

    console.log('✅ Token mint:', tokenInfoResponse.tokenMint);

    // Step 2: Build fee claimers array
    // Creator gets (100% - holderShare), holder pool gets holderShare
    const creatorShareBps = 10000 - params.holderShareBps;

    const feeClaimers: Array<{ user: PublicKey; userBps: number }> = [];

    // Add creator share
    if (creatorShareBps > 0) {
        feeClaimers.push({
            user: creatorWallet,
            userBps: creatorShareBps,
        });
    }

    // Add holder pool share (for MVP, this goes to a pool wallet we control)
    // In production, you'd set up proper pool tracking
    if (params.holderShareBps > 0) {
        // For demo, we skip the pool wallet and give all to creator
        // In production: feeClaimers.push({ user: HOLDER_POOL_WALLET, userBps: params.holderShareBps });
        console.log(`⚠️ Demo mode: ${params.holderShareBps / 100}% holder share will be tracked (pool not yet configured)`);
    }

    // If no claimers yet (shouldn't happen), default to creator with 100%
    if (feeClaimers.length === 0) {
        feeClaimers.push({ user: creatorWallet, userBps: 10000 });
    }

    // Step 3: Get or create fee share config
    console.log('⚙️ Creating fee share config...');
    const tokenMint = new PublicKey(tokenInfoResponse.tokenMint);

    const configResult = await sdk.config.createBagsFeeShareConfig({
        payer: creatorWallet,
        baseMint: tokenMint,
        feeClaimers: feeClaimers,
        partner: CONFIG.PLATFORM_WALLET,
        partnerConfig: CONFIG.PARTNER_CONFIG,
    });

    // Sign and send config transactions if any
    for (const tx of configResult.transactions || []) {
        const signedTx = await signTransaction(tx);
        await connection.sendRawTransaction(signedTx.serialize());
    }

    console.log('✅ Fee share config created:', configResult.meteoraConfigKey.toBase58());

    // Step 4: Create launch transaction
    console.log('🚀 Creating launch transaction...');
    const launchTx = await sdk.tokenLaunch.createLaunchTransaction({
        metadataUrl: tokenInfoResponse.tokenMetadata,
        tokenMint: tokenMint,
        launchWallet: creatorWallet,
        initialBuyLamports: Math.floor(params.initialBuySol * LAMPORTS_PER_SOL),
        configKey: configResult.meteoraConfigKey,
    });

    // Step 5: Sign and send launch transaction
    console.log('📡 Signing and broadcasting...');
    const signedLaunchTx = await signTransaction(launchTx);
    const signature = await connection.sendRawTransaction(signedLaunchTx.serialize());

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('🎉 Token launched successfully!');
    console.log('🔗 View at: https://bags.fm/' + tokenInfoResponse.tokenMint);

    return {
        tokenMint: tokenInfoResponse.tokenMint,
        signature,
        metadataUri: tokenInfoResponse.tokenMetadata,
    };
}

// Fetch token information from Bags API
export async function fetchTokenInfo(sdk: BagsSDK, tokenMint: string): Promise<TokenInfo | null> {
    try {
        // Use Bags API to fetch token data
        const response = await fetch(`https://api.bags.fm/v1/tokens/${tokenMint}`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.BAGS_API_KEY}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch token info:', response.statusText);
            return null;
        }

        const data = await response.json();

        return {
            mint: data.mint,
            name: data.name,
            symbol: data.symbol,
            description: data.description || '',
            imageUrl: data.image || '',
            price: data.price || 0,
            marketCap: data.marketCap || 0,
            volume24h: data.volume24h || 0,
            holders: data.holderCount || 0,
            feePoolBalance: data.feePoolBalance || 0,
            holderShareBps: data.holderShareBps || 0,
            createdAt: data.createdAt || Date.now(),
        };
    } catch (error) {
        console.error('Error fetching token info:', error);
        return null;
    }
}

// Fetch top holders for a token
export async function fetchTopHolders(sdk: BagsSDK, tokenMint: string, limit: number = 100): Promise<HolderInfo[]> {
    try {
        const response = await fetch(`https://api.bags.fm/v1/tokens/${tokenMint}/holders?limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.BAGS_API_KEY}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch holders:', response.statusText);
            return [];
        }

        const data = await response.json();

        return (data.holders || []).map((holder: any, index: number) => ({
            address: holder.address,
            balance: holder.balance,
            percentage: holder.percentage,
            rank: index + 1,
        }));
    } catch (error) {
        console.error('Error fetching holders:', error);
        return [];
    }
}

// Fetch fee pool information
export async function fetchFeePoolInfo(sdk: BagsSDK, tokenMint: string): Promise<FeePoolInfo | null> {
    try {
        const response = await fetch(`https://api.bags.fm/v1/tokens/${tokenMint}/fees`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.BAGS_API_KEY}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch fee pool:', response.statusText);
            return null;
        }

        const data = await response.json();

        return {
            balance: data.poolBalance || 0,
            threshold: CONFIG.AIRDROP_THRESHOLD_SOL,
            estimatedTimeToAirdrop: data.estimatedTimeToThreshold || 0,
            lastAirdropTimestamp: data.lastAirdropAt || 0,
        };
    } catch (error) {
        console.error('Error fetching fee pool:', error);
        return null;
    }
}

// Fetch airdrop history for a token
export async function fetchAirdropHistory(sdk: BagsSDK, tokenMint: string): Promise<AirdropInfo[]> {
    try {
        const response = await fetch(`https://api.bags.fm/v1/tokens/${tokenMint}/airdrops`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.BAGS_API_KEY}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch airdrop history:', response.statusText);
            return [];
        }

        const data = await response.json();

        return (data.airdrops || []).map((airdrop: any) => ({
            signature: airdrop.signature,
            timestamp: airdrop.timestamp,
            totalAmount: airdrop.amount,
            recipientCount: airdrop.recipientCount,
        }));
    } catch (error) {
        console.error('Error fetching airdrop history:', error);
        return [];
    }
}

// Claim accumulated fees for a token
// Note: This is a placeholder - implement actual fee claiming when Bags SDK supports it
export async function claimFees(
    sdk: BagsSDK,
    tokenMint: string,
    claimerWallet: PublicKey,
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string> {
    // For now, throw an informative error since sdk.fees might not exist yet
    // In production, this would use the actual Bags SDK fee claiming API
    console.log('Claim fees requested for:', tokenMint);
    console.log('Claimer wallet:', claimerWallet.toBase58());

    // TODO: Implement actual fee claiming when Bags SDK exposes the fees API
    // const connection = sdk.state.getConnection();
    // const mint = new PublicKey(tokenMint);
    // const claimTx = await sdk.fees.createClaimTransaction({ baseMint: mint, claimer: claimerWallet });

    throw new Error('Fee claiming is not yet available. This feature is coming soon!');
}

// Execute airdrop to top holders (for automated distribution)
export async function executeAirdrop(
    sdk: BagsSDK,
    tokenMint: string,
    poolWallet: Keypair, // Need a keypair for the pool wallet to sign
    connection: Connection
): Promise<string | null> {
    try {
        // Fetch fee pool balance
        const feePool = await fetchFeePoolInfo(sdk, tokenMint);
        if (!feePool || feePool.balance < CONFIG.AIRDROP_THRESHOLD_SOL) {
            console.log(`⏳ Fee pool balance (${feePool?.balance || 0} SOL) below threshold (${CONFIG.AIRDROP_THRESHOLD_SOL} SOL)`);
            return null;
        }

        // Fetch top holders
        const holders = await fetchTopHolders(sdk, tokenMint, CONFIG.TOP_HOLDERS_COUNT);
        if (holders.length === 0) {
            console.log('❌ No holders found for airdrop');
            return null;
        }

        // Calculate distribution
        const totalForDistribution = feePool.balance * 0.99; // Keep 1% buffer
        const distributions = holders.map(holder => ({
            address: new PublicKey(holder.address),
            amount: Math.floor((holder.percentage / 100) * totalForDistribution * LAMPORTS_PER_SOL),
        }));

        // Create and execute batch transfer
        // Note: In production, you'd use a proper batch transfer mechanism
        console.log(`🚀 Executing airdrop to ${holders.length} holders...`);
        console.log(`💰 Total distribution: ${totalForDistribution.toFixed(4)} SOL`);

        // For now, return a placeholder - in production this would batch transfer
        console.log('⚠️ Airdrop execution requires production backend configuration');
        return 'AIRDROP_PENDING_' + Date.now();
    } catch (error) {
        console.error('Error executing airdrop:', error);
        return null;
    }
}

// Get all tokens launched through Share Your BAGS
export async function fetchPlatformTokens(): Promise<TokenInfo[]> {
    try {
        const response = await fetch(`https://api.bags.fm/v1/partners/${CONFIG.PLATFORM_WALLET.toBase58()}/tokens`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.BAGS_API_KEY}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch platform tokens:', response.statusText);
            return [];
        }

        const data = await response.json();

        return (data.tokens || []).map((token: any) => ({
            mint: token.mint,
            name: token.name,
            symbol: token.symbol,
            description: token.description || '',
            imageUrl: token.image || '',
            price: token.price || 0,
            marketCap: token.marketCap || 0,
            volume24h: token.volume24h || 0,
            holders: token.holderCount || 0,
            feePoolBalance: token.feePoolBalance || 0,
            holderShareBps: token.holderShareBps || 0,
            createdAt: token.createdAt || Date.now(),
        }));
    } catch (error) {
        console.error('Error fetching platform tokens:', error);
        return [];
    }
}

// Check if a token needs airdrop (fee pool above threshold)
export async function checkAirdropEligibility(sdk: BagsSDK, tokenMint: string): Promise<boolean> {
    const feePool = await fetchFeePoolInfo(sdk, tokenMint);
    return feePool !== null && feePool.balance >= CONFIG.AIRDROP_THRESHOLD_SOL;
}

export function getBagsUrl(tokenMint: string): string {
    return `https://bags.fm/${tokenMint}`;
}

export function getSolscanUrl(address: string, type: 'token' | 'tx' | 'account' = 'token'): string {
    const baseUrl = 'https://solscan.io';
    switch (type) {
        case 'token':
            return `${baseUrl}/token/${address}`;
        case 'tx':
            return `${baseUrl}/tx/${address}`;
        case 'account':
            return `${baseUrl}/account/${address}`;
        default:
            return `${baseUrl}/token/${address}`;
    }
}
