import { Connection, PublicKey, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BagsSDK, signAndSendTransaction } from '@bagsfm/bags-sdk';
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
    holderShareBps: number; // 3000-7000 (30-70%)
    initialBuySol: number;
}

export interface TokenLaunchResult {
    tokenMint: string;
    signature: string;
    metadataUri: string;
}

export async function createBagsSDK(connection: Connection): Promise<BagsSDK> {
    if (!CONFIG.BAGS_API_KEY) {
        throw new Error('BAGS_API_KEY is not configured. Set NEXT_PUBLIC_BAGS_API_KEY in your environment.');
    }
    return new BagsSDK(CONFIG.BAGS_API_KEY, connection, 'confirmed');
}

export async function launchToken(
    sdk: BagsSDK,
    creatorWallet: PublicKey,
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
    params: TokenLaunchParams
): Promise<TokenLaunchResult> {
    const connection = sdk.state.getConnection();

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

export function getBagsUrl(tokenMint: string): string {
    return `https://bags.fm/${tokenMint}`;
}
