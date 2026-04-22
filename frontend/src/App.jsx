import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Activity, Zap, TrendingUp, Shield, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Scorecard = ({ match }) => {
    if (!match) return null;
    return (
        <div className="glass-card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold opacity-60 uppercase tracking-widest">{match.tournament}</span>
                <span className="flex items-center gap-2 text-red-500">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    LIVE
                </span>
            </div>
            <div className="flex justify-between items-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-cricket-csk">{match.teams.home.short_name}</h2>
                    <p className="text-3xl font-black mt-1">{match.teams.home.score}</p>
                    <p className="text-sm opacity-60">Over {match.teams.home.overs}</p>
                </div>
                <div className="text-4xl font-black italic opacity-20">VS</div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-cricket-rcb">{match.teams.away.short_name}</h2>
                    <p className="text-3xl font-black mt-1">{match.teams.away.score}</p>
                    <p className="text-sm opacity-60">Over {match.teams.away.overs}</p>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between text-sm">
                <div>
                    <span className="opacity-60">Striker:</span> <span className="font-bold">{match.current_state.batter}</span>
                </div>
                <div>
                    <span className="opacity-60">Bowler:</span> <span className="font-bold">{match.current_state.bowler}</span>
                </div>
            </div>
        </div>
    );
};

const TacticalInsight = ({ insight }) => (
    <div className="glass-card p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={80} />
        </div>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Zap className="text-yellow-400" size={20} />
            Invisible Tactical Shift
        </h3>
        <AnimatePresence mode="wait">
            <motion.p
                key={insight}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xl font-medium leading-relaxed"
            >
                "{insight}"
            </motion.p>
        </AnimatePresence>
        <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded-full border border-white/10">
                <Shield size={12} className="text-blue-400" /> Confidence: 94%
            </div>
            <div className="flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded-full border border-white/10">
                <Target size={12} className="text-red-400" /> Criticality: High
            </div>
        </div>
    </div>
);

const GraphVisualization = ({ data }) => {
    const fgRef = useRef();

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge').strength(-400);
        }
    }, [data]);

    return (
        <div className="glass-card p-4 h-[600px] relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="text-emerald-400" size={20} />
                    Knowledge Graph Engine
                </h3>
            </div>
            <ForceGraph2D
                ref={fgRef}
                graphData={data}
                nodeLabel="label"
                nodeAutoColorBy="type"
                linkColor={() => 'rgba(255, 255, 255, 0.1)'}
                linkWidth={2}
                linkLabel="type"
                backgroundColor="rgba(0,0,0,0)"
                width={800}
                height={560}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.label;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Inter`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                    ctx.beginPath();
                    ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, 2);
                    ctx.fill();

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.color;
                    ctx.fillText(label, node.x, node.y);

                    node.__bckgDimensions = bckgDimensions;
                }}
                nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color;
                    const bckgDimensions = node.__bckgDimensions;
                    bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                }}
            />
        </div>
    );
};

export default function App() {
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMatchState = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/match-state`);
            const data = await res.json();
            setMatch(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch match state:', err);
        }
    };

    useEffect(() => {
        fetchMatchState();
        const interval = setInterval(fetchMatchState, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter glow-text italic">
                        TACTI<span className="text-emerald-400">GRAPH</span>
                    </h1>
                    <p className="opacity-50 text-sm mt-1">Live AI Inference Engine for Cricket Analytics</p>
                </div>
                <div className="glass-card px-4 py-2 flex items-center gap-3">
                    <TrendingUp className="text-emerald-400" size={18} />
                    <span className="font-bold">{match.current_state.win_probability.CSK}% Win Prob (CSK)</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Scorecard match={match} />
                    <TacticalInsight insight={match.tactical_insight} />
                </div>
                <div className="lg:col-span-2">
                    <GraphVisualization data={match.graph} />
                </div>
            </div>

            <footer className="mt-12 text-center opacity-30 text-xs">
                &copy; 2026 Live Tactical Graph Engine. Powered by Gemini 3 Flash & Vertex AI.
            </footer>
        </div>
    );
}
