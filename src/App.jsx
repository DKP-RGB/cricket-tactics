import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Activity, Zap, TrendingUp, Shield, Target, RefreshCw } from 'lucide-react';
import matchData from './matchData';

const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

// ── Win Probability Bar ────────────────────────────────────────────────────
const WinProbBar = ({ match }) => {
    const csk = match.current_state.win_probability.CSK;
    const rcb = match.current_state.win_probability.RCB;
    return (
        <div className="mb-6">
            <div className="flex justify-between text-xs font-bold mb-2 opacity-70">
                <span className="text-yellow-400">CSK {csk}%</span>
                <span className="text-red-400">RCB {rcb}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${csk}%`, background: 'linear-gradient(90deg, #FDB913, #EF4444)' }}
                />
            </div>
        </div>
    );
};

// ── Scorecard ──────────────────────────────────────────────────────────────
const Scorecard = ({ match }) => (
    <div className="glass-card p-6 mb-5">
        {/* Match Banner */}
        <div
            className="rounded-xl mb-5 h-32 bg-center bg-cover relative overflow-hidden"
            style={{ backgroundImage: 'url(/assets/match_promo.png)' }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold bg-black/40 px-2 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    LIVE
                </span>
                <span className="text-xs opacity-70 bg-black/40 px-2 py-1 rounded-full">{match.tournament}</span>
            </div>
        </div>

        {/* Scores */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <img src="/assets/csk_logo.png" alt="CSK" className="h-12 w-12 object-contain rounded-full bg-yellow-400/10 p-1" />
                <div>
                    <p className="text-sm font-bold text-yellow-400">{match.teams.home.short_name}</p>
                    <p className="text-3xl font-black">{match.teams.home.score}</p>
                    <p className="text-xs opacity-50">{match.teams.home.overs} ov</p>
                </div>
            </div>
            <div className="text-3xl font-black italic opacity-20">VS</div>
            <div className="flex items-center gap-3 flex-row-reverse">
                <img src="/assets/rcb_logo.png" alt="RCB" className="h-12 w-12 object-contain rounded-full bg-red-400/10 p-1" />
                <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{match.teams.away.short_name}</p>
                    <p className="text-3xl font-black">{match.teams.away.score}</p>
                    <p className="text-xs opacity-50">{match.teams.away.overs} ov</p>
                </div>
            </div>
        </div>

        <WinProbBar match={match} />

        <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded-xl p-3">
                <p className="opacity-50 text-xs mb-1">Striker</p>
                <p className="font-bold">{match.current_state.batter}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
                <p className="opacity-50 text-xs mb-1">Bowler</p>
                <p className="font-bold">{match.current_state.bowler}</p>
            </div>
            <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="opacity-50 text-xs mb-1">Last Delivery</p>
                <p className="font-bold text-emerald-400">{match.current_state.last_ball}</p>
            </div>
        </div>
    </div>
);

// ── Tactical Insight ───────────────────────────────────────────────────────
const TacticalInsight = ({ insight }) => (
    <div className="glass-card p-6 overflow-hidden relative">
        <div className="absolute -top-4 -right-4 opacity-5">
            <Zap size={120} />
        </div>
        <h3 className="text-xs font-bold flex items-center gap-2 mb-4 text-yellow-400 uppercase tracking-widest">
            <Zap size={13} /> Invisible Tactical Shift · AI Inference
        </h3>
        <p className="text-lg font-semibold leading-relaxed italic border-l-2 border-yellow-400/50 pl-4">
            "{insight}"
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-xs px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <Shield size={11} className="text-blue-400" /> Confidence: 94%
            </span>
            <span className="flex items-center gap-1 text-xs px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <Target size={11} className="text-red-400" /> Criticality: High
            </span>
        </div>
    </div>
);

// ── Node colour by type/team ───────────────────────────────────────────────
const nodeColor = (node) => {
    if (node.type === 'Pitch') return '#10b981';
    if (node.type === 'Strategy') return '#a855f7';
    if (node.type === 'Position') return '#3b82f6';
    if (node.team === 'CSK') return '#FDB913';
    if (node.team === 'RCB') return '#ef4444';
    return '#94a3b8';
};

// ── Graph ──────────────────────────────────────────────────────────────────
const GraphVisualization = ({ data }) => {
    const fgRef = useRef();
    const containerRef = useRef();
    const [dims, setDims] = useState({ w: 800, h: 500 });

    useEffect(() => {
        const update = () => {
            if (containerRef.current)
                setDims({ w: containerRef.current.offsetWidth, h: 500 });
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => {
        if (fgRef.current) fgRef.current.d3Force('charge').strength(-350);
    }, [data, dims]);

    const legend = [
        { label: 'CSK Player', color: '#FDB913' },
        { label: 'RCB Player', color: '#ef4444' },
        { label: 'Pitch', color: '#10b981' },
        { label: 'Strategy', color: '#a855f7' },
        { label: 'Position', color: '#3b82f6' },
    ];

    return (
        <div ref={containerRef} className="glass-card p-5 h-full relative overflow-hidden">
            <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
                <h3 className="text-xs font-bold flex items-center gap-2 text-emerald-400 uppercase tracking-widest">
                    <Activity size={13} /> Knowledge Graph Engine
                </h3>
                <div className="flex flex-wrap gap-3">
                    {legend.map(t => (
                        <span key={t.label} className="flex items-center gap-1 text-xs opacity-60">
                            <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                            {t.label}
                        </span>
                    ))}
                </div>
            </div>

            <Suspense fallback={
                <div className="flex items-center justify-center h-[460px] opacity-40 text-sm">
                    Loading graph…
                </div>
            }>
                <ForceGraph2D
                    ref={fgRef}
                    graphData={data}
                    nodeLabel="label"
                    nodeColor={nodeColor}
                    nodeVal="val"
                    linkColor={() => 'rgba(148,163,184,0.25)'}
                    linkWidth={2}
                    linkLabel="type"
                    backgroundColor="rgba(0,0,0,0)"
                    width={dims.w - 40}
                    height={460}
                    nodeCanvasObject={(node, ctx, gs) => {
                        const fontSize = Math.max(10, 13 / gs);
                        const r = (node.val || 10) * 0.55;
                        const color = nodeColor(node);

                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
                        ctx.fillStyle = color + '33';
                        ctx.fill();
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 2 / gs;
                        ctx.stroke();

                        ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
                        ctx.fillStyle = color;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(node.label, node.x, node.y + r + fontSize);
                    }}
                />
            </Suspense>
        </div>
    );
};

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
    const [insightIdx, setInsightIdx] = useState(0);

    // Cycle through insights every 8 seconds to simulate AI updates
    useEffect(() => {
        const interval = setInterval(() => {
            setInsightIdx(i => (i + 1) % matchData.tactical_insights.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const insight = matchData.tactical_insights[insightIdx];

    return (
        <div className="min-h-screen p-6 md:p-10 max-w-[1400px] mx-auto">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter italic glow-text">
                        TACTI<span className="text-emerald-400">GRAPH</span>
                    </h1>
                    <p className="opacity-40 text-xs mt-1 tracking-widest uppercase">
                        Real-Time AI Inference Engine for Cricket Analytics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-card px-4 py-2 flex items-center gap-2 text-sm">
                        <TrendingUp className="text-emerald-400" size={16} />
                        <span className="font-bold">CSK Win: {matchData.current_state.win_probability.CSK}%</span>
                    </div>
                    <button
                        onClick={() => setInsightIdx(i => (i + 1) % matchData.tactical_insights.length)}
                        className="glass-card px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-all duration-200 text-sm"
                    >
                        <RefreshCw size={14} className="opacity-50" /> Next Insight
                    </button>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1 flex flex-col gap-5">
                    <Scorecard match={matchData} />
                    <TacticalInsight insight={insight} />
                </div>
                <div className="lg:col-span-2 h-[580px]">
                    <GraphVisualization data={matchData.graph} />
                </div>
            </div>

            <footer className="mt-12 text-center opacity-20 text-xs">
                &copy; 2026 Live Tactical Graph Engine · IPL 2024 · CSK vs RCB
            </footer>
        </div>
    );
}
