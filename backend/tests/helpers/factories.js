const request = require('supertest');
const jwt = require('jsonwebtoken');
const generateUniqueId = require('../../src/utils/generateUniqueId');

const app = require('../../src/app');
const connection = require('../../src/database/connection');
const authConfig = require('../../src/config/auth');
const { hashPassword } = require('../../src/utils/password');

const PASSWORD = 'senha-forte-123';

const ongData = (overrides = {}) => ({
    name: 'APAE',
    email: 'contato@apae.org',
    whatsapp: '19900000000',
    city: 'Limeira',
    uf: 'SP',
    ...overrides,
});

async function createOng(overrides, password = PASSWORD) {
    const data = ongData(overrides);
    const id = generateUniqueId();

    await connection('ongs').insert({ id, ...data, password_hash: await hashPassword(password) });

    return { id, password, ...data };
}

function tokenFor(ongId, options = {}) {
    return jwt.sign({}, authConfig.secret, {
        subject: ongId,
        expiresIn: '1h',
        algorithm: authConfig.algorithm,
        ...options,
    });
}

async function createIncident(ongId, overrides = {}) {
    const data = {
        title: 'Cadelinha atropelada',
        description: 'Precisa de cirurgia urgente',
        value: 120,
        ...overrides,
    };

    const [id] = await connection('incidents').insert({ ...data, ong_id: ongId });

    return { id, ...data };
}

async function resetDatabase() {
    await connection.migrate.rollback(undefined, true);
    await connection.migrate.latest();
}

module.exports = {
    app,
    request,
    connection,
    PASSWORD,
    ongData,
    createOng,
    createIncident,
    tokenFor,
    resetDatabase,
};
