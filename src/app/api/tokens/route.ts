import { NextRequest, NextResponse } from 'next/server';

const BAGS_API_KEY = process.env.NEXT_PUBLIC_BAGS_API_KEY || '';
const PLATFORM_WALLET = '8CrnUPw3g9aeCeqUSJhy1RUoGMw4WojPyjkcL5iDDmSa';

// Demo tokens for when real data isn't available
const DEMO_TOKENS = [
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

export async function GET(request: NextRequest) {
    try {
        // Check if API key is configured
        if (!BAGS_API_KEY) {
            console.log('No API key configured, returning demo tokens');
            return NextResponse.json({
                tokens: DEMO_TOKENS,
                error: 'API key not configured. Showing demo tokens.'
            });
        }

        // Test API connectivity with partner stats endpoint
        // Note: Bags API v2 doesn't have a "list tokens by partner" endpoint
        // We verify the API key works, then return demo data with explanation
        const testResponse = await fetch(
            `https://public-api-v2.bags.fm/api/v1/fee-share/partner-config/stats?partner=${PLATFORM_WALLET}`,
            {
                headers: {
                    'x-api-key': BAGS_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Bags API test response:', testResponse.status, testResponse.statusText);

        if (testResponse.ok) {
            const statsData = await testResponse.json();
            console.log('Partner stats:', JSON.stringify(statsData));

            // API key works! Return demo tokens with success message
            // In production, you would track launched tokens in your own database
            return NextResponse.json({
                tokens: DEMO_TOKENS,
                partnerStats: statsData.response,
                apiConnected: true,
                message: 'API connected successfully! Launch tokens to see them here.'
            });
        } else {
            const errorText = await testResponse.text();
            console.error('Bags API error:', testResponse.status, errorText);
            return NextResponse.json({
                tokens: DEMO_TOKENS,
                error: `API returned ${testResponse.status}. Showing demo tokens.`
            });
        }
    } catch (error) {
        console.error('Error connecting to Bags API:', error);
        return NextResponse.json({
            tokens: DEMO_TOKENS,
            error: 'Failed to connect to API. Showing demo tokens.'
        });
    }
}
