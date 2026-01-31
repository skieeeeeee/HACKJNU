import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { storageService } from '../services/storageService';
import { cryptoService } from '../services/cryptoService';
import type { Transaction } from '../models/transaction';

interface SendPaymentProps {
    onBack: () => void;
    onSuccess: (tx: Transaction) => void;
}

const SendPayment: React.FC<SendPaymentProps> = ({ onBack, onSuccess }) => {
    const [receiver, setReceiver] = useState('');
    const [amount, setAmount] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!receiver || !amount) {
            alert('Please fill all fields');
            return;
        }

        setIsGenerating(true);

        const txData = {
            id: uuidv4(),
            sender: 'Demo User', // Hardcoded for demo
            receiver,
            amount: parseFloat(amount),
            timestamp: Date.now(),
            status: 'PENDING' as const
        };

        const hash = cryptoService.generateHash(txData);
        const tx: Transaction = { ...txData, hash };

        await storageService.saveTransaction(tx);
        onSuccess(tx);
    };

    return (
        <div className="send-payment-screen">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0 }}>Send Payment</h2>
            </div>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#4f46e5' }}>
                    <CreditCard size={20} />
                    <span style={{ fontWeight: '600' }}>Transaction Details</span>
                </div>

                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748b' }}>Receiver Name</label>
                <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                />

                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748b' }}>Amount (₹)</label>
                <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    style={{ marginTop: '16px' }}
                >
                    {isGenerating ? 'Generating...' : 'Generate Offline QR'}
                </button>
            </div>

            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '16px' }}>
                🔐 This transaction will be secured with SHA-256 hashing and stored locally until synced.
            </div>
        </div>
    );
};

export default SendPayment;
