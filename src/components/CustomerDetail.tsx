import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

import { API_URL } from '../config';

const API = API_URL;

interface HistoryItem {
    date: string;
    churn_probability: number;
    risk_level: string;
    is_churn: boolean;
}

interface CustomerDetailData {
    customer_id: string;
    latest_prediction: {
        is_churn: boolean;
        churn_probability: number;
        risk_level: string;
        risk_factors: string[];
        recommendations: string[];
        date: string;
    };
    progress: HistoryItem[];
}

const tipStyle = {
    background: '#080d1f', border: '1px solid rgba(56,100,200,0.15)',
    borderRadius: 10, fontSize: '0.83rem', color: '#f1f5f9',
};

export default function CustomerDetail() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<CustomerDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/customers/${id}`)
            .then(r => {
                setData(r.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="spinner" />
        </div>
    );

    if (!data) return (
        <div className="container">
            <div className="alert alert-error">Customer not found.</div>
            <Link to="/tracking" className="btn btn-ghost" style={{ marginTop: '1rem' }}>Back to Tracking</Link>
        </div>
    );

    const { latest_prediction, progress } = data;

    return (
        <div className="container anim-fade-up">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1><span className="g-cyan">{id}</span> Analysis</h1>
                    <p>Detailed churn progression and AI-driven retention strategy.</p>
                </div>
                <Link to="/tracking" className="btn btn-ghost btn-sm">← Back to Tracking</Link>
            </div>

            <div className="predict-layout">
                {/* Left Side: Progress Chart */}
                <div className="card glass-card">
                    <div className="chart-title">
                        📈 Churn Probability Progress
                        <span>progression over time</span>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={progress}>
                                <defs>
                                    <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,100,200,0.12)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString()}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                                    axisLine={false}
                                />
                                <Tooltip contentStyle={tipStyle} />
                                <Area
                                    type="monotone"
                                    dataKey="churn_probability"
                                    stroke="var(--cyan)"
                                    fillOpacity={1}
                                    fill="url(#colorProb)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Side: Current Status Info */}
                <div className="card glass-card">
                    <div className="chart-title">
                        🎯 Current Intelligence
                        <span>latest prediction status</span>
                    </div>

                    <div className="result-verdict" style={{
                        borderColor: latest_prediction.is_churn ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)',
                        background: latest_prediction.is_churn ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)',
                        '--verdict-glow': latest_prediction.is_churn ? '#ef4444' : '#10b981'
                    } as any}>
                        <div className="verdict-icon">{latest_prediction.is_churn ? '⚠️' : '✅'}</div>
                        <div className="verdict-title">{latest_prediction.is_churn ? 'High Churn Risk' : 'Healthy Customer'}</div>
                        <div className="verdict-id">Current Probability: {(latest_prediction.churn_probability * 100).toFixed(1)}%</div>
                    </div>

                    <div className="risk-section">
                        <div className="risk-list-title">🔍 Contextual Risk Factors</div>
                        {latest_prediction.risk_factors.map((f, i) => (
                            <div key={i} className="risk-item" style={{ borderColor: latest_prediction.is_churn ? 'var(--red)' : 'var(--green)' }}>
                                <span className="risk-item-dot">●</span>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Recommendations Section */}
            <div className="rec-box anim-fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="rec-title">
                    <span>💡</span> ChurnGuard AI Recommendation Engine
                </div>
                <div className="rec-list">
                    {latest_prediction.recommendations.map((r, i) => (
                        <div key={i} className="rec-item glass">
                            <div className="rec-item-icon">🚀</div>
                            <div className="rec-text">
                                <strong>Proposed Action:</strong> {r}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>
                                    Based on real-time ML feature analysis of {id}'s account activity.
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* History Feed */}
            <div style={{ marginTop: '3rem' }}>
                <div className="chart-title">
                    🕒 Prediction History Feed
                    <span>full timeline</span>
                </div>
                <div className="timeline">
                    {[...progress].reverse().map((p, i) => (
                        <div key={i} className="timeline-item">
                            <div className="timeline-dot" style={{ background: p.is_churn ? 'var(--red)' : 'var(--green)' }} />
                            <div className="timeline-content glass">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{new Date(p.date).toLocaleString()}</span>
                                        <div style={{ fontWeight: 700, marginTop: '2px' }}>
                                            Result: <span style={{ color: p.is_churn ? 'var(--red)' : 'var(--green)' }}>{p.is_churn ? 'Churn Risk' : 'Retained'}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{(p.churn_probability * 100).toFixed(1)}%</div>
                                        <div className={`badge badge-${p.risk_level.toLowerCase()}`}>{p.risk_level}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
