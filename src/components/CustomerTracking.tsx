import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { API_URL } from '../config';

const API = API_URL;

interface Customer {
    customer_id: string;
    is_churn: boolean;
    churn_probability: number;
    risk_level: string;
    last_prediction_date: string;
    total_predictions: number;
}

export default function CustomerTracking() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [churnCount, setChurnCount] = useState(0);
    const [safeCount, setSafeCount] = useState(0);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'churn' | 'safe'>('all');

    const fetchCustomers = (pageNum: number, isInitial = false, searchStr = '', statusStr = 'all') => {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        const url = `${API}/customers/?page=${pageNum}&limit=50` +
            `${searchStr ? `&search=${encodeURIComponent(searchStr)}` : ''}` +
            `${statusStr !== 'all' ? `&status=${statusStr}` : ''}`;

        axios.get(url)
            .then(r => {
                const { results, pagination } = r.data;
                if (pageNum === 1) {
                    setCustomers(results);
                } else {
                    setCustomers(prev => [...prev, ...results]);
                }
                setHasMore(pagination.has_more);
                setTotalCount(pagination.total_records);
                setChurnCount(pagination.churn_count);
                setSafeCount(pagination.safe_count);
                setLoading(false);
                setLoadingMore(false);
            })
            .catch(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    };

    // Initial load and polling
    useEffect(() => {
        // Initial fetch handled by search/tab listeners
        const interval = setInterval(() => {
            if (page === 1 && !search && activeTab === 'all') {
                fetchCustomers(1, false, '', 'all');
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Handle search or tab change with debounce/reset
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchCustomers(1, true, search, activeTab);
        }, 500);

        return () => clearTimeout(timer);
    }, [search, activeTab]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCustomers(nextPage, false, search, activeTab);
    };

    const filtered = customers; // Already filtered by server

    return (
        <div className="container anim-fade-up">
            <div className="page-hero">
                <h1>Customer <span style={{ color: 'var(--green)' }}>Tracking</span></h1>
                <p>Monitor customer progress and identify churn risks in real-time.</p>
            </div>

            <div className="control-group">
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All ({totalCount})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'churn' ? 'active' : ''}`}
                        onClick={() => setActiveTab('churn')}
                    >
                        Likely to Churn ({churnCount})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'safe' ? 'active' : ''}`}
                        onClick={() => setActiveTab('safe')}
                    >
                        Healthy ({safeCount})
                    </button>
                </div>

                <div className="search-box" style={{ flex: 1, maxWidth: '400px', margin: 0 }}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                        placeholder="Search by Customer ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="spinner" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card glass-card">
                    <div className="empty-state">
                        <div className="empty-state-icon">👤</div>
                        <h3>No customers found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="table-wrap glass">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer ID</th>
                                    <th>Status</th>
                                    <th>Risk Level</th>
                                    <th>Churn Prob.</th>
                                    <th>Predictions</th>
                                    <th>Last Updated</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.customer_id}>
                                        <td>
                                            <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>{c.customer_id}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${c.is_churn ? 'badge-churn' : 'badge-safe'}`}>
                                                {c.is_churn ? '⚠ Churn' : '✓ Safe'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${c.risk_level.toLowerCase()}`}>{c.risk_level}</span>
                                        </td>
                                        <td>
                                            <div className="prob-bar-wrap">
                                                <div className="prob-bar-track" style={{ width: 80 }}>
                                                    <div className="prob-bar-fill" style={{
                                                        width: `${c.churn_probability * 100}%`,
                                                        background: c.is_churn ? 'var(--red)' : 'var(--green)'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {(c.churn_probability * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>{c.total_predictions}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
                                            {new Date(c.last_prediction_date).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Link to={`/customer/${c.customer_id}`} className="btn btn-outline btn-sm">
                                                View Progress
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && !search && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-3)' }}>
                                Showing {customers.length} of {totalCount} customers
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                style={{ minWidth: '200px' }}
                            >
                                {loadingMore ? <div className="spinner spinner-sm" /> : 'Load More Customers'}
                            </button>
                        </div>
                    )}

                    {loadingMore && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <div className="spinner spinner-sm" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
