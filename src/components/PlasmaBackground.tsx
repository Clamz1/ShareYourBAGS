'use client';

import { useEffect, useRef } from 'react';

interface NetworkNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    pulsePhase: number;
    isHolder: boolean;
    label: string;
}

interface Transaction {
    fromNode: number;
    toNode: number;
    progress: number;
    speed: number;
    color: string;
    isFeeDistribution: boolean;
}

interface FeeAirdrop {
    sourceNode: number;
    targetNodes: number[];
    progress: number;
    life: number;
    maxLife: number;
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

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initNodes();
        };

        const initNodes = () => {
            nodesRef.current = [];

            const mainNodeCount = Math.floor(canvas.width / 350) + 2;
            for (let i = 0; i < mainNodeCount; i++) {
                nodesRef.current.push({
                    x: (canvas.width / (mainNodeCount + 1)) * (i + 1) + (Math.random() - 0.5) * 100,
                    y: canvas.height * 0.3 + (Math.random() - 0.5) * 150,
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: (Math.random() - 0.5) * 0.15,
                    size: 12 + Math.random() * 6,
                    pulsePhase: Math.random() * Math.PI * 2,
                    isHolder: false,
                    label: ['TOKEN', 'POOL', 'FEE'][i % 3],
                });
            }

            const holderCount = Math.floor(canvas.width / 150) + 6;
            for (let i = 0; i < holderCount; i++) {
                nodesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height * 0.4 + Math.random() * canvas.height * 0.5,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    size: 4 + Math.random() * 3,
                    pulsePhase: Math.random() * Math.PI * 2,
                    isHolder: true,
                    label: '',
                });
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const colors = {
            purple: 'rgba(153, 69, 255,',
            teal: 'rgba(20, 241, 149,',
            gold: 'rgba(255, 200, 50,',
        };

        const createTransaction = (): Transaction | null => {
            const nodes = nodesRef.current;
            if (nodes.length < 2) return null;

            const fromNode = Math.floor(Math.random() * nodes.length);
            let toNode = Math.floor(Math.random() * nodes.length);
            while (toNode === fromNode) {
                toNode = Math.floor(Math.random() * nodes.length);
            }

            return {
                fromNode,
                toNode,
                progress: 0,
                speed: 0.006 + Math.random() * 0.008,
                color: Math.random() > 0.5 ? colors.purple : colors.teal,
                isFeeDistribution: false,
            };
        };

        const createFeeAirdrop = (): FeeAirdrop | null => {
            const nodes = nodesRef.current;
            const mainNodes = nodes.filter((n) => !n.isHolder);
            const holderNodes = nodes.map((n, i) => ({ node: n, index: i })).filter(n => n.node.isHolder);

            if (mainNodes.length === 0 || holderNodes.length < 3) return null;

            const sourceIdx = nodesRef.current.findIndex(n => !n.isHolder);
            const targetCount = Math.min(5 + Math.floor(Math.random() * 6), holderNodes.length);
            const shuffled = holderNodes.sort(() => Math.random() - 0.5);
            const targets = shuffled.slice(0, targetCount).map(n => n.index);

            return {
                sourceNode: sourceIdx,
                targetNodes: targets,
                progress: 0,
                life: 0,
                maxLife: 150,
            };
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const time = Date.now() * 0.001;

            const orbGradient1 = ctx.createRadialGradient(
                canvas.width * 0.15, canvas.height * 0.25, 0,
                canvas.width * 0.15, canvas.height * 0.25, canvas.width * 0.4
            );
            orbGradient1.addColorStop(0, 'rgba(153, 69, 255, 0.08)');
            orbGradient1.addColorStop(1, 'rgba(153, 69, 255, 0)');
            ctx.fillStyle = orbGradient1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const orbGradient2 = ctx.createRadialGradient(
                canvas.width * 0.85, canvas.height * 0.75, 0,
                canvas.width * 0.85, canvas.height * 0.75, canvas.width * 0.4
            );
            orbGradient2.addColorStop(0, 'rgba(20, 241, 149, 0.06)');
            orbGradient2.addColorStop(1, 'rgba(20, 241, 149, 0)');
            ctx.fillStyle = orbGradient2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            nodesRef.current.forEach((node) => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < -30) node.x = canvas.width + 30;
                if (node.x > canvas.width + 30) node.x = -30;
                if (node.y < -30) node.y = canvas.height + 30;
                if (node.y > canvas.height + 30) node.y = -30;

                const pulse = 1 + Math.sin(time * 2 + node.pulsePhase) * 0.15;
                const size = node.size * pulse;

                if (node.isHolder) {
                    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 3);
                    gradient.addColorStop(0, 'rgba(20, 241, 149, 0.25)');
                    gradient.addColorStop(0.5, 'rgba(20, 241, 149, 0.08)');
                    gradient.addColorStop(1, 'rgba(20, 241, 149, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(20, 241, 149, 0.4)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(20, 241, 149, 0.6)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else {
                    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 5);
                    gradient.addColorStop(0, 'rgba(153, 69, 255, 0.3)');
                    gradient.addColorStop(0.4, 'rgba(153, 69, 255, 0.1)');
                    gradient.addColorStop(1, 'rgba(153, 69, 255, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size * 5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i - Math.PI / 6;
                        const px = node.x + Math.cos(angle) * size * 1.2;
                        const py = node.y + Math.sin(angle) * size * 1.2;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(153, 69, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(153, 69, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size * 0.9, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(20, 241, 149, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            nodesRef.current.forEach((node1, i) => {
                nodesRef.current.slice(i + 1).forEach((node2) => {
                    const dx = node1.x - node2.x;
                    const dy = node1.y - node2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = node1.isHolder && node2.isHolder ? 150 : 350;

                    if (distance < maxDist) {
                        const opacity = (1 - distance / maxDist) * 0.15;

                        ctx.beginPath();
                        ctx.setLineDash([3, 6]);
                        ctx.moveTo(node1.x, node1.y);
                        ctx.lineTo(node2.x, node2.y);
                        ctx.strokeStyle = `rgba(153, 69, 255, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                });
            });

            if (Math.random() < 0.015 && transactionsRef.current.length < 6) {
                const tx = createTransaction();
                if (tx) transactionsRef.current.push(tx);
            }

            if (time - lastAirdropRef.current > 5 + Math.random() * 25 && airdropsRef.current.length === 0) {
                const airdrop = createFeeAirdrop();
                if (airdrop) {
                    airdropsRef.current.push(airdrop);
                    lastAirdropRef.current = time;
                }
            }

            transactionsRef.current = transactionsRef.current.filter((tx) => {
                const fromNode = nodesRef.current[tx.fromNode];
                const toNode = nodesRef.current[tx.toNode];
                if (!fromNode || !toNode) return false;

                tx.progress += tx.speed;

                const x = fromNode.x + (toNode.x - fromNode.x) * tx.progress;
                const y = fromNode.y + (toNode.y - fromNode.y) * tx.progress;

                const trailLen = 0.12;
                const ts = Math.max(0, tx.progress - trailLen);
                const tx1 = fromNode.x + (toNode.x - fromNode.x) * ts;
                const ty1 = fromNode.y + (toNode.y - fromNode.y) * ts;

                const trailGrad = ctx.createLinearGradient(tx1, ty1, x, y);
                trailGrad.addColorStop(0, tx.color + '0)');
                trailGrad.addColorStop(1, tx.color + '0.5)');

                ctx.beginPath();
                ctx.moveTo(tx1, ty1);
                ctx.lineTo(x, y);
                ctx.strokeStyle = trailGrad;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.stroke();

                const packetGrad = ctx.createRadialGradient(x, y, 0, x, y, 6);
                packetGrad.addColorStop(0, 'rgba(255,255,255,0.8)');
                packetGrad.addColorStop(0.4, tx.color + '0.6)');
                packetGrad.addColorStop(1, tx.color + '0)');
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = packetGrad;
                ctx.fill();

                return tx.progress < 1;
            });

            airdropsRef.current = airdropsRef.current.filter((airdrop) => {
                airdrop.life++;
                airdrop.progress = Math.min(airdrop.life / 80, 1);

                const sourceNode = nodesRef.current[airdrop.sourceNode];
                if (!sourceNode) return false;

                if (airdrop.life < 30) {
                    const ringRadius = (airdrop.life / 30) * 40;
                    const ringOpacity = 1 - (airdrop.life / 30);
                    ctx.beginPath();
                    ctx.arc(sourceNode.x, sourceNode.y, ringRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 200, 50, ${ringOpacity * 0.6})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

                airdrop.targetNodes.forEach((targetIdx, i) => {
                    const targetNode = nodesRef.current[targetIdx];
                    if (!targetNode) return;

                    const delay = i * 0.05;
                    const progress = Math.max(0, Math.min(1, (airdrop.progress - delay) / (1 - delay)));

                    if (progress <= 0) return;

                    const x = sourceNode.x + (targetNode.x - sourceNode.x) * progress;
                    const y = sourceNode.y + (targetNode.y - sourceNode.y) * progress;

                    const trailLen = 0.15;
                    const ts = Math.max(0, progress - trailLen);
                    const tx1 = sourceNode.x + (targetNode.x - sourceNode.x) * ts;
                    const ty1 = sourceNode.y + (targetNode.y - sourceNode.y) * ts;

                    const trailGrad = ctx.createLinearGradient(tx1, ty1, x, y);
                    trailGrad.addColorStop(0, 'rgba(255, 200, 50, 0)');
                    trailGrad.addColorStop(1, 'rgba(255, 200, 50, 0.7)');

                    ctx.beginPath();
                    ctx.moveTo(tx1, ty1);
                    ctx.lineTo(x, y);
                    ctx.strokeStyle = trailGrad;
                    ctx.lineWidth = 2.5;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    const packetGrad = ctx.createRadialGradient(x, y, 0, x, y, 8);
                    packetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    packetGrad.addColorStop(0.3, 'rgba(255, 200, 50, 0.8)');
                    packetGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.fillStyle = packetGrad;
                    ctx.fill();

                    if (progress > 0.95) {
                        const flashOpacity = (1 - (progress - 0.95) / 0.05) * 0.5;
                        ctx.beginPath();
                        ctx.arc(targetNode.x, targetNode.y, 15, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 200, 50, ${flashOpacity})`;
                        ctx.fill();
                    }
                });

                return airdrop.life < airdrop.maxLife;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

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
