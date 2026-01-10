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
        const response = await fetch(
            `https://api.bags.fm/v1/tokens/${mint}/airdrops`,
            {
                headers: {
                    'Authorization': `Bearer ${BAGS_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ airdrops: [] }, { status: 200 });
        }

        const data = await response.json();

        const airdrops = (data.airdrops || data || []).map((airdrop: any) => ({
            signature: airdrop.signature || airdrop.txHash,
            timestamp: airdrop.timestamp || airdrop.createdAt,
            totalAmount: airdrop.amount || airdrop.totalAmount || 0,
            recipientCount: airdrop.recipientCount || airdrop.recipients || 0,
        }));

        return NextResponse.json({ airdrops });
    } catch (error) {
        console.error('Error fetching airdrops:', error);
        return NextResponse.json({ airdrops: [] }, { status: 200 });
    }
}
