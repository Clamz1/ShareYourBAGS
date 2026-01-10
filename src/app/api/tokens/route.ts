import { NextRequest, NextResponse } from 'next/server';

const BAGS_API_KEY = process.env.NEXT_PUBLIC_BAGS_API_KEY || '';
const PLATFORM_WALLET = '8CrnUPw3g9aeCeqUSJhy1RUoGMw4WojPyjkcL5iDDmSa';

export async function GET(request: NextRequest) {
    try {
        // Fetch tokens from Bags API (server-side, no CORS issues)
        const response = await fetch(
            `https://api.bags.fm/v1/partners/${PLATFORM_WALLET}/tokens`,
            {
                headers: {
                    'Authorization': `Bearer ${BAGS_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                // Cache for 30 seconds
                next: { revalidate: 30 },
            }
        );

        if (!response.ok) {
            console.error('Bags API error:', response.status, response.statusText);
            // Return empty array on error - frontend will use mock data
            return NextResponse.json({ tokens: [], error: 'API unavailable' }, { status: 200 });
        }

        const data = await response.json();

        // Transform the data to our TokenInfo format
        const tokens = (data.tokens || data || []).map((token: any) => ({
            mint: token.mint || token.address,
            name: token.name,
            symbol: token.symbol,
            description: token.description || '',
            imageUrl: token.image || token.imageUrl || '',
            price: token.price || 0,
            marketCap: token.marketCap || 0,
            volume24h: token.volume24h || token.volume || 0,
            holders: token.holderCount || token.holders || 0,
            feePoolBalance: token.feePoolBalance || 0,
            holderShareBps: token.holderShareBps || 0,
            createdAt: token.createdAt || Date.now(),
        }));

        return NextResponse.json({ tokens });
    } catch (error) {
        console.error('Error fetching tokens:', error);
        return NextResponse.json({ tokens: [], error: 'Failed to fetch' }, { status: 200 });
    }
}
