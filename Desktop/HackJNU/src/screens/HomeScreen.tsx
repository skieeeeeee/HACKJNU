import React from 'react';
import { Send, Download, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HomeProps {
    onNavigate: (screen: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    const isOnline = useOnlineStatus();

    const menuItems = [
        { id: 'send', label: 'Send Offline Payment', icon: <Send size={24} />, color: 'bg-indigo-500' },
        { id: 'receive', label: 'Receive Payment', icon: <Download size={24} />, color: 'bg-emerald-500' },
        { id: 'pending', label: 'Transaction History', icon: <Clock size={24} />, color: 'bg-amber-500' },
    ];

    return (
        <div className="home-screen">
            <header className="header">
                <h1>Offline UPI</h1>
                <div className="connectivity-indicator">
                    <div className={`indicator-dot ${isOnline ? 'indicator-online' : 'indicator-offline'}`} />
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                    {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                </div>
            </header>

            <div className="menu-grid" style={{ display: 'grid', gap: '16px' }}>
                {menuItems.map((item) => (
                    <div key={item.id} className="card" onClick={() => onNavigate(item.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#4f46e5' }}>
                            {item.icon}
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '18px' }}>{item.label}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Secure offline transfer</div>
                        </div>
                    </div>
                ))}

                <button
                    className="btn btn-primary"
                    onClick={() => onNavigate('sync')}
                    disabled={!isOnline}
                    style={{ marginTop: '12px', opacity: isOnline ? 1 : 0.6 }}
                >
                    <RefreshCw size={20} className={isOnline ? 'animate-spin' : ''} />
                    Sync Transactions
                </button>
                {!isOnline && (
                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
                        Internet required for cloud sync
                    </p>
                )}
            </div>
        </div>
    );
};

export default Home;
