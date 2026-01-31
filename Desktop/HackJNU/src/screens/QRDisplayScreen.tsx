import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Bluetooth } from 'lucide-react';
import type { Transaction } from '../models/transaction';

interface QRDisplayProps {
    transaction: Transaction;
    onDone: () => void;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ transaction, onDone }) => {
    const qrData = JSON.stringify(transaction);

    return (
        <div className="qr-display-screen">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <h2 style={{ margin: 0 }}>Scan to Pay</h2>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
                <div style={{ border: '16px solid white', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                    <QRCodeSVG
                        value={qrData}
                        size={250}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>₹{transaction.amount.toFixed(2)}</div>
                    <div style={{ color: '#64748b' }}>Paying {transaction.receiver}</div>
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => alert('Simulating Bluetooth transfer...')}>
                        <Bluetooth size={20} />
                        Send via Bluetooth
                    </button>
                    <button className="btn btn-primary" onClick={onDone}>
                        <CheckCircle size={20} />
                        Done
                    </button>
                </div>
            </div>

            <div className="card" style={{ backgroundColor: '#f1f5f9', border: 'none' }}>
                <div style={{ fontSize: '12px', wordBreak: 'break-all', fontFamily: 'monospace', color: '#475569' }}>
                    <strong>TX HASH:</strong> {transaction.hash}
                </div>
            </div>
        </div>
    );
};

export default QRDisplay;
