require('dotenv').config({ quiet: true });

const MIN_SECRET_LENGTH = 32;

function resolveSecret() {
    const secret = process.env.JWT_SECRET;

    if (secret && secret.length >= MIN_SECRET_LENGTH)
        return secret;

    // Os testes não dependem de um .env, então usam um segredo fixo apenas em memória.
    if (process.env.NODE_ENV === 'test')
        return 'test-secret-that-is-long-enough-for-hs256';

    throw new Error(`JWT_SECRET must be set with at least ${MIN_SECRET_LENGTH} characters.`);
}

function resolveExpiresIn() {
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    // Sem unidade o jsonwebtoken interpreta a string como milissegundos, então tratamos como segundos.
    return /^\d+$/.test(expiresIn) ? Number(expiresIn) : expiresIn;
}

module.exports = {
    secret: resolveSecret(),
    expiresIn: resolveExpiresIn(),
    algorithm: 'HS256',
};
