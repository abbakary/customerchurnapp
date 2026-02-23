interface Result {
    id: number;
    customer_id: string;
    is_churn: boolean;
    churn_probability: number;
    churn_probability_pct: number;
    risk_level: string;
    risk_factors: string[];
    recommendations: string[];
    created_at: string;
}

const RISK_CFG: Record<string, { color: string; label: string }> = {
    Low: { color: 'var(--green)', label: '🟢' },
    Medium: { color: 'var(--yellow)', label: '🟡' },
    High: { color: 'var(--orange)', label: '🟠' },
    Critical: { color: 'var(--red)', label: '🔴' },
};

export default function ResultCard({ result }: { result: Result }) {
    const cfg = RISK_CFG[result.risk_level] ?? RISK_CFG.Low;
    const pct = result.churn_probability_pct;
    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
        <div className="anim-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Verdict banner */}
            <div className={`result-verdict ${result.is_churn ? 'verdict-churn' : 'verdict-retain'}`}>
                <div className="verdict-icon">{result.is_churn ? '⚠️' : '✅'}</div>
                <div className="verdict-title" style={{ color: result.is_churn ? 'var(--red)' : 'var(--green)' }}>
                    {result.is_churn ? 'CHURN RISK DETECTED' : 'CUSTOMER RETAINED'}
                </div>
                {result.customer_id && (
                    <div className="verdict-id">
                        <span style={{ color: 'var(--text-3)' }}>Customer: </span>
                        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{result.customer_id}</span>
                    </div>
                )}
            </div>

            {/* Probability gauge + meta */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* SVG gauge */}
                <div className="gauge-wrap" style={{ flexShrink: 0 }}>
                    <div style={{ position: 'relative', width: 130, height: 130 }}>
                        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(56,100,200,0.15)" strokeWidth="10" />
                            <circle
                                cx="65" cy="65" r={r} fill="none"
                                stroke={cfg.color}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={circ}
                                strokeDashoffset={offset}
                                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 8px ${cfg.color})` }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: cfg.color, lineHeight: 1 }}>
                                {pct.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Churn Prob.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: risk details */}
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <span className={`badge badge-${result.risk_level.toLowerCase()}`} style={{ fontSize: '0.78rem', padding: '4px 12px' }}>
                            {cfg.label} {result.risk_level} Risk
                        </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                        <div><span style={{ color: 'var(--text-3)' }}>Prediction ID:</span> <strong style={{ color: 'var(--text-1)' }}>#{result.id}</strong></div>
                        <div><span style={{ color: 'var(--text-3)' }}>Recorded:</span> {new Date(result.created_at).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Risk Factors */}
            <div className="card">
                <div className="risk-list-title">
                    🔍 Risk Factors Detected
                </div>
                <div className="risk-section">
                    {result.risk_factors.map((f, i) => (
                        <div key={i} className="risk-item" style={{ borderLeftColor: cfg.color }}>
                            <span className="risk-item-dot" style={{ color: cfg.color }}>▶</span>
                            {f}
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <div className="card">
                <div className="risk-list-title" style={{ color: 'var(--text-2)' }}>
                    💡 Retention Recommendations
                </div>
                <div className="risk-section">
                    {result.recommendations.map((rec, i) => (
                        <div key={i} className="risk-item" style={{ borderLeftColor: 'var(--green)', background: 'rgba(16,185,129,0.05)' }}>
                            <span className="risk-item-dot" style={{ color: 'var(--green)' }}>✓</span>
                            {rec}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
