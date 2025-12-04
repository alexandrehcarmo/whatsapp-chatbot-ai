import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir nível de log baseado no ambiente
const logLevel = process.env.LOG_LEVEL || 'info';

// Formato customizado para logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        // Adicionar metadados se existirem
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        // Adicionar stack trace se for erro
        if (stack) {
            log += `\n${stack}`;
        }
        
        return log;
    })
);

// Configuração de transports (onde os logs serão salvos)
const transports = [
    // Console (sempre ativo)
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logFormat
        )
    })
];

// Em produção, salvar logs em arquivos
if (process.env.NODE_ENV === 'production') {
    transports.push(
        // Arquivo de erros
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: logFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Arquivo de logs gerais
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            format: logFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
}

// Criar logger
const logger = winston.createLogger({
    level: logLevel,
    format: logFormat,
    transports,
    // Não sair do processo em caso de erro no logger
    exitOnError: false
});

// Adicionar método helper para logs estruturados
logger.logRequest = (req, message = 'Request received') => {
    logger.info(message, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
};

logger.logResponse = (req, res, message = 'Response sent') => {
    logger.info(message, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: res.get('X-Response-Time')
    });
};

export default logger;