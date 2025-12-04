import supabase from '../config/database.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

class ConversationModel {
    /**
     * Cria uma nova conversa
     */
    async create(phoneNumber, metadata = {}) {
        try {
            const conversationData = {
                id: uuidv4(),
                phone_number: phoneNumber,
                status: 'active',
                assigned_to: null,
                metadata: metadata,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('conversations')
                .insert(conversationData)
                .select()
                .single();

            if (error) throw error;

            logger.info(`✅ Conversa criada: ${data.id}`);
            return data;

        } catch (error) {
            logger.error('❌ Erro ao criar conversa:', error);
            throw error;
        }
    }

    /**
     * Busca conversa por número de telefone
     */
    async findByPhoneNumber(phoneNumber) {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('phone_number', phoneNumber)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

            return data || null;

        } catch (error) {
            logger.error('❌ Erro ao buscar conversa:', error);
            throw error;
        }
    }

    /**
     * Busca ou cria conversa
     */
    async findOrCreate(phoneNumber, metadata = {}) {
        try {
            let conversation = await this.findByPhoneNumber(phoneNumber);

            if (!conversation) {
                conversation = await this.create(phoneNumber, metadata);
            } else {
                // Atualizar timestamp de última atividade
                await this.update(conversation.id, { 
                    updated_at: new Date().toISOString() 
                });
            }

            return conversation;

        } catch (error) {
            logger.error('❌ Erro em findOrCreate:', error);
            throw error;
        }
    }

    /**
     * Atualiza conversa
     */
    async update(conversationId, updates) {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', conversationId)
                .select()
                .single();

            if (error) throw error;

            logger.info(`✅ Conversa atualizada: ${conversationId}`);
            return data;

        } catch (error) {
            logger.error('❌ Erro ao atualizar conversa:', error);
            throw error;
        }
    }

    /**
     * Lista todas as conversas com paginação
     */
    async list(page = 1, limit = 20, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let query = supabase
                .from('conversations')
                .select('*, messages(count)', { count: 'exact' });

            // Aplicar filtros
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.assigned_to) {
                query = query.eq('assigned_to', filters.assigned_to);
            }

            const { data, error, count } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            };

        } catch (error) {
            logger.error('❌ Erro ao listar conversas:', error);
            throw error;
        }
    }

    /**
     * Transfere conversa para atendente humano
     */
    async transferToHuman(conversationId, agentId = null) {
        try {
            const updates = {
                status: 'transferred',
                assigned_to: agentId,
                transferred_at: new Date().toISOString()
            };

            const data = await this.update(conversationId, updates);
            logger.info(`🔄 Conversa ${conversationId} transferida para humano`);
            
            return data;

        } catch (error) {
            logger.error('❌ Erro ao transferir conversa:', error);
            throw error;
        }
    }

    /**
     * Encerra conversa
     */
    async close(conversationId, reason = null) {
        try {
            const updates = {
                status: 'closed',
                closed_at: new Date().toISOString(),
                close_reason: reason
            };

            const data = await this.update(conversationId, updates);
            logger.info(`✅ Conversa ${conversationId} encerrada`);
            
            return data;

        } catch (error) {
            logger.error('❌ Erro ao encerrar conversa:', error);
            throw error;
        }
    }
}

export default new ConversationModel();