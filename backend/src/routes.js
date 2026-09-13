const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { celebrate, Segments, Joi } = require('celebrate');

const authenticate = require('./middlewares/authenticate');

const OngController = require('./controllers/OngController');
const IncidentController = require('./controllers/IncidentController');
const ProfileController = require('./controllers/ProfileController');
const SessionController = require('./controllers/SessionController');

const routes = express.Router();

// Cada rota tem seu próprio contador, para que cadastros não consumam as tentativas de logon.
const createLimiter = () => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT) || 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many attempts, please try again later.' },
});

routes.post('/sessions', createLimiter(), celebrate({
    [Segments.BODY]: Joi.object().keys({
        id: Joi.string().hex().length(8).required()
    })
}), SessionController.create);

routes.get('/ongs', OngController.index);

routes.post('/ongs', createLimiter(), celebrate({
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().trim().max(255).required(),
        email: Joi.string().required().email().max(255),
        whatsapp: Joi.string().required().pattern(/^\d{10,11}$/),
        city: Joi.string().trim().max(255).required(),
        uf: Joi.string().required().length(2)
    })
}), OngController.create);

routes.get('/profile', authenticate, ProfileController.index);

routes.get('/incidents', celebrate({
    [Segments.QUERY]: Joi.object().keys({
        page: Joi.number().integer().min(1)
    })
}), IncidentController.index);

routes.post('/incidents', authenticate, celebrate({
    [Segments.BODY]: Joi.object().keys({
        title: Joi.string().trim().max(255).required(),
        description: Joi.string().trim().max(2000).required(),
        value: Joi.number().positive().required()
    })
}), IncidentController.create);

routes.delete('/incidents/:id', authenticate, celebrate({
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.number().integer().positive().required()
    })
}), IncidentController.delete);

module.exports = routes;
