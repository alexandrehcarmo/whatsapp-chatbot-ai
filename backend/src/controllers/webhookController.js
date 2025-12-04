import conversationService from '../services/conversationService.js';
import logger from '../utils/logger.js';

class WebhookController {
    /**
     * Verifica webhook (para configuração inicial do WhatsApp)
     */
    async verify(req, res) {
        try {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];

            const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                logger.info('✅ Webhook verificado com sucesso');
                return res.status(200).send(challenge);
            }

            logger.warn('⚠️ Falha na verificação do webhook');
            return res.status(403).json({ error: 'Token de verificação inválido' });

        } catch (error) {
            logger.error('❌ Erro na verificação do webhook:', error);
            return res.status(500).json({ error: 'Erro interno' });
        }
    }

    /**
     * Recebe mensagens do WhatsApp
     */
    async receiveMessage(req, res) {
        try {
            // Responder imediatamente para o WhatsApp (200 OK)
            res.status(200).send('OK');

            const body = req.body;
            
            logger.debug('📥 Webhook recebido:', JSON.stringify(body, null, 2));

            // Processar mensagem de forma assíncrona
            this.processWebhookAsync(body);

        } catch (error) {
            logger.error('❌ Erro ao receber webhook:', error);
            // Já respondeu 200, então apenas logar
        }
    }

    /**
     * Processa webhook de forma assíncrona
     */
    async processWebhookAsync(body) {
        try {
            // Estrutura varia por provedor (AiSensy, Twilio, WhatsApp Business API oficial)
            // Aqui está um exemplo genérico - ajustar conforme seu provedor

            // Exemplo para estrutura comum:
            if (!body.messages || body.messages.length === 0) {
                logger.debug('📭 Webhook sem mensagens para processar');
                return;
            }

            for (const message of body.messages) {
                const phoneNumber = message.from || message.phone_number;
                const messageText = message.text?.body || message.body || message.message;
                const messageId = message.id || message.message_id;

                if (!phoneNumber || !messageText) {
                    logger.warn('⚠️ Mensagem incompleta recebida');
                    continue;
                }

                // Ignorar mensagens do próprio bot
                if (message.from_me || message.sender === 'bot') {
                    logger.debug('🤖 Ignorando mensagem do bot');
                    continue;
                }

                logger.info(`📨 Processando mensagem de ${phoneNumber}: "${messageText}"`);

                // Processar mensagem
                await conversationService.processIncomingMessage(
                    phoneNumber,
                    messageText,
                    {
                        message_id: messageId,
                        timestamp: message.timestamp || new Date().toISOString(),
                        type: message.type || 'text'
                    }
                );
            }

        } catch (error) {
            logger.error('❌ Erro ao processar webhook assíncrono:', error);
        }
    }

    /**
     * Endpoint de teste para simular mensagem
     */
    async testMessage(req, res) {
        try {
            const { phone_number, message } = req.body;

            if (!phone_number || !message) {
                return res.status(400).json({ 
                    error: 'phone_number e message são obrigatórios' 
                });
            }

            const result = await conversationService.processIncomingMessage(
                phone_number,
                message
            );

            return res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {
            logger.error('❌ Erro no teste de mensagem:', error);
            return res.status(500).json({ 
                error: 'Erro ao processar mensagem de teste' 
            });
        }
    }
}

export default new WebhookController();