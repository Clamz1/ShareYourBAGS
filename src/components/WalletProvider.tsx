'use client';

import React, { useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
    children: React.ReactNode;
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
    // Use mainnet-beta for production
    const endpoint = useMemo(() =>
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
        []
    );

    // Use empty array - wallets are auto-detected via Wallet Standard
    const wallets = useMemo(() => [], []);

    // Fix for wallet modal z-index and pointer events
    useEffect(() => {
        // Create a style element to ensure modal is always clickable
        const style = document.createElement('style');
        style.textContent = `
            .wallet-adapter-modal-wrapper {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 99999 !important;
                pointer-events: auto !important;
                background: rgba(0, 0, 0, 0.8) !important;
            }
            .wallet-adapter-modal-container {
                z-index: 100000 !important;
                pointer-events: auto !important;
            }
            .wallet-adapter-modal-list {
                pointer-events: auto !important;
            }
            .wallet-adapter-modal-list li {
                pointer-events: auto !important;
                cursor: pointer !important;
            }
            .wallet-adapter-modal-list li button,
            .wallet-adapter-modal-list li > button,
            .wallet-adapter-modal-list-more {
                pointer-events: auto !important;
                cursor: pointer !important;
                position: relative !important;
                z-index: 100001 !important;
            }
            .wallet-adapter-modal-list li button:hover {
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider
                wallets={wallets}
                autoConnect
                onError={(error) => {
                    console.error('Wallet error:', error);
                }}
            >
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
