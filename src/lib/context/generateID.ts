import { randomBytes } from 'crypto';

export default function generateId(length: number): string {
    const bytes = Math.ceil(length / 2);
    return randomBytes(bytes).toString('hex').slice(0, length);
}
