'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

// Dynamically import wallet button to avoid SSR issues
const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
    { ssr: false }
);

export function Header() {
    const { connected } = useWallet();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-l-0 border-r-0 rounded-none">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                        <span className="text-xl">💰</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">Share Your BAGS</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/explore" className="text-gray-400 hover:text-white transition-colors">
                        Explore
                    </Link>
                    <Link href="/launch" className="text-gray-400 hover:text-white transition-colors">
                        Launch Token
                    </Link>
                    <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <a
                        href="https://docs.bags.fm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Docs
                    </a>
                </nav>

                <div className="flex items-center gap-4">
                    {connected && (
                        <Link href="/dashboard" className="btn-secondary text-sm">
                            My Tokens
                        </Link>
                    )}
                    <WalletMultiButton />
                </div>
            </div>
        </header>
    );
}
