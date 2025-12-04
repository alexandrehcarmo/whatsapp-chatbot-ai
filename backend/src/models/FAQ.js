import supabase from '../config/database.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

class FAQModel {
    /**
     * Cria uma nova FAQ
     */
    async create(faqData) {
        try {
            const faq = {
                id: uuidv4(),
                question: faqData.question,
                answer: faqData.answer,
                keywords: faqData.keywords || [],
                category: faqData.category || 'general',
                priority: faqData.priority || 0,
                is_active: faqData.is_active !== false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('faqs')
                .insert(faq)
                .select()
                .single();

            if (error) throw error;

            logger.info(`✅ FAQ criada: ${data.id}`);
            return data;

        } catch (error) {
            logger.error('❌ Erro ao criar FAQ:', error);
            throw error;
        }
    }

    /**
     * Busca FAQ por ID
     */
    async findById(faqId) {
        try {
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .eq('id', faqId)
                .single();

            if (error) throw error;

            return data;

        } catch (error) {
            logger.error('❌ Erro ao buscar FAQ:', error);
            throw error;
        }
    }

    /**
     * Lista todas as FAQs ativas
     */
    async listActive() {
        try {
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .eq('is_active', true)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data;

        } catch (error) {
            logger.error('❌ Erro ao listar FAQs:', error);
            throw error;
        }
    }

    /**
     * Busca FAQ por palavras-chave (matching simples)
     */
    async searchByKeywords(userMessage) {
        try {
            const faqs = await this.listActive();
            const lowerMessage = userMessage.toLowerCase();

            // Calcular score de relevância para cada FAQ
            const scored = faqs.map(faq => {
                let score = 0;

                // Verificar keywords
                if (faq.keywords && faq.keywords.length > 0) {
                    faq.keywords.forEach(keyword => {
                        if (lowerMessage.includes(keyword.toLowerCase())) {
                            score += 10;
                        }
                    });
                }

                // Verificar pergunta
                const questionWords = faq.question.toLowerCase().split(' ');
                questionWords.forEach(word => {
                    if (word.length > 3 && lowerMessage.includes(word)) {
                        score += 5;
                    }
                });

                return { ...faq, score };
            });

            // Retornar FAQs com score > 0, ordenadas por relevância
            return scored
                .filter(faq => faq.score > 0)
                .sort((a, b) => b.score - a.score);

        } catch (error) {
            logger.error('❌ Erro ao buscar FAQs por keywords:', error);
            throw error;
        }
    }

    /**
     * Atualiza FAQ
     */
    async update(faqId, updates) {
        try {
            const { data, error } = await supabase
                .from('faqs')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', faqId)
                .select()
                .single();

            if (error) throw error;

            logger.info(`✅ FAQ atualizada: ${faqId}`);
            return data;

        } catch (error) {
            logger.error('❌ Erro ao atualizar FAQ:', error);
            throw error;
        }
    }

    /**
     * Deleta FAQ
     */
    async delete(faqId) {
        try {
            const { error } = await supabase
                .from('faqs')
                .delete()
                .eq('id', faqId);

            if (error) throw error;

            logger.info(`✅ FAQ deletada: ${faqId}`);
            return true;

        } catch (error) {
            logger.error('❌ Erro ao deletar FAQ:', error);
            throw error;
        }
    }

    /**
     * Incrementa contador de uso
     */
    async incrementUsage(faqId) {
        try {
            const { data, error } = await supabase
                .rpc('increment_faq_usage', { faq_id: faqId });

            if (error) throw error;

            return data;

        } catch (error) {
            logger.error('❌ Erro ao incrementar uso da FAQ:', error);
            // Não lançar erro, apenas logar
        }
    }
}

export default new FAQModel();