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
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';

    try {
        const response = await fetch(
            `https://api.bags.fm/v1/tokens/${mint}/holders?limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${BAGS_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ holders: [] }, { status: 200 });
        }

        const data = await response.json();

        const holders = (data.holders || data || []).map((holder: any, index: number) => ({
            address: holder.address || holder.wallet,
            balance: holder.balance || holder.amount || 0,
            percentage: holder.percentage || holder.share || 0,
            rank: index + 1,
        }));

        return NextResponse.json({ holders });
    } catch (error) {
        console.error('Error fetching holders:', error);
        return NextResponse.json({ holders: [] }, { status: 200 });
    }
}
