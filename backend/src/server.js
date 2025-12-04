import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';
import webhookRoutes from './routes/webhook.js';
import apiRoutes from './routes/api.js';
import faqRoutes from './routes/faq.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-dashboard-domain.vercel.app']
        : ['http://localhost:5173'],
    credentials: true
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
app.use('/api/', rateLimiter);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api', apiRoutes);
app.use('/api/faq', faqRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Error Handler (must be last)
app.use(errorHandler);

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM recebido, encerrando servidor gracefully...');
    server.close(() => {
        logger.info('Servidor encerrado');
        process.exit(0);
    });
});

// Start Server
server.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`📱 Ambiente: ${process.env.NODE_ENV}`);
    logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
});

export default app;