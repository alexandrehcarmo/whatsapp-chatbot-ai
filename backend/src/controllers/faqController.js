import FAQModel from '../models/FAQ.js';
import logger from '../utils/logger.js';

class FAQController {
    /**
     * Lista todas as FAQs
     */
    async list(req, res) {
        try {
            const faqs = await FAQModel.listActive();

            return res.status(200).json({
                success: true,
                data: faqs
            });

        } catch (error) {
            logger.error('❌ Erro ao listar FAQs:', error);
            return res.status(500).json({ 
                error: 'Erro ao listar FAQs' 
            });
        }
    }

    /**
     * Busca FAQ por ID
     */
    async getById(req, res) {
        try {
            const { faqId } = req.params;
            const faq = await FAQModel.findById(faqId);

            if (!faq) {
                return res.status(404).json({ 
                    error: 'FAQ não encontrada' 
                });
            }

            return res.status(200).json({
                success: true,
                data: faq
            });

        } catch (error) {
            logger.error('❌ Erro ao buscar FAQ:', error);
            return res.status(500).json({ 
                error: 'Erro ao buscar FAQ' 
            });
        }
    }

    /**
     * Cria nova FAQ
     */
    async create(req, res) {
        try {
            const { question, answer, keywords, category, priority } = req.body;

            if (!question || !answer) {
                return res.status(400).json({ 
                    error: 'question e answer são obrigatórios' 
                });
            }

            const faq = await FAQModel.create({
                question,
                answer,
                keywords: keywords || [],
                category: category || 'general',
                priority: priority || 0
            });

            return res.status(201).json({
                success: true,
                data: faq
            });

        } catch (error) {
            logger.error('❌ Erro ao criar FAQ:', error);
            return res.status(500).json({ 
                error: 'Erro ao criar FAQ' 
            });
        }
    }

    /**
     * Atualiza FAQ
     */
    async update(req, res) {
        try {
            const { faqId } = req.params;
            const updates = req.body;

            const faq = await FAQModel.update(faqId, updates);

            return res.status(200).json({
                success: true,
                data: faq
            });

        } catch (error) {
            logger.error('❌ Erro ao atualizar FAQ:', error);
            return res.status(500).json({ 
                error: 'Erro ao atualizar FAQ' 
            });
        }
    }

    /**
     * Deleta FAQ
     */
    async delete(req, res) {
        try {
            const { faqId } = req.params;

            await FAQModel.delete(faqId);

            return res.status(200).json({
                success: true,
                message: 'FAQ deletada com sucesso'
            });

        } catch (error) {
            logger.error('❌ Erro ao deletar FAQ:', error);
            return res.status(500).json({ 
                error: 'Erro ao deletar FAQ' 
            });
        }
    }
}

export default new FAQController();