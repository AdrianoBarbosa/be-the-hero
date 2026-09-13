const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

// Parâmetros recomendados pela OWASP para scrypt. Nos testes o custo é menor para a suíte não ficar lenta.
const DEFAULT_COST = process.env.NODE_ENV === 'test'
    ? { N: 2 ** 10, r: 8, p: 1 }
    : { N: 2 ** 16, r: 8, p: 2 };

function derive(password, salt, { N, r, p }) {
    return scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { N, r, p, maxmem: 256 * N * r });
}

// Formato armazenado: scrypt$N$r$p$salt$hash, para permitir mudar o custo sem invalidar hashes antigos.
async function hashPassword(password, cost = DEFAULT_COST) {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = await derive(password, salt, cost);

    return ['scrypt', cost.N, cost.r, cost.p, salt.toString('base64'), key.toString('base64')].join('$');
}

async function verifyPassword(password, stored) {
    const [algorithm, N, r, p, salt, hash] = String(stored).split('$');
    const cost = { N: Number(N), r: Number(r), p: Number(p) };

    if (algorithm !== 'scrypt' || !salt || !hash || !Object.values(cost).every(Number.isInteger))
        return false;

    const expected = Buffer.from(hash, 'base64');
    const key = await derive(password, Buffer.from(salt, 'base64'), cost);

    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

module.exports = { hashPassword, verifyPassword, DEFAULT_COST };
