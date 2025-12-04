import express from 'express';
import faqController from '../controllers/faqController.js';

const router = express.Router();

/**
 * GET /api/faq - Lista todas as FAQs
 */
router.get('/', faqController.list.bind(faqController));

/**
 * GET /api/faq/:faqId - Busca FAQ específica
 */
router.get('/:faqId', faqController.getById.bind(faqController));

/**
 * POST /api/faq - Cria nova FAQ
 * Body: { question, answer, keywords, category, priority }
 */
router.post('/', faqController.create.bind(faqController));

/**
 * PUT /api/faq/:faqId - Atualiza FAQ
 * Body: campos a atualizar
 */
router.put('/:faqId', faqController.update.bind(faqController));

/**
 * DELETE /api/faq/:faqId - Deleta FAQ
 */
router.delete('/:faqId', faqController.delete.bind(faqController));

export default router;