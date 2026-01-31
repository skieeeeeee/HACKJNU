import CryptoJS from 'crypto-js';

export const cryptoService = {
    generateHash(data: object): string {
        const dataString = JSON.stringify(data);
        return CryptoJS.SHA256(dataString).toString();
    },

    verifyHash(data: object, hash: string): boolean {
        const generated = this.generateHash(data);
        return generated === hash;
    }
};
