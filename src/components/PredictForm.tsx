import { useState } from 'react';
import axios from 'axios';
import ResultCard from './ResultCard';

import { API_URL } from '../config';

const API = API_URL;

interface FormData {
    customer_id: string;
    Age: number;
    Subscription_Duration_Months: number;
    Contract_Type: string;
    Monthly_Logins: number;
    Last_Purchase_Days_Ago: number;
    App_Usage_Time_Min: number;
    Monthly_Spend: number;
    Discount_Usage_Percentage: number;
    Customer_Support_Calls: number;
    Satisfaction_Score: number;
}

const defaults: FormData = {
    customer_id: '',
    Age: 35,
    Subscription_Duration_Months: 18,
    Contract_Type: 'Monthly',
    Monthly_Logins: 10,
    Last_Purchase_Days_Ago: 25,
    App_Usage_Time_Min: 35,
    Monthly_Spend: 85,
    Discount_Usage_Percentage: 0.2,
    Customer_Support_Calls: 2,
    Satisfaction_Score: 3,
};

/* Compute a live "pre-flight" risk hint for the user */
function liveRiskHint(f: FormData): { label: string; color: string; score: number } {
    let score = 0;
    if (f.Satisfaction_Score <= 2) score += 30;
    if (f.Customer_Support_Calls >= 5) score += 20;
    if (f.Last_Purchase_Days_Ago >= 60) score += 15;
    if (f.Monthly_Logins <= 3) score += 15;
    if (f.Contract_Type === 'Monthly') score += 10;
    if (f.Monthly_Spend < 30) score += 10;
    score = Math.min(100, score);
    if (score < 25) return { label: 'Low Risk', color: 'var(--green)', score };
    if (score < 50) return { label: 'Medium Risk', color: 'var(--yellow)', score };
    if (score < 75) return { label: 'High Risk', color: 'var(--orange)', score };
    return { label: 'Critical Risk', color: 'var(--red)', score };
}

function RangeField({
    label, field, min, max, step = 1, fmt, form, set,
}: {
    label: string; field: keyof FormData; min: number; max: number; step?: number;
    fmt: (v: number) => string; form: FormData; set: (k: keyof FormData, v: any) => void;
}) {
    const val = form[field] as number;
    const pct = ((val - min) / (max - min)) * 100;
    return (
        <div className="form-field">
            <label className="form-label">
                {label}
                <span className="val">{fmt(val)}</span>
            </label>
            <div className="range-wrap">
                <input
                    type="range" min={min} max={max} step={step}
                    value={val}
                    onChange={e => set(field, parseFloat(e.target.value))}
                    className="form-range"
                    style={{ background: `linear-gradient(to right, var(--cyan) ${pct}%, var(--border) ${pct}%)` }}
                />
                <div className="range-ticks"><span>{fmt(min)}</span><span>{fmt(max)}</span></div>
            </div>
        </div>
    );
}

export default function PredictForm() {
    const [form, setForm] = useState<FormData>({ ...defaults });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const set = (k: keyof FormData, v: any) => {
        setForm(f => ({ ...f, [k]: v }));
        setResult(null); // clear result on change
    };

    const hint = liveRiskHint(form);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError('');
        try {
            const payload = {
                ...form,
                Age: Number(form.Age),
                Subscription_Duration_Months: Number(form.Subscription_Duration_Months),
                Monthly_Logins: Number(form.Monthly_Logins),
                Last_Purchase_Days_Ago: Number(form.Last_Purchase_Days_Ago),
                App_Usage_Time_Min: Number(form.App_Usage_Time_Min),
                Monthly_Spend: Number(form.Monthly_Spend),
                Discount_Usage_Percentage: Number(form.Discount_Usage_Percentage),
                Customer_Support_Calls: Number(form.Customer_Support_Calls),
                Satisfaction_Score: Number(form.Satisfaction_Score),
            };
            const res = await axios.post(`${API}/predict/`, payload);
            setResult(res.data);
        } catch (err: any) {
            setError(
                err.response?.data?.errors
                    ? Object.entries(err.response.data.errors).map(([k, v]) => `${k}: ${v}`).join(' • ')
                    : 'Cannot reach Django API on port 8000.'
            );
        }
        setLoading(false);
    };

    const SCORE_LABELS = ['Very Poor', 'Poor', 'Neutral', 'Good', 'Excellent'];

    return (
        <div className="container">
            <div className="page-hero anim-fade-up">
                <h1>⊕ <span style={{ color: 'var(--green)' }}>Single</span> Prediction</h1>
                <p>Fill in the customer attributes below — the model will return churn probability, risk level, and actionable recommendations.</p>
            </div>

            <div className={`predict-layout${result ? '' : ' full'}`}>
                {/* ─── Form ─── */}
                <form onSubmit={handleSubmit}>
                    {/* Live risk meter */}
                    <div className="card card-sm anim-fade-up" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live Risk Estimate</span>
                                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: hint.color }}>{hint.label} · {hint.score}%</span>
                            </div>
                            <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${hint.score}%`, background: hint.color, borderRadius: 4, transition: 'width 0.4s ease, background 0.4s ease', boxShadow: `0 0 8px ${hint.color}80` }} />
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>Based on heuristic — run prediction for exact ML probability</p>
                        </div>
                    </div>

                    {/* Section: Customer Identity */}
                    <div className="card anim-fade-up" style={{ marginBottom: '1rem' }}>
                        <div className="form-section-title">👤 Customer Identity</div>
                        <div className="field-grid">
                            <div className="form-field">
                                <label className="form-label">Customer ID <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '0.68rem' }}>(optional)</span></label>
                                <input className="form-input" placeholder="e.g. CUST-00123" value={form.customer_id} onChange={e => set('customer_id', e.target.value)} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Contract Type</label>
                                <select className="form-select" value={form.Contract_Type} onChange={e => set('Contract_Type', e.target.value)}>
                                    <option value="Monthly">📅 Monthly (higher risk)</option>
                                    <option value="Annual">📆 Annual (lower risk)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Demographics */}
                    <div className="card anim-fade-up" style={{ marginBottom: '1rem' }}>
                        <div className="form-section-title">📋 Demographics & Subscription</div>
                        <div className="field-grid">
                            <RangeField label="Age" field="Age" min={18} max={80} fmt={v => `${v} yrs`} form={form} set={set} />
                            <RangeField label="Subscription Duration" field="Subscription_Duration_Months" min={0} max={72} fmt={v => `${v} mo`} form={form} set={set} />
                        </div>
                    </div>

                    {/* Section: Engagement */}
                    <div className="card anim-fade-up" style={{ marginBottom: '1rem' }}>
                        <div className="form-section-title">📱 Engagement Signals</div>
                        <div className="field-grid">
                            <RangeField label="Monthly Logins" field="Monthly_Logins" min={0} max={30} fmt={v => `${v}x`} form={form} set={set} />
                            <RangeField label="Days Since Last Purchase" field="Last_Purchase_Days_Ago" min={0} max={180} fmt={v => `${v}d`} form={form} set={set} />
                            <RangeField label="App Usage (min/month)" field="App_Usage_Time_Min" min={0} max={120} step={0.5} fmt={v => `${v} min`} form={form} set={set} />
                            <RangeField label="Monthly Spend" field="Monthly_Spend" min={10} max={400} step={0.5} fmt={v => `$${v}`} form={form} set={set} />
                        </div>
                    </div>

                    {/* Section: Support & Satisfaction */}
                    <div className="card anim-fade-up" style={{ marginBottom: '1rem' }}>
                        <div className="form-section-title">💬 Support & Satisfaction</div>
                        <div className="field-grid">
                            <RangeField label="Discount Usage %" field="Discount_Usage_Percentage" min={0} max={0.6} step={0.01} fmt={v => `${(v * 100).toFixed(0)}%`} form={form} set={set} />
                            <RangeField label="Support Calls" field="Customer_Support_Calls" min={0} max={10} fmt={v => `${v} calls`} form={form} set={set} />
                        </div>
                        {/* Star rating */}
                        <div className="form-field" style={{ marginTop: '0.9rem' }}>
                            <label className="form-label">Satisfaction Score</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <div className="star-row">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} type="button" onClick={() => set('Satisfaction_Score', n)}
                                            className={`star-btn${form.Satisfaction_Score >= n ? ' active' : ''}`}>
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <span className="star-score-label">{SCORE_LABELS[form.Satisfaction_Score - 1]}</span>
                            </div>
                        </div>
                    </div>

                    {error && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}><span>⚠️</span><div>{error}</div></div>}

                    <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                        {loading
                            ? <><div className="spinner spinner-sm" /> Analysing with ML model…</>
                            : '⊕ Predict Churn Risk'}
                    </button>
                </form>

                {/* ─── Result ─── */}
                {result && <ResultCard result={result} />}
            </div>
        </div>
    );
}
