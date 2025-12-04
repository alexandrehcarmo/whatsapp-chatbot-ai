import conversationService from '../services/conversationService.js';
import logger from '../utils/logger.js';

class MessageController {
    /**
     * Lista conversas
     */
    async listConversations(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const filters = {
                status: req.query.status,
                assigned_to: req.query.assigned_to
            };

            const result = await conversationService.listConversations(filters, page, limit);

            return res.status(200).json({
                success: true,
                ...result
            });

        } catch (error) {
            logger.error('❌ Erro ao listar conversas:', error);
            return res.status(500).json({ 
                error: 'Erro ao listar conversas' 
            });
        }
    }

    /**
     * Busca histórico de uma conversa
     */
    async getConversation(req, res) {
        try {
            const { conversationId } = req.params;

            const result = await conversationService.getConversationHistory(conversationId);

            return res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {
            logger.error('❌ Erro ao buscar conversa:', error);
            return res.status(500).json({ 
                error: 'Erro ao buscar conversa' 
            });
        }
    }

    /**
     * Transfere conversa para humano
     */
    async transferConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const { agent_id } = req.body;

            const conversation = await conversationService.transferConversation(
                conversationId,
                agent_id
            );

            return res.status(200).json({
                success: true,
                data: conversation
            });

        } catch (error) {
            logger.error('❌ Erro ao transferir conversa:', error);
            return res.status(500).json({ 
                error: 'Erro ao transferir conversa' 
            });
        }
    }

    /**
     * Encerra conversa
     */
    async closeConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const { reason } = req.body;

            const conversation = await conversationService.closeConversation(
                conversationId,
                reason
            );

            return res.status(200).json({
                success: true,
                data: conversation
            });

        } catch (error) {
            logger.error('❌ Erro ao encerrar conversa:', error);
            return res.status(500).json({ 
                error: 'Erro ao encerrar conversa' 
            });
        }
    }
}

export default new MessageController();