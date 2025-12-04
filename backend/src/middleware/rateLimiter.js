import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * Rate Limiter para proteger a API contra abuso
 */
const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por minuto
    message: {
        success: false,
        error: 'Muitas requisições. Por favor, tente novamente mais tarde.'
    },
    standardHeaders: true, // Retorna info de rate limit nos headers
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`⚠️ Rate limit excedido para IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            error: 'Muitas requisições. Por favor, tente novamente mais tarde.'
        });
    },
    skip: (req) => {
        // Não aplicar rate limit em ambiente de teste
        return process.env.NODE_ENV === 'test';
    }
});

export default rateLimiter;