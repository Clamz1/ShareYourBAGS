'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
    { ssr: false }
);

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    {/* Development Banner */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <span className="text-yellow-400 text-sm font-medium">Development Preview</span>
                        <span className="text-gray-400 text-sm">• Full launchpad coming soon!</span>
                    </div>

                    {/* Powered By Badge */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-gray-400 text-sm">Powered by Bags API on Solana</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        The Future of<br />
                        <span className="gradient-text">Token Fee Sharing</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
                        <strong className="text-white">Share Your BAGS</strong> is revolutionizing how token communities share value. Launch
                        tokens with <span className="text-[#14F195]">mandatory holder rewards</span> — automatically distributing trading fees
                        to your top holders.
                    </p>

                    <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                        🚧 We're currently in active development. Join our waitlist to be first in line
                        when our launchpad goes live!
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link href="/launch" className="btn-primary text-lg px-8 py-4">
                            Preview Launch Wizard
                        </Link>
                        <a href="#features" className="btn-secondary text-lg px-8 py-4">
                            Learn More ↓
                        </a>
                    </div>

                    {/* Social Proof */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#14F195] to-[#9945FF]" />
                        </div>
                        <span className="text-gray-300">
                            <strong className="text-white">50+</strong> creators on our early access waitlist
                        </span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        Why <span className="gradient-text">Share Your BAGS</span>?
                    </h2>
                    <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                        Unlike traditional token launchers, we enforce a minimum 30% fee share to
                        holders. This creates sustainable tokenomics that align creator and holder
                        incentives.
                    </p>

                    {/* Feature Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card p-8">
                            <div className="w-14 h-14 rounded-2xl bg-[#14F195]/20 flex items-center justify-center mb-6">
                                <span className="text-3xl">💰</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Minimum 30% to Holders</h3>
                            <p className="text-gray-400 mb-4">
                                Every token launched through our platform must allocate a minimum of
                                30% of all trading fees to holders. Want to share more? You can set it as high as
                                you want.
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
                        <div className="glass-card p-8">
                            <div className="w-14 h-14 rounded-2xl bg-[#9945FF]/20 flex items-center justify-center mb-6">
                                <span className="text-3xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Automated SOL Airdrops</h3>
                            <p className="text-gray-400 mb-4">
                                No manual claiming required! When the fee pool reaches 0.5 SOL, our system
                                automatically distributes rewards to the top 100 holders proportionally.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#9945FF]">✓</span> Triggered at 0.5 SOL threshold
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#9945FF]">✓</span> Pro-rata distribution by balance
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#9945FF]">✓</span> Gas-optimized batch transfers
                                </li>
                            </ul>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 flex items-center justify-center mb-6">
                                <span className="text-3xl">📊</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Real-Time Analytics Dashboard</h3>
                            <p className="text-gray-400 mb-4">
                                Track every aspect of your token's performance with our comprehensive
                                analytics suite. Full transparency for creators and holders alike.
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
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-6 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        How It <span className="gradient-text">Works</span>
                    </h2>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-[#9945FF] flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                            <h3 className="font-bold mb-2">Launch Token</h3>
                            <p className="text-gray-400 text-sm">Set your token details and choose your fee split (30%+ to holders)</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-[#9945FF]/80 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                            <h3 className="font-bold mb-2">Trading Begins</h3>
                            <p className="text-gray-400 text-sm">Your token goes live on Bags.fm with trading fees accumulating</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-[#14F195]/80 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                            <h3 className="font-bold mb-2">Fees Accumulate</h3>
                            <p className="text-gray-400 text-sm">Fee pool fills up from every trade until 0.5 SOL threshold</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-[#14F195] flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                            <h3 className="font-bold mb-2">Auto Airdrop</h3>
                            <p className="text-gray-400 text-sm">SOL automatically distributed to top 100 holders</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coming Soon Features */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        <span className="gradient-text">Coming Soon</span> Features
                    </h2>
                    <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                        We're actively building new features to make Share Your BAGS the best token launchpad on Solana.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 border border-[#9945FF]/30">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🐦</span>
                                <h3 className="font-bold">Twitter/X Integration</h3>
                            </div>
                            <p className="text-gray-400 text-sm">Automatic tweets when airdrops are distributed and token milestones are reached.</p>
                        </div>
                        <div className="glass-card p-6 border border-[#14F195]/30">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">📱</span>
                                <h3 className="font-bold">Telegram Alerts</h3>
                            </div>
                            <p className="text-gray-400 text-sm">Real-time notifications in your Telegram group for trading activity and rewards.</p>
                        </div>
                        <div className="glass-card p-6 border border-[#FFD700]/30">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🏆</span>
                                <h3 className="font-bold">Leaderboards</h3>
                            </div>
                            <p className="text-gray-400 text-sm">See top earning tokens and most rewarded holders across the platform.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card p-12 relative overflow-hidden">
                        {/* Background decorations */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9945FF]/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#14F195]/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Share Your BAGS?
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                                Launch your token with built-in holder rewards and join the future of
                                fair tokenomics on Solana.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/launch" className="btn-primary text-lg px-8 py-4">
                                    🚀 Launch Your Token
                                </Link>
                                <Link href="/explore" className="btn-secondary text-lg px-8 py-4">
                                    Explore Tokens
                                </Link>
                            </div>

                            <p className="text-sm text-yellow-400 mt-6">
                                ⚠️ Launchpad Coming Soon — Preview the launch wizard now!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
                            <span className="font-bold">Share Your BAGS</span>
                        </div>

                        <div className="flex items-center gap-6 text-gray-400">
                            <a href="https://bags.fm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                Bags.fm
                            </a>
                            <a href="https://docs.bags.fm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                API Docs
                            </a>
                            <a href="https://github.com/Clamz1/ShareYourBAGS" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                GitHub
                            </a>
                        </div>

                        <p className="text-gray-500 text-sm">
                            Built with ❤️ on Solana
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
