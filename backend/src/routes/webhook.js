import express from 'express';
import webhookController from '../controllers/webhookController.js';

const router = express.Router();

/**
 * GET /webhook - Verificação do webhook (WhatsApp)
 * Usado para validar o webhook durante a configuração
 */
router.get('/', webhookController.verify.bind(webhookController));

/**
 * POST /webhook - Recebe mensagens do WhatsApp
 * Endpoint principal que recebe todas as mensagens
 */
router.post('/', webhookController.receiveMessage.bind(webhookController));

/**
 * POST /webhook/test - Endpoint de teste (apenas desenvolvimento)
 * Permite simular mensagens sem WhatsApp real
 */
if (process.env.NODE_ENV !== 'production') {
    router.post('/test', webhookController.testMessage.bind(webhookController));
}

export default router;