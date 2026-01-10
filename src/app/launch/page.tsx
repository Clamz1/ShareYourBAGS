'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FeeSlider } from '@/components/FeeSlider';
import { CONFIG } from '@/lib/config';
import { createBagsSDK, launchToken, getBagsUrl } from '@/lib/bags';

const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
    { ssr: false }
);

interface TokenFormData {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
    twitterUrl: string;
    websiteUrl: string;
    telegramUrl: string;
    holderShareBps: number;
    initialBuySol: number;
}

interface LaunchResult {
    success: boolean;
    tokenMint?: string;
    error?: string;
}

export default function LaunchPage() {
    const { connected, publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const [step, setStep] = useState(1);
    const [isLaunching, setIsLaunching] = useState(false);
    const [launchResult, setLaunchResult] = useState<LaunchResult | null>(null);
    const [formData, setFormData] = useState<TokenFormData>({
        name: '',
        symbol: '',
        description: '',
        imageUrl: '',
        twitterUrl: '',
        websiteUrl: '',
        telegramUrl: '',
        holderShareBps: 4000, // 40% default
        initialBuySol: 0.1,
    });

    const updateField = (field: keyof TokenFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canProceedStep1 = formData.name && formData.symbol && formData.description;
    const canProceedStep2 = true; // Fee slider always has valid value
    const canLaunch = connected && canProceedStep1 && canProceedStep2 && signTransaction;

    const handleLaunch = async () => {
        if (!connected || !publicKey || !signTransaction) return;

        setIsLaunching(true);
        setLaunchResult(null);

        try {
            // Check if API key is configured
            if (!CONFIG.BAGS_API_KEY) {
                // Demo mode - show what would happen
                console.log('Demo mode - Bags API key not configured');
                console.log('Would launch with:', {
                    ...formData,
                    creator: publicKey.toBase58(),
                    partner: CONFIG.PLATFORM_WALLET.toBase58(),
                    partnerConfig: CONFIG.PARTNER_CONFIG.toBase58(),
                });

                await new Promise(resolve => setTimeout(resolve, 1500));
                setLaunchResult({
                    success: true,
                    tokenMint: 'DEMO_' + Date.now(),
                });
                alert('🎉 Demo mode! To launch real tokens, set NEXT_PUBLIC_BAGS_API_KEY in your environment.');
                return;
            }

            // Production mode - use Bags SDK
            const sdk = await createBagsSDK(connection);
            const result = await launchToken(
                sdk,
                publicKey,
                signTransaction,
                {
                    name: formData.name,
                    symbol: formData.symbol,
                    description: formData.description,
                    imageUrl: formData.imageUrl,
                    twitterUrl: formData.twitterUrl,
                    websiteUrl: formData.websiteUrl,
                    telegramUrl: formData.telegramUrl,
                    holderShareBps: formData.holderShareBps,
                    initialBuySol: formData.initialBuySol,
                }
            );

            setLaunchResult({
                success: true,
                tokenMint: result.tokenMint,
            });

        } catch (error: any) {
            console.error('Launch failed:', error);
            setLaunchResult({
                success: false,
                error: error.message || 'Unknown error occurred',
            });
        } finally {
            setIsLaunching(false);
        }
    };

    if (!connected) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="glass-card p-12 text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
                    <p className="text-gray-400 mb-8">
                        Connect your Solana wallet to launch a token with built-in holder rewards.
                    </p>
                    <WalletMultiButton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-4">
                            <button
                                onClick={() => setStep(s)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s
                                    ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                                    : step > s
                                        ? 'bg-[#14F195] text-black'
                                        : 'bg-white/10 text-gray-400'
                                    }`}
                            >
                                {step > s ? '✓' : s}
                            </button>
                            {s < 3 && (
                                <div className={`w-16 h-1 rounded ${step > s ? 'bg-[#14F195]' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Token Info */}
                {step === 1 && (
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-6">Token Information</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Token Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        placeholder="My Awesome Token"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9945FF] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Symbol *</label>
                                    <input
                                        type="text"
                                        value={formData.symbol}
                                        onChange={(e) => updateField('symbol', e.target.value.toUpperCase())}
                                        placeholder="MAT"
                                        maxLength={10}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9945FF] transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Describe your token and its purpose..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9945FF] transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => updateField('imageUrl', e.target.value)}
                                    placeholder="https://example.com/token-image.png"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9945FF] transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Twitter</label>
                                    <input
                                        type="url"
                                        value={formData.twitterUrl}
                                        onChange={(e) => updateField('twitterUrl', e.target.value)}
                                        placeholder="https://x.com/..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9945FF] transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Website</label>
                                    <input
                                        type="url"
                                        value={formData.websiteUrl}
                                        onChange={(e) => updateField('websiteUrl', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9945FF] transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Telegram</label>
                                    <input
                                        type="url"
                                        value={formData.telegramUrl}
                                        onChange={(e) => updateField('telegramUrl', e.target.value)}
                                        placeholder="https://t.me/..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9945FF] transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!canProceedStep1}
                                className="btn-primary w-full"
                            >
                                Continue to Fee Splitting →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Fee Allocation */}
                {step === 2 && (
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-2">Fee Allocation</h2>
                        <p className="text-gray-400 mb-6">
                            Choose how trading fees are split between you and token holders.
                        </p>

                        <FeeSlider
                            holderShareBps={formData.holderShareBps}
                            onHolderShareChange={(bps) => updateField('holderShareBps', bps)}
                        />

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                                ← Back
                            </button>
                            <button onClick={() => setStep(3)} className="btn-primary flex-1">
                                Review Launch →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Launch */}
                {step === 3 && (
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-6">Review & Launch</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between py-3 border-b border-white/10">
                                <span className="text-gray-400">Token Name</span>
                                <span className="font-medium">{formData.name}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/10">
                                <span className="text-gray-400">Symbol</span>
                                <span className="font-medium">${formData.symbol}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/10">
                                <span className="text-gray-400">Creator Share</span>
                                <span className="font-medium text-[#9945FF]">{(10000 - formData.holderShareBps) / 100}%</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/10">
                                <span className="text-gray-400">Holder Rewards</span>
                                <span className="font-medium text-[#14F195]">{formData.holderShareBps / 100}%</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/10">
                                <span className="text-gray-400">Platform Fee</span>
                                <span className="font-medium text-gray-400">{CONFIG.PLATFORM_FEE_PERCENT}% of volume</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-400">Initial Buy</span>
                                <span className="font-medium">{formData.initialBuySol} SOL</span>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">⚠️</span>
                                <div className="text-sm">
                                    <p className="text-yellow-400 font-medium mb-1">Review Carefully</p>
                                    <p className="text-gray-400">
                                        This action is irreversible. Once launched, fee allocations cannot be changed.
                                        You will need ~0.05 SOL for transaction fees plus your initial buy amount.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                                ← Back
                            </button>
                            <button
                                onClick={handleLaunch}
                                disabled={!canLaunch || isLaunching}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {isLaunching ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Launching...
                                    </>
                                ) : '🚀 Launch Token'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Success Screen */}
                {launchResult?.success && (
                    <div className="glass-card p-8 text-center relative overflow-hidden">
                        {/* Confetti Effect */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full animate-float"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        backgroundColor: i % 2 === 0 ? '#9945FF' : '#14F195',
                                        opacity: 0.6,
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${2 + Math.random() * 2}s`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Success Icon */}
                        <div className="relative z-10">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#14F195] flex items-center justify-center shadow-[0_0_60px_rgba(20,241,149,0.5)]">
                                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-bold mb-2">Token Launched Successfully!</h2>
                            <p className="text-gray-400 mb-8">Your token is now live on Solana</p>

                            {/* Token Details Card */}
                            <div className="bg-white/5 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Token Name:</span>
                                        <span className="font-medium">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Symbol:</span>
                                        <span className="font-medium">${formData.symbol}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Mint Address:</span>
                                        <span className="font-mono text-sm text-[#14F195]">
                                            {launchResult.tokenMint?.slice(0, 6)}...{launchResult.tokenMint?.slice(-4)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Fee Split:</span>
                                        <span className="font-medium">
                                            <span className="text-[#9945FF]">{(10000 - formData.holderShareBps) / 100}% Creator</span>
                                            {' / '}
                                            <span className="text-[#14F195]">{formData.holderShareBps / 100}% Holders</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href={getBagsUrl(launchResult.tokenMint || '')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary px-8 py-4 text-lg"
                                >
                                    View on Bags.fm →
                                </a>
                                <button
                                    onClick={() => {
                                        setLaunchResult(null);
                                        setStep(1);
                                        setFormData({
                                            name: '',
                                            symbol: '',
                                            description: '',
                                            imageUrl: '',
                                            twitterUrl: '',
                                            websiteUrl: '',
                                            telegramUrl: '',
                                            holderShareBps: 4000,
                                            initialBuySol: 0.1,
                                        });
                                    }}
                                    className="btn-secondary px-8 py-4 text-lg"
                                >
                                    Launch Another
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {launchResult?.success === false && (
                    <div className="glass-card p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-4xl">❌</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-red-400">Launch Failed</h2>
                        <p className="text-gray-400 mb-6">{launchResult.error}</p>
                        <button
                            onClick={() => setLaunchResult(null)}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Back to Home */}
                {!launchResult && (
                    <div className="text-center mt-8">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
