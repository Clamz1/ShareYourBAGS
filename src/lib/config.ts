import { PublicKey } from '@solana/web3.js';

// Platform configuration
export const CONFIG = {
    // Your partner wallet and config PDA
    PLATFORM_WALLET: new PublicKey('8CrnUPw3g9aeCeqUSJhy1RUoGMw4WojPyjkcL5iDDmSa'),
    PARTNER_CONFIG: new PublicKey('CSrQpKwg1Y6rRa39FaMiSKZPZn8bLQ1nLu5f74ri6Pvi'),

    // Fee sharing constraints
    MIN_HOLDER_SHARE_BPS: 3000, // 30% minimum to holders
    MAX_HOLDER_SHARE_BPS: 7000, // 70% maximum to holders

    // Airdrop configuration
    AIRDROP_THRESHOLD_SOL: 0.5,
    TOP_HOLDERS_COUNT: 100,

    // Platform fee info (for display only - handled by partner key)
    PLATFORM_FEE_PERCENT: 0.25, // 0.25% of volume via partner key

    // Solana RPC
    RPC_ENDPOINT: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',

    // Bags API
    BAGS_API_KEY: process.env.NEXT_PUBLIC_BAGS_API_KEY || '',
} as const;

// Fee presets for the launch wizard
export const FEE_PRESETS = {
    'holder-focused': {
        name: 'Holder Focused',
        description: 'Maximize rewards for token holders',
        holderShareBps: 5000, // 50%
        creatorShareBps: 5000, // 50%
    },
    'balanced': {
        name: 'Balanced',
        description: 'Equal split between creator and holders',
        holderShareBps: 4000, // 40%
        creatorShareBps: 6000, // 60%
    },
    'creator-focused': {
        name: 'Creator Focused',
        description: 'Minimum holder share, maximize creator earnings',
        holderShareBps: 3000, // 30% (minimum)
        creatorShareBps: 7000, // 70%
    },
} as const;

export type FeePreset = keyof typeof FEE_PRESETS;
