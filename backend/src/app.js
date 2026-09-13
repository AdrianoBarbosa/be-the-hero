const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');
const routes = require('./routes');

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : '*';

app.disable('x-powered-by');

// Atrás de um proxy reverso o rate limit precisa do IP real do cliente (ex.: TRUST_PROXY=1).
if (process.env.TRUST_PROXY)
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    exposedHeaders: ['X-Total-Count'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(routes);
app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, request, response, next) => {
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')
        return response.status(err.status).json({ error: 'Invalid request body.' });

    console.error(err);

    return response.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
