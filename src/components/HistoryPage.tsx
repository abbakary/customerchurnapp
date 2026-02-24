import { useEffect, useState } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

const API = API_URL;

interface Pred {
    id: number; customer_id: string; age: number; contract_type: string;
    monthly_spend: number; satisfaction_score: number; customer_support_calls: number;
    monthly_logins: number; last_purchase_days_ago: number;
    is_churn: boolean; churn_probability: number; risk_level: string; created_at: string;
}

const RISK_COLOR: Record<string, string> = { Low: 'var(--green)', Medium: 'var(--yellow)', High: 'var(--orange)', Critical: 'var(--red)' };

const PER_PAGE = 15;

export default function HistoryPage() {
    const [records, setRecords] = useState<Pred[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [riskFilter, setRiskFilter] = useState('');
    const [churnFilter, setChurnFilter] = useState('');
    const [page, setPage] = useState(1);

    const fetch = () => {
        setLoading(true);
        let url = `${API}/history/?`;
        if (riskFilter) url += `risk_level=${riskFilter}&`;
        if (churnFilter !== '') url += `is_churn=${churnFilter}&`;
        axios.get(url)
            .then(r => { setRecords(r.data); setPage(1); setLoading(false); })
            .catch(() => { setError('Cannot load history. Please check backend status.'); setLoading(false); });
    };

    useEffect(() => { fetch(); }, [riskFilter, churnFilter]);

    const del = (id: number) =>
        axios.delete(`${API}/history/${id}/`).then(() => setRecords(p => p.filter(r => r.id !== id)));

    const totalPages = Math.ceil(records.length / PER_PAGE);
    const page_data = records.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const churned = records.filter(r => r.is_churn).length;
    const retained = records.length - churned;

    return (
        <div className="container">
            <div className="page-hero anim-fade-up">
                <h1>⊙ Prediction <span style={{ color: 'var(--green)' }}>History</span></h1>
                <p>Full audit trail of all past predictions — filter, browse, and delete records.</p>
            </div>

            {/* Stats strip */}
            {records.length > 0 && (
                <div className="stats-row anim-fade-up">
                    <div className="stat-box">
                        <div className="stat-label">Total Records</div>
                        <div className="stat-val" style={{ color: 'var(--cyan)' }}>{records.length}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Churn</div>
                        <div className="stat-val" style={{ color: 'var(--red)' }}>{churned}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Retained</div>
                        <div className="stat-val" style={{ color: 'var(--green)' }}>{retained}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Churn Rate</div>
                        <div className="stat-val" style={{ color: 'var(--yellow)' }}>
                            {records.length ? ((churned / records.length) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                </div>
            )}

            {/* Filters & Control bar */}
            <div className="control-group anim-fade-up">
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div>
                        <div className="stat-label" style={{ marginBottom: 4 }}>Risk Level</div>
                        <select className="form-select" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
                            <option value="">All Risks</option>
                            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                        </select>
                    </div>
                    <div>
                        <div className="stat-label" style={{ marginBottom: 4 }}>Status</div>
                        <select className="form-select" value={churnFilter} onChange={e => setChurnFilter(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="true">⚠ Churned</option>
                            <option value="false">✓ Retained</option>
                        </select>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={fetch} style={{ marginTop: '1.2rem' }}>↻ Refresh</button>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="stat-label">Visibility</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-2)' }}>
                        Showing {records.length} records
                    </div>
                </div>
            </div>

            {/* States */}
            {loading && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
                    <div className="spinner" /> <span style={{ color: 'var(--text-2)' }}>Fetching records…</span>
                </div>
            )}
            {error && <div className="alert alert-error"><span>⚠️</span><div>{error}</div></div>}

            {!loading && !error && records.length === 0 && (
                <div className="card anim-fade-up">
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No predictions yet</h3>
                        <p>Make your first prediction to see records here.</p>
                        <a href="/predict" className="btn btn-primary">⊕ Make a Prediction</a>
                    </div>
                </div>
            )}

            {!loading && records.length > 0 && (
                <>
                    <div className="table-wrap anim-fade-up">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Customer</th>
                                    <th>Age</th>
                                    <th>Contract</th>
                                    <th>Logins</th>
                                    <th>Last Purchase</th>
                                    <th>Spend</th>
                                    <th>Support</th>
                                    <th>Satisfaction</th>
                                    <th>Result</th>
                                    <th style={{ minWidth: 160 }}>Probability</th>
                                    <th>Risk</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {page_data.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>{r.id}</td>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', color: 'var(--cyan)', fontSize: '0.83rem' }}>
                                                {r.customer_id || '—'}
                                            </span>
                                        </td>
                                        <td>{r.age}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4,
                                                background: r.contract_type === 'Annual' ? 'var(--violet-soft)' : 'var(--cyan-soft)',
                                                color: r.contract_type === 'Annual' ? 'var(--violet)' : 'var(--cyan)',
                                                fontWeight: 600,
                                            }}>
                                                {r.contract_type}
                                            </span>
                                        </td>
                                        <td>{r.monthly_logins}</td>
                                        <td>
                                            <span style={{ color: r.last_purchase_days_ago >= 60 ? 'var(--red)' : 'var(--text-2)', fontSize: '0.83rem' }}>
                                                {r.last_purchase_days_ago}d ago
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--yellow)', fontWeight: 600 }}>${r.monthly_spend.toFixed(0)}</td>
                                        <td>
                                            <span style={{ color: r.customer_support_calls >= 5 ? 'var(--red)' : 'var(--text-2)', fontWeight: r.customer_support_calls >= 5 ? 700 : 400 }}>
                                                {r.customer_support_calls}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.78rem', color: r.satisfaction_score <= 2 ? 'var(--red)' : r.satisfaction_score === 3 ? 'var(--yellow)' : 'var(--green)' }}>
                                                {'★'.repeat(r.satisfaction_score)}{'☆'.repeat(5 - r.satisfaction_score)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${r.is_churn ? 'badge-churn' : 'badge-safe'}`}>
                                                {r.is_churn ? '⚠ Churn' : '✓ Retain'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="prob-bar-wrap">
                                                <div className="prob-bar-track">
                                                    <div className="prob-bar-fill" style={{
                                                        width: `${r.churn_probability * 100}%`,
                                                        background: RISK_COLOR[r.risk_level] ?? 'var(--cyan)',
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: RISK_COLOR[r.risk_level], minWidth: 42 }}>
                                                    {(r.churn_probability * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td><span className={`badge badge-${r.risk_level.toLowerCase()}`}>{r.risk_level}</span></td>
                                        <td style={{ fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                                            {new Date(r.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => del(r.id)}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page + i - 3;
                                if (p < 1 || p > totalPages) return null;
                                return (
                                    <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                );
                            })}
                            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
