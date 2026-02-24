import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis,
} from 'recharts';

import { API_URL } from '../config';

const API = API_URL;

interface Stats {
    total_predictions: number;
    churned: number;
    not_churned: number;
    churn_rate_pct: number;
    avg_churn_probability_pct: number;
    risk_breakdown: { risk_level: string; count: number }[];
    daily_trend: { date: string; total: number; churned: number }[];
}

const RISK_COLORS: Record<string, string> = {
    Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444',
};

const tipStyle = {
    background: '#111827',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    fontSize: '0.85rem',
    color: '#ffffff',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
};


function EmptyChart() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 220, gap: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>📊</div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Run predictions to populate charts</p>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = (showLoading = true) => {
        if (showLoading) setLoading(true);
        else setIsRefreshing(true);

        axios.get(`${API}/stats/`)
            .then(r => {
                setStats(r.data);
                setLoading(false);
                setIsRefreshing(false);
                setError(''); // Clear error on successful fetch
            })
            .catch(() => {
                setError('Cannot connect to the production API. Please check your internet connection or backend status.');
                setLoading(false);
                setIsRefreshing(false);
            });
    };

    useEffect(() => {
        fetchStats(true);

        // Real-time polling every 10 seconds
        const interval = setInterval(() => {
            fetchStats(false);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-2)' }}>Loading analytics…</span>
        </div>
    );

    return (
        <div className="container">
            <div className="page-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Analytic <span style={{ color: 'var(--green)' }}>Dashboard</span></h1>
                    <p>Real-time churn metrics and predictive analytics overview.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                    {isRefreshing && <div className="spinner spinner-sm" />}
                    <div className="nav-status" style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: 'rgba(52, 211, 153, 0.2)', color: 'var(--green)' }}>
                        <span className="status-dot" style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
                        Live Sync Active
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error anim-fade-up" style={{ marginBottom: '1.5rem' }}>
                    <span>⚠️</span>
                    <div>
                        <strong>Backend Offline</strong>
                        <div style={{ marginTop: '0.2rem' }}>{error}</div>
                    </div>
                </div>
            )}

            {/* KPIs / Stats Strip */}
            <div className="stats-row anim-fade-up">
                <div className="stat-box">
                    <div className="stat-label">Total Predictions</div>
                    <div className="stat-val" style={{ color: 'var(--cyan)' }}>
                        {stats?.total_predictions ?? 0}
                    </div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">Churn Rate</div>
                    <div className="stat-val" style={{ color: 'var(--red)' }}>
                        {stats?.churn_rate_pct ?? 0}%
                    </div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">Risk Breakdown</div>
                    <div className="stat-val" style={{ color: 'var(--yellow)' }}>
                        {stats?.total_predictions ? Math.floor(stats.avg_churn_probability_pct * 100) : 0}
                    </div>
                </div>
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Daily Trend Donut-like or Line */}
                <div className="chart-card anim-fade-up">
                    <div className="chart-title">
                        <span style={{ color: 'var(--cyan)' }}>■</span> Daily Prediction Trend
                        <span>total vs churned per day</span>
                    </div>
                    {!stats || stats.daily_trend.length === 0 ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height={230}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Churned', value: stats.churned },
                                        { name: 'Retained', value: stats.not_churned },
                                    ]}
                                    innerRadius={70} outerRadius={95} paddingAngle={8} cornerRadius={10} dataKey="value"
                                >
                                    <Cell fill="var(--cyan)" />
                                    <Cell fill="var(--red)" />
                                </Pie>
                                <Tooltip contentStyle={tipStyle} itemStyle={{ color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Churn distribution donut */}
                <div className="chart-card anim-fade-up">
                    <div className="chart-title">
                        <span style={{ color: 'var(--cyan)' }}>◩</span> Churn Distribution
                    </div>
                    {!stats || stats.total_predictions === 0 ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height={230}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Retained', value: stats.not_churned },
                                        { name: 'Churned', value: stats.churned },
                                    ]}
                                    cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value"
                                >
                                    <Cell fill="var(--green)" />
                                    <Cell fill="var(--red)" />
                                </Pie>
                                <Tooltip contentStyle={tipStyle} itemStyle={{ color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Risk breakdown bar */}
                <div className="chart-card anim-fade-up">
                    <div className="chart-title">
                        <span style={{ color: 'var(--red)' }}>📊</span> Risk Level Breakdown
                    </div>
                    {!stats || stats.risk_breakdown.length === 0 ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart data={stats.risk_breakdown}>
                                <XAxis dataKey="risk_level" hide />
                                <YAxis hide />
                                <Tooltip contentStyle={tipStyle} itemStyle={{ color: '#fff' }} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={24}>
                                    {stats.risk_breakdown.map((entry, i) => (
                                        <Cell key={i} fill={RISK_COLORS[entry.risk_level] || 'var(--cyan)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Quick-action cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                {[
                    {
                        to: '/tracking', icon: '👤', title: 'Customer Tracking',
                        color: 'var(--cyan)'
                    },
                    {
                        to: '/predict', icon: '⊕', title: 'Single Prediction',
                        color: 'var(--violet)'
                    },
                    {
                        to: '/batch', icon: '▤', title: 'Batch Prediction',
                        color: 'var(--green)'
                    },
                    {
                        to: '/history', icon: '⊙', title: 'Risk Level Story',
                        color: 'var(--yellow)'
                    },
                ].map(({ to, icon, title, color }) => (
                    <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                        <div className="card anim-fade-up" style={{
                            cursor: 'pointer',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem 1rem',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '16px',
                                background: `${color}15`, border: `1px solid ${color}33`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.6rem', marginBottom: '1rem',
                                color: color,
                                boxShadow: `0 0 20px ${color}10`
                            }}>
                                {icon}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)' }}>{title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
