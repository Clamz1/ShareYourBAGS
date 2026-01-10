'use client';

import { useState } from 'react';
import { CONFIG, FEE_PRESETS, type FeePreset } from '@/lib/config';

interface FeeSliderProps {
    holderShareBps: number;
    onHolderShareChange: (bps: number) => void;
}

export function FeeSlider({ holderShareBps, onHolderShareChange }: FeeSliderProps) {
    const [activePreset, setActivePreset] = useState<FeePreset | null>(null);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        onHolderShareChange(value);
        setActivePreset(null); // Clear preset when manually adjusting
    };

    const handlePresetClick = (preset: FeePreset) => {
        onHolderShareChange(FEE_PRESETS[preset].holderShareBps);
        setActivePreset(preset);
    };

    const creatorShareBps = 10000 - holderShareBps;
    const holderPercent = holderShareBps / 100;
    const creatorPercent = creatorShareBps / 100;

    return (
        <div className="space-y-6">
            {/* Presets */}
            <div className="flex flex-wrap gap-3">
                {(Object.keys(FEE_PRESETS) as FeePreset[]).map((preset) => (
                    <button
                        key={preset}
                        onClick={() => handlePresetClick(preset)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activePreset === preset
                                ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {FEE_PRESETS[preset].name}
                    </button>
                ))}
            </div>

            {/* Visual Split */}
            <div className="glass-card p-6">
                <div className="flex gap-2 h-16 rounded-xl overflow-hidden mb-4">
                    <div
                        className="bg-gradient-to-r from-[#9945FF] to-[#9945FF]/70 flex items-center justify-center transition-all duration-300"
                        style={{ width: `${creatorPercent}%` }}
                    >
                        <span className="text-white font-bold text-lg">{creatorPercent}%</span>
                    </div>
                    <div
                        className="bg-gradient-to-r from-[#14F195]/70 to-[#14F195] flex items-center justify-center transition-all duration-300"
                        style={{ width: `${holderPercent}%` }}
                    >
                        <span className="text-black font-bold text-lg">{holderPercent}%</span>
                    </div>
                </div>

                <div className="flex justify-between text-sm mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#9945FF]" />
                        <span className="text-gray-400">Creator Share</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#14F195]" />
                        <span className="text-gray-400">Holder Rewards (auto-airdrop)</span>
                    </div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>30% min</span>
                        <span>Holder Share</span>
                        <span>70% max</span>
                    </div>
                    <input
                        type="range"
                        min={CONFIG.MIN_HOLDER_SHARE_BPS}
                        max={CONFIG.MAX_HOLDER_SHARE_BPS}
                        step={100}
                        value={holderShareBps}
                        onChange={handleSliderChange}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#14F195]/10 border border-[#14F195]/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div className="text-sm">
                        <p className="text-[#14F195] font-medium mb-1">
                            {holderPercent}% of all trading fees will go to token holders
                        </p>
                        <p className="text-gray-400">
                            Fees pool automatically. When the pool reaches 0.5 SOL, we airdrop
                            to the top 100 holders proportionally to their holdings.
                        </p>
                    </div>
                </div>
            </div>

            {/* Platform Fee Notice */}
            <div className="text-xs text-gray-500 text-center">
                Platform fee: {CONFIG.PLATFORM_FEE_PERCENT}% of volume (via Bags partner program, separate from above)
            </div>
        </div>
    );
}
