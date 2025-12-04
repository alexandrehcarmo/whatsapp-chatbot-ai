import ConversationModel from '../models/Conversation.js';
import MessageModel from '../models/Message.js';
import FAQModel from '../models/FAQ.js';
import aiService from './aiService.js';
import whatsappService from './whatsappService.js';
import logger from '../utils/logger.js';

class ConversationService {
    /**
     * Processa mensagem recebida do usuário
     */
    async processIncomingMessage(phoneNumber, messageText, messageMetadata = {}) {
        try {
            logger.info(`📥 Processando mensagem de ${phoneNumber}`);

            // 1. Buscar ou criar conversa
            const conversation = await ConversationModel.findOrCreate(phoneNumber, {
                source: 'whatsapp',
                ...messageMetadata
            });

            // 2. Salvar mensagem do usuário
            const userMessage = await MessageModel.create(conversation.id, {
                sender: 'user',
                text: messageText,
                type: 'text',
                metadata: messageMetadata
            });

            // 3. Verificar se conversa está transferida para humano
            if (conversation.status === 'transferred') {
                logger.info(`🔄 Conversa ${conversation.id} está com atendente humano`);
                
                // Apenas salvar mensagem, não responder automaticamente
                return {
                    conversation,
                    userMessage,
                    botResponse: null,
                    transferred: true
                };
            }

            // 4. Buscar contexto (últimas mensagens)
            const previousMessages = await MessageModel.getRecentForContext(conversation.id, 10);

            // 5. Verificar FAQ primeiro (resposta rápida)
            const faqMatch = await FAQModel.searchByKeywords(messageText);
            
            let botResponseText;
            let intent = 'general';
            let requiresHuman = false;

            if (faqMatch && faqMatch.length > 0 && faqMatch[0].score > 15) {
                // FAQ encontrada com alta relevância
                botResponseText = faqMatch[0].answer;
                intent = 'faq';
                await FAQModel.incrementUsage(faqMatch[0].id);
                
                logger.info(`✅ FAQ matched: ${faqMatch[0].id}`);
            } else {
                // 6. Gerar resposta com IA
                const aiResponse = await aiService.generateResponse(
                    messageText,
                    conversation.id,
                    previousMessages
                );

                botResponseText = aiResponse.text;
                intent = aiResponse.intent;
                requiresHuman = aiResponse.requiresHuman;
            }

            // 7. Salvar resposta do bot
            const botMessage = await MessageModel.create(conversation.id, {
                sender: 'bot',
                text: botResponseText,
                type: 'text',
                intent: intent,
                metadata: { requiresHuman }
            });

            // 8. Enviar resposta via WhatsApp
            await whatsappService.sendTextMessage(phoneNumber, botResponseText);

            // 9. Transferir para humano se necessário
            if (requiresHuman) {
                await ConversationModel.transferToHuman(conversation.id);
                
                // Enviar notificação adicional
                const transferMessage = "🔄 Transferindo você para um atendente humano. Aguarde um momento...";
                await whatsappService.sendTextMessage(phoneNumber, transferMessage);
                
                logger.info(`🔄 Conversa ${conversation.id} transferida para humano`);
            }

            return {
                conversation,
                userMessage,
                botMessage,
                transferred: requiresHuman
            };

        } catch (error) {
            logger.error('❌ Erro ao processar mensagem:', error);
            
            // Enviar mensagem de erro genérica
            try {
                await whatsappService.sendTextMessage(
                    phoneNumber,
                    'Desculpe, estou com dificuldades técnicas. Por favor, tente novamente em alguns instantes.'
                );
            } catch (sendError) {
                logger.error('❌ Erro ao enviar mensagem de erro:', sendError);
            }

            throw error;
        }
    }

    /**
     * Busca histórico completo de uma conversa
     */
    async getConversationHistory(conversationId) {
        try {
            const conversation = await ConversationModel.findById(conversationId);
            const messages = await MessageModel.findByConversation(conversationId);
            const stats = await MessageModel.getStats(conversationId);

            return {
                conversation,
                messages,
                stats
            };

        } catch (error) {
            logger.error('❌ Erro ao buscar histórico:', error);
            throw error;
        }
    }

    /**
     * Lista conversas com filtros
     */
    async listConversations(filters = {}, page = 1, limit = 20) {
        try {
            return await ConversationModel.list(page, limit, filters);

        } catch (error) {
            logger.error('❌ Erro ao listar conversas:', error);
            throw error;
        }
    }

    /**
     * Transfere conversa manualmente
     */
    async transferConversation(conversationId, agentId = null) {
        try {
            const conversation = await ConversationModel.transferToHuman(conversationId, agentId);
            
            // Notificar cliente
            const phoneNumber = conversation.phone_number;
            await whatsappService.sendTextMessage(
                phoneNumber,
                "🔄 Sua conversa foi transferida para um atendente especializado. Em breve você será atendido!"
            );

            return conversation;

        } catch (error) {
            logger.error('❌ Erro ao transferir conversa:', error);
            throw error;
        }
    }

    /**
     * Encerra conversa
     */
    async closeConversation(conversationId, reason = null) {
        try {
            return await ConversationModel.close(conversationId, reason);

        } catch (error) {
            logger.error('❌ Erro ao encerrar conversa:', error);
            throw error;
        }
    }
}

export default new ConversationService();