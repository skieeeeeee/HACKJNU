import Dexie, { type Table } from 'dexie';
import type { Transaction } from '../models/transaction';

export class AppDatabase extends Dexie {
    transactions!: Table<Transaction>;

    constructor() {
        super('OfflineUPIDB');
        this.version(1).stores({
            transactions: 'id, sender, receiver, status, timestamp'
        });
    }
}

export const db = new AppDatabase();

export const storageService = {
    async saveTransaction(tx: Transaction): Promise<string> {
        return await db.transactions.add(tx);
    },

    async getAllTransactions(): Promise<Transaction[]> {
        return await db.transactions.orderBy('timestamp').reverse().toArray();
    },

    async getPendingTransactions(): Promise<Transaction[]> {
        return await db.transactions.where('status').notEqual('SETTLED').toArray();
    },

    async updateTransactionStatus(id: string, status: Transaction['status']): Promise<number> {
        return await db.transactions.update(id, { status });
    },

    async getTransaction(id: string): Promise<Transaction | undefined> {
        return await db.transactions.get(id);
    }
};
