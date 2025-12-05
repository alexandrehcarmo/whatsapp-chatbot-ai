import { getGeminiModel } from '../config/gemini.js';
import logger from '../utils/logger.js';

class AIService {
    constructor() {
        this.conversationHistories = new Map();
    }

    // Getter lazy para o modelo
    get model() {
        return getGeminiModel();
    }

    /**
     * Gera resposta inteligente baseada no contexto da conversa
     * @param {string} userMessage - Mensagem do usuário
     * @param {string} conversationId - ID da conversa para contexto
     * @param {Array} previousMessages - Mensagens anteriores para contexto
     * @returns {Promise<Object>} - Resposta com texto e metadados
     */
    async generateResponse(userMessage, conversationId, previousMessages = []) {
        try {
            // Construir contexto da conversa
            const contextPrompt = this.buildContextPrompt(previousMessages);
            
            // Criar chat com histórico
            const chat = this.model.startChat({
                history: this.formatHistoryForGemini(previousMessages),
            });

            // Gerar resposta
            const result = await chat.sendMessage(userMessage);
            const responseText = result.response.text();

            // Análise de intenção (simplificada)
            const intent = this.analyzeIntent(userMessage);

            logger.info(`🤖 IA gerou resposta para conversa ${conversationId}`);

            return {
                text: responseText,
                intent: intent,
                confidence: 0.85,
                requiresHuman: this.shouldTransferToHuman(userMessage, responseText, intent),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error('❌ Erro ao gerar resposta com IA:', error);
            
            return {
                text: 'Desculpe, estou com dificuldades técnicas no momento. Vou transferir você para um atendente humano. 🙏',
                intent: 'error',
                confidence: 0,
                requiresHuman: true,
                error: error.message
            };
        }
    }

    /**
     * Constrói prompt com contexto das mensagens anteriores
     */
    buildContextPrompt(previousMessages) {
        if (!previousMessages || previousMessages.length === 0) {
            return '';
        }

        const context = previousMessages
            .slice(-5)
            .map(msg => `${msg.sender === 'user' ? 'Cliente' : 'Bot'}: ${msg.text}`)
            .join('\n');

        return `CONTEXTO DA CONVERSA ANTERIOR:\n${context}\n\n`;
    }

    /**
     * Formata histórico para o formato esperado pelo Gemini
     */
    formatHistoryForGemini(previousMessages) {
        if (!previousMessages || previousMessages.length === 0) {
            return [];
        }

        return previousMessages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
    }

    /**
     * Analisa a intenção da mensagem do usuário
     */
    analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();

        const intents = {
            greeting: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'hey'],
            question: ['como', 'quando', 'onde', 'qual', 'quem', 'por que', '?'],
            complaint: ['problema', 'reclamação', 'ruim', 'péssimo', 'não funciona', 'erro'],
            praise: ['obrigado', 'obrigada', 'excelente', 'ótimo', 'parabéns', 'muito bom'],
            request: ['preciso', 'quero', 'gostaria', 'pode', 'consegue', 'solicito'],
            farewell: ['tchau', 'até logo', 'obrigado', 'valeu', 'bye']
        };

        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return intent;
            }
        }

        return 'general';
    }

    /**
     * Determina se a conversa deve ser transferida para humano
     */
    shouldTransferToHuman(userMessage, botResponse, intent) {
        const lowerMessage = userMessage.toLowerCase();
        
        const transferKeywords = [
            'falar com atendente',
            'falar com humano',
            'falar com pessoa',
            'não entendi',
            'não resolve',
            'transferir',
            'gerente',
            'supervisor'
        ];

        const hasTransferKeyword = transferKeywords.some(keyword => 
            lowerMessage.includes(keyword)
        );

        const isComplaint = intent === 'complaint';
        const isComplex = userMessage.length > 200;

        return hasTransferKeyword || (isComplaint && isComplex);
    }

    /**
     * Analisa sentimento da mensagem (simplificado)
     */
    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        
        const positiveWords = ['bom', 'ótimo', 'excelente', 'feliz', 'obrigado', 'parabéns'];
        const negativeWords = ['ruim', 'péssimo', 'problema', 'erro', 'não funciona', 'reclamação'];

        const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }
}

export default new AIService();