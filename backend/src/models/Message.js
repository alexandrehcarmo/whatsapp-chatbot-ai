import supabase from '../config/database.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

class MessageModel {
    /**
     * Cria uma nova mensagem
     */
    async create(conversationId, messageData) {
        try {
            const message = {
                id: uuidv4(),
                conversation_id: conversationId,
                sender: messageData.sender, // 'user' ou 'bot'
                text: messageData.text,
                message_type: messageData.type || 'text',
                metadata: messageData.metadata || {},
                intent: messageData.intent || null,
                sentiment: messageData.sentiment || null,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('messages')
                .insert(message)
                .select()
                .single();

            if (error) throw error;

            logger.debug(`💬 Mensagem criada: ${data.id}`);
            return data;

        } catch (error) {
            logger.error('❌ Erro ao criar mensagem:', error);
            throw error;
        }
    }

    /**
     * Busca mensagens de uma conversa
     */
    async findByConversation(conversationId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;

            return data;

        } catch (error) {
            logger.error('❌ Erro ao buscar mensagens:', error);
            throw error;
        }
    }

    /**
     * Busca últimas N mensagens para contexto
     */
    async getRecentForContext(conversationId, limit = 10) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('sender, text, intent, created_at')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Retornar em ordem cronológica
            return data.reverse();

        } catch (error) {
            logger.error('❌ Erro ao buscar contexto:', error);
            throw error;
        }
    }

    /**
     * Atualiza mensagem
     */
    async update(messageId, updates) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .update(updates)
                .eq('id', messageId)
                .select()
                .single();

            if (error) throw error;

            return data;

        } catch (error) {
            logger.error('❌ Erro ao atualizar mensagem:', error);
            throw error;
        }
    }

    /**
     * Busca estatísticas de mensagens
     */
    async getStats(conversationId) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('sender, intent, sentiment')
                .eq('conversation_id', conversationId);

            if (error) throw error;

            const stats = {
                total: data.length,
                byUser: data.filter(m => m.sender === 'user').length,
                byBot: data.filter(m => m.sender === 'bot').length,
                intents: this.countByField(data, 'intent'),
                sentiments: this.countByField(data, 'sentiment')
            };

            return stats;

        } catch (error) {
            logger.error('❌ Erro ao calcular estatísticas:', error);
            throw error;
        }
    }

    /**
     * Conta ocorrências de um campo
     */
    countByField(data, field) {
        return data.reduce((acc, item) => {
            const value = item[field] || 'unknown';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }
}

export default new MessageModel();