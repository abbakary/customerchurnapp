import { NavLink } from 'react-router-dom';

const links = [
    { to: '/', icon: '▦', label: 'Dashboard' },
    { to: '/tracking', icon: '👤', label: 'Tracking' },
    { to: '/predict', icon: '⊕', label: 'Predict' },
    { to: '/batch', icon: '▤', label: 'Batch' },
    { to: '/history', icon: '⊙', label: 'History' },
];

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="nav-brand-section">
                    <NavLink to="/" style={{ textDecoration: 'none' }}>
                        <img
                            src="/favicon.svg"
                            alt="Logo"
                            className="nav-logo-icon"
                        />
                    </NavLink>
                    <div>
                        <div className="nav-logo-title">
                            CUSTOMER-<span style={{ color: '#059669' }}>CHURN</span>
                        </div>
                        <div className="nav-logo-sub">AI-POWERED SYSTEM</div>
                    </div>
                </div>

                <div className="nav-links">
                    {links.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="nav-status" style={{ marginTop: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <span className="status-dot" style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
                    System Active
                </div>
            </div>
        </nav>
    );
}
