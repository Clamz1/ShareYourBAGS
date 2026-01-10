import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Development Banner */}
            <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-center gap-3">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        <span className="text-sm text-yellow-400 font-medium">Development Preview</span>
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-300">Full launchpad coming soon!</span>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-6">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
                        <span className="text-sm text-gray-400">Powered by Bags API on Solana</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        The Future of
                        <br />
                        <span className="gradient-text">Token Fee Sharing</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-6 max-w-3xl mx-auto">
                        <strong className="text-white">Share Your BAGS</strong> is revolutionizing how token communities share value.
                        Launch tokens with <span className="text-[#14F195]">mandatory holder rewards</span> — automatically distributing trading fees to your top holders.
                    </p>

                    <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
                        🚧 We&apos;re currently in active development. Join our waitlist to be first in line when our launchpad goes live!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <Link href="/launch" className="btn-primary text-lg px-8 py-4">
                            🔬 Preview Launch Wizard
                        </Link>
                        <a
                            href="#features"
                            className="btn-secondary text-lg px-8 py-4"
                        >
                            Learn More ↓
                        </a>
                    </div>

                    {/* Coming Soon Badge */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 border border-white/10">
                        <div className="flex -space-x-2">
                            {['🚀', '💎', '⚡'].map((emoji, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-[#0a0a0a]">
                                    <span className="text-sm">{emoji}</span>
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-gray-300">
                            <strong className="text-white">50+ creators</strong> on our early access waitlist
                        </span>
                    </div>
                </div>
            </section>

            {/* Core Value Prop */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Why <span className="gradient-text">Share Your BAGS</span>?
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Unlike traditional token launchers, we enforce a minimum 30% fee share to holders.
                            This creates sustainable tokenomics that align creator and holder incentives.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {/* Feature 1 */}
                        <div className="glass-card p-8 hover:scale-[1.02] transition-transform">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center mb-6">
                                <span className="text-2xl">💎</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Minimum 30% to Holders</h3>
                            <p className="text-gray-400 mb-4">
                                Every token launched through our platform must allocate a minimum of 30% of all trading fees to holders.
                                Want to share more? You can set it as high as you want!
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Enforced at smart contract level
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Cannot be changed after launch
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Visible on-chain for transparency
                                </li>
                            </ul>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-8 hover:scale-[1.02] transition-transform">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center mb-6">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Automated SOL Airdrops</h3>
                            <p className="text-gray-400 mb-4">
                                No manual claiming required! When the fee pool reaches 0.5 SOL, our system automatically
                                distributes rewards to the top 100 holders proportionally.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Triggered at 0.5 SOL threshold
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Pro-rata distribution by balance
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Gas-optimized batch transfers
                                </li>
                            </ul>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-8 hover:scale-[1.02] transition-transform">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center mb-6">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Real-Time Analytics Dashboard</h3>
                            <p className="text-gray-400 mb-4">
                                Track every aspect of your token&apos;s performance with our comprehensive analytics suite.
                                Full transparency for creators and holders alike.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Live fee pool tracking
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Complete airdrop history
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#14F195]">✓</span> Holder distribution charts
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Additional Features */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#9945FF]/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🔒</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Immutable Fee Sharing</h3>
                                    <p className="text-gray-400 text-sm">
                                        Once your token launches, the fee split is locked forever. Holders can trust that rewards will never be reduced.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#14F195]/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🌐</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Bags.fm Integration</h3>
                                    <p className="text-gray-400 text-sm">
                                        Tokens launch directly on Bags.fm with full trading support. Benefit from their liquidity and user base.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#9945FF]/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">💰</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Low Platform Fee</h3>
                                    <p className="text-gray-400 text-sm">
                                        We charge only 0.25% of trading volume as a platform fee. The vast majority goes to you and your holders.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#14F195]/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🎯</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Top 100 Focus</h3>
                                    <p className="text-gray-400 text-sm">
                                        Rewards go to your most committed holders. This incentivizes accumulation and reduces selling pressure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coming Soon Features */}
                    <div className="mt-16">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-4">
                                <span className="text-sm text-yellow-400 font-medium">🚀 Coming Soon</span>
                            </div>
                            <h3 className="text-2xl font-bold">Features in Development</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 border border-yellow-400/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/20 flex items-center justify-center">
                                        <span className="text-lg">𝕏</span>
                                    </div>
                                    <div className="px-2 py-1 rounded text-xs bg-yellow-400/20 text-yellow-400">Coming Soon</div>
                                </div>
                                <h4 className="font-bold mb-2">X/Twitter Integration</h4>
                                <p className="text-gray-400 text-sm">
                                    Link your token&apos;s X account during creation. We&apos;ll automatically post milestone updates when your token hits new market cap or price levels.
                                </p>
                                <ul className="mt-3 text-xs text-gray-500 space-y-1">
                                    <li>• Auto-tweet at $10K, $50K, $100K+ market cap</li>
                                    <li>• Price milestone celebrations</li>
                                    <li>• New ATH announcements</li>
                                </ul>
                            </div>

                            <div className="glass-card p-6 border border-yellow-400/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#0088cc]/20 flex items-center justify-center">
                                        <span className="text-lg">📱</span>
                                    </div>
                                    <div className="px-2 py-1 rounded text-xs bg-yellow-400/20 text-yellow-400">Coming Soon</div>
                                </div>
                                <h4 className="font-bold mb-2">Telegram Alerts Bot</h4>
                                <p className="text-gray-400 text-sm">
                                    Get real-time notifications in your Telegram group. Alert your community about airdrops, new holders, and trading activity.
                                </p>
                                <ul className="mt-3 text-xs text-gray-500 space-y-1">
                                    <li>• Airdrop distribution alerts</li>
                                    <li>• New whale holder notifications</li>
                                    <li>• Fee pool threshold updates</li>
                                </ul>
                            </div>

                            <div className="glass-card p-6 border border-yellow-400/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#9945FF]/20 flex items-center justify-center">
                                        <span className="text-lg">⚙️</span>
                                    </div>
                                    <div className="px-2 py-1 rounded text-xs bg-yellow-400/20 text-yellow-400">Coming Soon</div>
                                </div>
                                <h4 className="font-bold mb-2">Custom Airdrop Settings</h4>
                                <p className="text-gray-400 text-sm">
                                    Fine-tune your airdrop parameters. Set custom thresholds, adjust holder count, and choose your distribution schedule.
                                </p>
                                <ul className="mt-3 text-xs text-gray-500 space-y-1">
                                    <li>• Adjustable SOL threshold (0.1 - 5 SOL)</li>
                                    <li>• Top 50, 100, or 200 holders</li>
                                    <li>• Weekly/daily distribution options</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        How It Works
                    </h2>
                    <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
                        From creation to distribution, our platform handles everything automatically
                    </p>

                    <div className="space-y-8">
                        {[
                            {
                                step: '01',
                                title: 'Configure Your Token',
                                description: 'Set your token name, symbol, description, and social links. Choose your fee split starting at minimum 30% for holders — the higher you go, the more attractive your token becomes to investors.',
                                icon: '⚙️',
                            },
                            {
                                step: '02',
                                title: 'Launch with One Click',
                                description: 'Connect your Solana wallet, review your settings, and sign the transaction. Your token is live on the Solana blockchain within seconds, ready for trading on Bags.fm.',
                                icon: '🚀',
                            },
                            {
                                step: '03',
                                title: 'Trading Fees Accumulate',
                                description: 'Every buy and sell of your token generates trading fees. These fees automatically pool in a smart contract vault, visible to everyone on-chain.',
                                icon: '💎',
                            },
                            {
                                step: '04',
                                title: 'Automatic Holder Rewards',
                                description: 'When the fee pool reaches 0.5 SOL, our backend automatically triggers an airdrop. SOL is distributed to your top 100 holders proportionally based on their token balance.',
                                icon: '🎉',
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 border border-white/10 flex items-center justify-center">
                                    <span className="text-2xl">{item.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-mono text-[#14F195]">Step {item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roadmap / Development Status */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-6">
                            <span className="text-sm text-yellow-400 font-medium">🚧 Development Roadmap</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Building in Public
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            We&apos;re committed to transparency. Here&apos;s where we are and where we&apos;re headed.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Phase 1 - Complete */}
                        <div className="glass-card p-6 border-l-4 border-[#14F195]">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-[#14F195]/20 text-[#14F195] text-sm font-medium">Completed</span>
                                <span className="text-gray-500 text-sm">Phase 1</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Core Platform Development</h3>
                            <ul className="text-gray-400 text-sm space-y-1">
                                <li>✓ Bags API integration & SDK setup</li>
                                <li>✓ Token launch wizard UI</li>
                                <li>✓ Fee allocation slider with presets</li>
                                <li>✓ Wallet connection (Phantom, Solflare)</li>
                                <li>✓ Token analytics dashboard</li>
                            </ul>
                        </div>

                        {/* Phase 2 - In Progress */}
                        <div className="glass-card p-6 border-l-4 border-yellow-400">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-sm font-medium">In Progress</span>
                                <span className="text-gray-500 text-sm">Phase 2</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Backend & Automation</h3>
                            <ul className="text-gray-400 text-sm space-y-1">
                                <li>⏳ Automated airdrop distribution system</li>
                                <li>⏳ Real-time fee pool monitoring</li>
                                <li>⏳ Creator dashboard with analytics</li>
                                <li>⏳ Mainnet smart contract deployment</li>
                            </ul>
                        </div>

                        {/* Phase 3 - Coming Soon */}
                        <div className="glass-card p-6 border-l-4 border-gray-600">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-gray-600/20 text-gray-400 text-sm font-medium">Coming Soon</span>
                                <span className="text-gray-500 text-sm">Phase 3</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Public Launch & Advanced Features</h3>
                            <ul className="text-gray-400 text-sm space-y-1">
                                <li>○ Public launchpad beta</li>
                                <li>○ X/Twitter integration — auto-post price & market cap milestones</li>
                                <li>○ Telegram bot for real-time holder alerts</li>
                                <li>○ Custom airdrop thresholds</li>
                                <li>○ Mobile-optimized experience</li>
                                <li>○ API access for developers</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card p-12 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#9945FF] rounded-full blur-[100px] opacity-10" />
                            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#14F195] rounded-full blur-[100px] opacity-10" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14F195]/10 border border-[#14F195]/30 mb-6">
                                <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
                                <span className="text-sm text-[#14F195] font-medium">Launchpad Coming Soon</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Be First to Launch
                            </h2>
                            <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
                                Join our early access waitlist and be among the first creators to launch tokens with built-in holder rewards.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/launch" className="btn-primary text-lg px-10 py-4">
                                    🔬 Try the Preview
                                </Link>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary text-lg px-10 py-4"
                                >
                                    Follow Updates →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                                <span className="text-lg">💰</span>
                            </div>
                            <div>
                                <span className="font-bold text-lg">Share Your BAGS</span>
                                <p className="text-xs text-gray-500">Token launcher with mandatory holder rewards</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-gray-400 text-sm">
                            <Link href="/explore" className="hover:text-white transition-colors">
                                Explore Tokens
                            </Link>
                            <Link href="/dashboard" className="hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <a href="https://docs.bags.fm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                Bags Docs
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5 text-sm text-gray-500">
                        <p>© 2025 Share Your BAGS. Built on Solana.</p>
                        <div className="flex items-center gap-4">
                            <span>Platform fee: 0.25% of volume</span>
                            <span>•</span>
                            <span className="text-yellow-400">🚧 Development Preview</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
