import Joi from 'joi';
import logger from '../utils/logger.js';

/**
 * Middleware factory para validação de schemas
 */
function validate(schema, property = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Retorna todos os erros, não apenas o primeiro
            stripUnknown: true // Remove campos não definidos no schema
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            logger.warn('⚠️ Validação falhou:', errors);

            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: errors
            });
        }

        // Substituir req[property] pelos valores validados e sanitizados
        req[property] = value;
        next();
    };
}

/**
 * Schemas de validação comuns
 */
const schemas = {
    // Validação de FAQ
    createFAQ: Joi.object({
        question: Joi.string().min(10).max(500).required(),
        answer: Joi.string().min(10).max(2000).required(),
        keywords: Joi.array().items(Joi.string()).default([]),
        category: Joi.string().max(50).default('general'),
        priority: Joi.number().integer().min(0).max(100).default(0),
        is_active: Joi.boolean().default(true)
    }),

    updateFAQ: Joi.object({
        question: Joi.string().min(10).max(500),
        answer: Joi.string().min(10).max(2000),
        keywords: Joi.array().items(Joi.string()),
        category: Joi.string().max(50),
        priority: Joi.number().integer().min(0).max(100),
        is_active: Joi.boolean()
    }).min(1), // Pelo menos um campo deve ser fornecido

    // Validação de mensagem de teste
    testMessage: Joi.object({
        phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
        message: Joi.string().min(1).max(4096).required()
    }),

    // Validação de transferência
    transferConversation: Joi.object({
        agent_id: Joi.string().uuid().optional()
    }),

    // Validação de encerramento
    closeConversation: Joi.object({
        reason: Joi.string().max(200).optional()
    })
};

export { validate, schemas };