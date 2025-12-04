import logger from '../utils/logger.js';

/**
 * Middleware global de tratamento de erros
 * Deve ser o último middleware registrado
 */
function errorHandler(err, req, res, next) {
    // Log detalhado do erro
    logger.error('❌ Erro capturado pelo errorHandler:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Determinar código de status
    const statusCode = err.statusCode || err.status || 500;

    // Determinar mensagem de erro
    let errorMessage = 'Erro interno do servidor';
    
    if (process.env.NODE_ENV === 'development') {
        errorMessage = err.message;
    } else if (statusCode < 500) {
        // Erros 4xx podem expor mensagem ao cliente
        errorMessage = err.message;
    }

    // Resposta padronizada de erro
    res.status(statusCode).json({
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
}

export default errorHandler;