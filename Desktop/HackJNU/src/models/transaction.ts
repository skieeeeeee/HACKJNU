export type TransactionStatus = 'PENDING' | 'RECEIVED' | 'SETTLED';

export interface Transaction {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: number;
  hash: string;
  status: TransactionStatus;
}
