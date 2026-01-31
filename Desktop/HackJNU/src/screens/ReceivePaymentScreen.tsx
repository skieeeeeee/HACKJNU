import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, Camera, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { Transaction } from '../models/transaction';

interface ReceivePaymentProps {
    onBack: () => void;
    onSuccess: () => void;
}

const ReceivePayment: React.FC<ReceivePaymentProps> = ({ onBack, onSuccess }) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [receivedTx, setReceivedTx] = useState<Transaction | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        async function onScanSuccess(decodedText: string) {
            try {
                const tx: Transaction = JSON.parse(decodedText);
                // Change status to RECEIVED as we are the recipient
                tx.status = 'RECEIVED';

                await storageService.saveTransaction(tx);
                setReceivedTx(tx);
                setIsSuccess(true);
                scanner.clear();
            } catch (err) {
                console.error('Invalid QR Data', err);
            }
        }

        function onScanFailure() {
            // Ignore scan failures
        }

        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
    }, []);

    if (isSuccess && receivedTx) {
        return (
            <div className="receive-success" style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ color: '#10b981', marginBottom: '24px' }}>
                    <CheckCircle size={80} strokeWidth={1.5} />
                </div>
                <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Payment Received</h2>
                <p style={{ color: '#64748b', marginBottom: '32px' }}>
                    You received <strong>₹{receivedTx.amount.toFixed(2)}</strong> from {receivedTx.sender}
                </p>
                <button className="btn btn-primary" onClick={onSuccess}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="receive-payment-screen">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0 }}>Scan QR Code</h2>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div id="reader" style={{ width: '100%' }}></div>
            </div>

            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                <Camera size={24} style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>Position the QR code within the frame to receive payment offline.</p>
            </div>
        </div>
    );
};

export default ReceivePayment;
