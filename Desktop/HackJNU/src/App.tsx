import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import SendPaymentScreen from './screens/SendPaymentScreen'
import QRDisplayScreen from './screens/QRDisplayScreen'
import ReceivePaymentScreen from './screens/ReceivePaymentScreen'
import TransactionHistoryScreen from './screens/TransactionHistoryScreen'
import type { Transaction } from './models/transaction'
import { syncService } from './services/syncService'
import './index.css'

type Screen = 'home' | 'send' | 'qr' | 'receive' | 'pending' | 'sync';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const navigate = (screen: string) => {
    if (screen === 'sync') {
      handleSync();
      return;
    }
    setCurrentScreen(screen as Screen);
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const result = await syncService.syncAll();
    setIsSyncing(false);

    if (result.success > 0) {
      alert(`✅ Successfully synced ${result.success} transactions!`);
    } else {
      alert('ℹ️ No pending transactions to sync.');
    }
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={navigate} />;

      case 'send':
        return (
          <SendPaymentScreen
            onBack={() => setCurrentScreen('home')}
            onSuccess={(tx) => {
              setActiveTx(tx);
              setCurrentScreen('qr');
            }}
          />
        );

      case 'qr':
        return activeTx ? (
          <QRDisplayScreen
            transaction={activeTx}
            onDone={() => setCurrentScreen('home')}
          />
        ) : null;

      case 'receive':
        return (
          <ReceivePaymentScreen
            onBack={() => setCurrentScreen('home')}
            onSuccess={() => setCurrentScreen('home')}
          />
        );

      case 'pending':
        return <TransactionHistoryScreen onBack={() => setCurrentScreen('home')} />;

      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}

      {isSyncing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="animate-spin" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #4f46e5',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            marginBottom: '16px'
          }}></div>
          <p style={{ fontWeight: '600', color: '#4f46e5' }}>Syncing with Cloud...</p>
        </div>
      )}
    </div>
  )
}

export default App
