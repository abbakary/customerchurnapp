import { useState } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

const API = API_URL;

const emptyRow = (i: number) => ({
    customer_id: `CUST-${String(i + 1).padStart(3, '0')}`,
    Age: 35,
    Subscription_Duration_Months: 12,
    Contract_Type: 'Monthly',
    Monthly_Logins: 10,
    Last_Purchase_Days_Ago: 20,
    App_Usage_Time_Min: 30,
    Monthly_Spend: 80,
    Discount_Usage_Percentage: 0.2,
    Customer_Support_Calls: 2,
    Satisfaction_Score: 3,
});

type Row = ReturnType<typeof emptyRow>;
type BatchResult = { customer_id: string; is_churn: boolean; churn_probability_pct: number; risk_level: string };

const cell: React.CSSProperties = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '5px 8px',
    color: 'var(--text-1)',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    width: '100%',
};

const RISK_COLORS: Record<string, string> = { Low: 'var(--green)', Medium: 'var(--yellow)', High: 'var(--orange)', Critical: 'var(--red)' };

export default function BatchPredict() {
    const [rows, setRows] = useState<Row[]>([emptyRow(0), emptyRow(1), emptyRow(2)]);
    const [results, setResults] = useState<BatchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const update = (i: number, k: string, v: any) =>
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

    const addRow = () => setRows(prev => [...prev, emptyRow(prev.length)]);
    const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

    const run = async () => {
        setLoading(true);
        setResults([]);
        setError('');
        try {
            const payload = rows.map(r => ({
                ...r,
                Age: Number(r.Age), Subscription_Duration_Months: Number(r.Subscription_Duration_Months),
                Monthly_Logins: Number(r.Monthly_Logins), Last_Purchase_Days_Ago: Number(r.Last_Purchase_Days_Ago),
                App_Usage_Time_Min: Number(r.App_Usage_Time_Min), Monthly_Spend: Number(r.Monthly_Spend),
                Discount_Usage_Percentage: Number(r.Discount_Usage_Percentage),
                Customer_Support_Calls: Number(r.Customer_Support_Calls),
                Satisfaction_Score: Number(r.Satisfaction_Score),
            }));
            const res = await axios.post(`${API}/predict/batch/`, payload);
            setResults(res.data.results);
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to connect to API.');
        }
        setLoading(false);
    };

    const downloadCSV = () => {
        const hdr = 'Customer ID,Is Churn,Probability %,Risk Level\n';
        const body = results.map(r => `${r.customer_id},${r.is_churn},${r.churn_probability_pct},${r.risk_level}`).join('\n');
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([hdr + body], { type: 'text/csv' })),
            download: 'churn_predictions.csv',
        });
        a.click();
    };

    const churnCount = results.filter(r => r.is_churn).length;

    return (
        <div className="container">
            <div className="page-header">
                <h1>▤ <span className="g-cyan">Batch</span> Prediction</h1>
                <p>Analyse multiple customers at once. Edit the table, click Run, and export results as CSV.</p>
            </div>

            {/* Input table */}
            <div className="card anim-fade-up" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Customer Input Table</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginTop: 2 }}>{rows.length} rows — all fields required</p>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={addRow}>+ Add Row</button>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                {['Customer ID', 'Age', 'Sub. Months', 'Contract', 'Logins/mo', 'Days w/o Purchase', 'App Min', 'Spend $', 'Discount', 'Support Calls', 'Satisfaction', ''].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i}>
                                    <td><input style={{ ...cell, width: 100 }} value={r.customer_id} onChange={e => update(i, 'customer_id', e.target.value)} /></td>
                                    <td><input style={{ ...cell, width: 52 }} type="number" min={18} max={80} value={r.Age} onChange={e => update(i, 'Age', e.target.value)} /></td>
                                    <td><input style={{ ...cell, width: 52 }} type="number" min={0} max={72} value={r.Subscription_Duration_Months} onChange={e => update(i, 'Subscription_Duration_Months', e.target.value)} /></td>
                                    <td>
                                        <select style={{ ...cell, width: 90 }} value={r.Contract_Type} onChange={e => update(i, 'Contract_Type', e.target.value)}>
                                            <option>Monthly</option><option>Annual</option>
                                        </select>
                                    </td>
                                    <td><input style={{ ...cell, width: 52 }} type="number" min={0} max={30} value={r.Monthly_Logins} onChange={e => update(i, 'Monthly_Logins', e.target.value)} /></td>
                                    <td><input style={{ ...cell, width: 62 }} type="number" min={0} max={180} value={r.Last_Purchase_Days_Ago} onChange={e => update(i, 'Last_Purchase_Days_Ago', e.target.value)} /></td>
                                    <td><input style={{ ...cell, width: 60 }} type="number" min={0} max={120} step={0.5} value={r.App_Usage_Time_Min} onChange={e => update(i, 'App_Usage_Time_Min', e.target.value)} /></td>
                                    <td><input style={{ ...cell, width: 66 }} type="number" min={10} max={400} step={0.5} value={r.Monthly_Spend} onChange={e => update(i, 'Monthly_Spend', e.target.value)} /></td>
                                    <td><input style={{ ...cell, width: 60 }} type="number" min={0} max={0.6} step={0.01} value={r.Discount_Usage_Percentage} onChange={e => update(i, 'Discount_Usage_Percentage', e.target.value)} /></td>
                                    <td><input style={{ ...cell, width: 52 }} type="number" min={0} max={10} value={r.Customer_Support_Calls} onChange={e => update(i, 'Customer_Support_Calls', e.target.value)} /></td>
                                    <td><input style={{ ...cell, width: 52 }} type="number" min={1} max={5} value={r.Satisfaction_Score} onChange={e => update(i, 'Satisfaction_Score', e.target.value)} /></td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)} disabled={rows.length === 1}>✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {error && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}><span>⚠️</span><div>{error}</div></div>}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn btn-primary" onClick={run} disabled={loading}>
                        {loading ? <><div className="spinner spinner-sm" /> Running ML model…</> : `▤ Run Batch (${rows.length} customers)`}
                    </button>
                    {results.length > 0 && (
                        <button className="btn btn-outline" onClick={downloadCSV}>⬇ Download CSV</button>
                    )}
                </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="card anim-fade-up">
                    {/* Summary strip */}
                    <div style={{
                        display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
                        padding: '0.75rem 1rem', borderRadius: 10,
                        background: 'rgba(0,0,0,0.25)', marginBottom: '1rem',
                    }}>
                        <div><span style={{ color: 'var(--text-2)', fontSize: '0.78rem' }}>Total analysed: </span><strong style={{ color: 'var(--cyan)' }}>{results.length}</strong></div>
                        <div><span style={{ color: 'var(--text-2)', fontSize: '0.78rem' }}>Churn risk: </span><strong style={{ color: 'var(--red)' }}>{churnCount}</strong></div>
                        <div><span style={{ color: 'var(--text-2)', fontSize: '0.78rem' }}>Retained: </span><strong style={{ color: 'var(--green)' }}>{results.length - churnCount}</strong></div>
                        <div><span style={{ color: 'var(--text-2)', fontSize: '0.78rem' }}>Churn rate: </span><strong style={{ color: 'var(--yellow)' }}>{((churnCount / results.length) * 100).toFixed(1)}%</strong></div>
                    </div>

                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer ID</th>
                                    <th>Verdict</th>
                                    <th style={{ minWidth: 180 }}>Churn Probability</th>
                                    <th>Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--cyan)', fontSize: '0.85rem' }}>
                                            {r.customer_id}
                                        </td>
                                        <td>
                                            <span className={`badge ${r.is_churn ? 'badge-churn' : 'badge-safe'}`}>
                                                {r.is_churn ? '⚠ Churn' : '✓ Retain'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="prob-bar-wrap">
                                                <div className="prob-bar-track">
                                                    <div
                                                        className="prob-bar-fill"
                                                        style={{
                                                            width: `${r.churn_probability_pct}%`,
                                                            background: RISK_COLORS[r.risk_level] ?? 'var(--cyan)',
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: RISK_COLORS[r.risk_level], minWidth: 42 }}>
                                                    {r.churn_probability_pct.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${r.risk_level.toLowerCase()}`}>{r.risk_level}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
