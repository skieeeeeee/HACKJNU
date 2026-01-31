import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { Transaction } from '../models/transaction';

interface TransactionHistoryProps {
    onBack: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onBack }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        const data = await storageService.getAllTransactions();
        setTransactions(data);
    };

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    };

    const getStatusClass = (status: Transaction['status']) => {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'RECEIVED': return 'status-received';
            case 'SETTLED': return 'status-settled';
        }
    };

    return (
        <div className="history-screen">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0 }}>History</h2>
            </div>

            {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <Clock size={48} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No transactions yet</p>
                </div>
            ) : (
                <div className="transaction-list">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: tx.status === 'RECEIVED' ? '#dcfce7' : '#f1f5f9',
                                        color: tx.status === 'RECEIVED' ? '#10b981' : '#4f46e5'
                                    }}>
                                        {tx.status === 'RECEIVED' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700' }}>{tx.status === 'RECEIVED' ? tx.sender : tx.receiver}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(tx.timestamp)}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '800', fontSize: '18px', color: tx.status === 'RECEIVED' ? '#10b981' : '#1e293b' }}>
                                        {tx.status === 'RECEIVED' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                    </div>
                                    <span className={`status-badge ${getStatusClass(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
