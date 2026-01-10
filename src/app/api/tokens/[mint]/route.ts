import { NextRequest, NextResponse } from 'next/server';

const BAGS_API_KEY = process.env.NEXT_PUBLIC_BAGS_API_KEY || '';

interface RouteParams {
    params: Promise<{ mint: string }>;
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    const { mint } = await params;

    try {
        // Fetch token info from Bags API
        const response = await fetch(
            `https://api.bags.fm/v1/tokens/${mint}`,
            {
                headers: {
                    'Authorization': `Bearer ${BAGS_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 30 },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ token: null, error: 'Token not found' }, { status: 200 });
        }

        const data = await response.json();

        const token = {
            mint: data.mint || mint,
            name: data.name,
            symbol: data.symbol,
            description: data.description || '',
            imageUrl: data.image || data.imageUrl || '',
            price: data.price || 0,
            marketCap: data.marketCap || 0,
            volume24h: data.volume24h || data.volume || 0,
            holders: data.holderCount || data.holders || 0,
            feePoolBalance: data.feePoolBalance || 0,
            holderShareBps: data.holderShareBps || 0,
            createdAt: data.createdAt || Date.now(),
        };

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error fetching token:', error);
        return NextResponse.json({ token: null, error: 'Failed to fetch' }, { status: 200 });
    }
}
