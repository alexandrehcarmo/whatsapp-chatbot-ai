import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

/**
 * GET /api/conversations - Lista todas as conversas
 * Query params: page, limit, status, assigned_to
 */
router.get('/conversations', messageController.listConversations.bind(messageController));

/**
 * GET /api/conversations/:conversationId - Busca conversa específica
 * Retorna histórico completo de mensagens
 */
router.get('/conversations/:conversationId', messageController.getConversation.bind(messageController));

/**
 * POST /api/conversations/:conversationId/transfer - Transfere para humano
 * Body: { agent_id: "opcional" }
 */
router.post('/conversations/:conversationId/transfer', messageController.transferConversation.bind(messageController));

/**
 * POST /api/conversations/:conversationId/close - Encerra conversa
 * Body: { reason: "opcional" }
 */
router.post('/conversations/:conversationId/close', messageController.closeConversation.bind(messageController));

export default router;