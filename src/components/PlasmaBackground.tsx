'use client';

import { useEffect, useRef } from 'react';

interface NetworkNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    isMainNode: boolean;
    label?: string;
    pulsePhase: number;
}

interface Transaction {
    fromNode: number;
    toNode: number;
    progress: number;
    speed: number;
    color: string;
    size: number;
}

interface FeeAirdrop {
    sourceNode: number;
    targetNodes: number[];
    particles: Array<{
        targetNode: number;
        progress: number;
        speed: number;
    }>;
    active: boolean;
}

export function PlasmaBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const nodesRef = useRef<NetworkNode[]>([]);
    const transactionsRef = useRef<Transaction[]>([]);
    const airdropsRef = useRef<FeeAirdrop[]>([]);
    const lastAirdropRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initNodes();
        };

        const initNodes = () => {
            nodesRef.current = [];

            // Create 3 main nodes (Pool, Token, Fee Contract)
            const mainPositions = [
                { x: width * 0.2, y: height * 0.3, label: 'Token' },
                { x: width * 0.5, y: height * 0.5, label: 'Pool' },
                { x: width * 0.8, y: height * 0.4, label: 'Fees' },
            ];

            mainPositions.forEach((pos, i) => {
                nodesRef.current.push({
                    x: pos.x,
                    y: pos.y,
                    vx: 0,
                    vy: 0,
                    size: 20 + Math.random() * 10,
                    color: i === 2 ? '#FFD700' : (i === 0 ? '#9945FF' : '#14F195'),
                    isMainNode: true,
                    label: pos.label,
                    pulsePhase: Math.random() * Math.PI * 2,
                });
            });

            // Create holder nodes around the main nodes
            const holderCount = Math.min(25, Math.floor((width * height) / 50000));
            for (let i = 0; i < holderCount; i++) {
                nodesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: 4 + Math.random() * 4,
                    color: `rgba(${153 + Math.random() * 50}, ${69 + Math.random() * 100}, ${255}, 0.6)`,
                    isMainNode: false,
                    pulsePhase: Math.random() * Math.PI * 2,
                });
            }
        };

        const createTransaction = () => {
            if (nodesRef.current.length < 4) return;

            const mainNodes = [0, 1, 2];
            const holderNodes = nodesRef.current.slice(3).map((_, i) => i + 3);

            if (Math.random() > 0.7 && holderNodes.length > 0) {
                const from = holderNodes[Math.floor(Math.random() * holderNodes.length)];
                const to = mainNodes[Math.floor(Math.random() * mainNodes.length)];
                transactionsRef.current.push({
                    fromNode: from,
                    toNode: to,
                    progress: 0,
                    speed: 0.005 + Math.random() * 0.01,
                    color: '#14F195',
                    size: 2,
                });
            }
        };

        const triggerFeeAirdrop = () => {
            if (nodesRef.current.length < 6) return;

            const now = Date.now();
            // Trigger every 5-30 seconds
            if (now - lastAirdropRef.current < 5000 + Math.random() * 25000) return;

            lastAirdropRef.current = now;

            // Fee node (index 2) sends to random holder nodes
            const holderNodes = nodesRef.current.slice(3).map((_, i) => i + 3);
            const targetCount = Math.min(10, Math.floor(holderNodes.length * 0.4));
            const targets: number[] = [];

            for (let i = 0; i < targetCount; i++) {
                const randomHolder = holderNodes[Math.floor(Math.random() * holderNodes.length)];
                if (!targets.includes(randomHolder)) {
                    targets.push(randomHolder);
                }
            }

            if (targets.length > 0) {
                airdropsRef.current.push({
                    sourceNode: 2,
                    targetNodes: targets,
                    particles: targets.map(t => ({
                        targetNode: t,
                        progress: 0,
                        speed: 0.008 + Math.random() * 0.005,
                    })),
                    active: true,
                });
            }
        };

        const drawNode = (node: NetworkNode) => {
            const pulse = Math.sin(Date.now() * 0.002 + node.pulsePhase) * 0.2 + 1;
            const size = node.size * pulse;

            // Glow
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 3);
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            ctx.fill();

            // Label for main nodes
            if (node.isMainNode && node.label) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '10px system-ui';
                ctx.textAlign = 'center';
                ctx.fillText(node.label, node.x, node.y + size + 15);
            }
        };

        const drawConnection = (from: NetworkNode, to: NetworkNode, alpha: number = 0.1) => {
            ctx.strokeStyle = `rgba(153, 69, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        };

        const drawTransaction = (tx: Transaction) => {
            const from = nodesRef.current[tx.fromNode];
            const to = nodesRef.current[tx.toNode];
            if (!from || !to) return;

            const x = from.x + (to.x - from.x) * tx.progress;
            const y = from.y + (to.y - from.y) * tx.progress;

            ctx.fillStyle = tx.color;
            ctx.beginPath();
            ctx.arc(x, y, tx.size, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawAirdropParticle = (sourceNode: NetworkNode, particle: { targetNode: number; progress: number }) => {
            const target = nodesRef.current[particle.targetNode];
            if (!target) return;

            const x = sourceNode.x + (target.x - sourceNode.x) * particle.progress;
            const y = sourceNode.y + (target.y - sourceNode.y) * particle.progress;

            // Golden glow for fee distribution
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Dark gradient background
            const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
            bgGradient.addColorStop(0, '#0a0a0f');
            bgGradient.addColorStop(1, '#0f0a1a');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            // Update and draw nodes
            nodesRef.current.forEach((node, i) => {
                if (!node.isMainNode) {
                    node.x += node.vx;
                    node.y += node.vy;

                    // Bounce off edges
                    if (node.x < 0 || node.x > width) node.vx *= -1;
                    if (node.y < 0 || node.y > height) node.vy *= -1;

                    // Slight drift
                    node.vx += (Math.random() - 0.5) * 0.01;
                    node.vy += (Math.random() - 0.5) * 0.01;
                    node.vx *= 0.99;
                    node.vy *= 0.99;
                }
            });

            // Draw connections between nearby nodes
            for (let i = 0; i < nodesRef.current.length; i++) {
                for (let j = i + 1; j < nodesRef.current.length; j++) {
                    const a = nodesRef.current[i];
                    const b = nodesRef.current[j];
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 200) {
                        drawConnection(a, b, 0.05 * (1 - dist / 200));
                    }
                }
            }

            // Draw nodes
            nodesRef.current.forEach(drawNode);

            // Create and update transactions
            if (Math.random() > 0.98) createTransaction();
            transactionsRef.current = transactionsRef.current.filter(tx => {
                tx.progress += tx.speed;
                if (tx.progress < 1) {
                    drawTransaction(tx);
                    return true;
                }
                return false;
            });

            // Trigger and draw fee airdrops
            triggerFeeAirdrop();
            airdropsRef.current = airdropsRef.current.filter(airdrop => {
                const sourceNode = nodesRef.current[airdrop.sourceNode];
                if (!sourceNode) return false;

                let stillActive = false;
                airdrop.particles.forEach(particle => {
                    particle.progress += particle.speed;
                    if (particle.progress < 1) {
                        stillActive = true;
                        drawAirdropParticle(sourceNode, particle);
                    }
                });
                return stillActive;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: -1 }}
        />
    );
}
