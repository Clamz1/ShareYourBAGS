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
            `https://api.bags.fm/v1/tokens/${mint}/fees`,
            {
                headers: {
                    'Authorization': `Bearer ${BAGS_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 30 },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ feePool: null }, { status: 200 });
        }

        const data = await response.json();

        const feePool = {
            balance: data.poolBalance || data.balance || 0,
            threshold: 0.5,
            estimatedTimeToAirdrop: data.estimatedTimeToThreshold || 0,
            lastAirdropTimestamp: data.lastAirdropAt || 0,
        };

        return NextResponse.json({ feePool });
    } catch (error) {
        console.error('Error fetching fee pool:', error);
        return NextResponse.json({ feePool: null }, { status: 200 });
    }
}
