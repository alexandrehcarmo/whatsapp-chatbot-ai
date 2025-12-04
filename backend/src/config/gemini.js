import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!apiKey) {
    logger.error('❌ GEMINI_API_KEY não configurada');
    throw new Error('GEMINI_API_KEY é obrigatória');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Configuração do modelo otimizada para chatbot
const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1024
};

const safetySettings = [
    {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
];

// Instruções do sistema para o chatbot
const systemInstruction = `Você é um assistente virtual inteligente para atendimento via WhatsApp.

DIRETRIZES:
1. Seja cordial, profissional e empático
2. Responda em português brasileiro de forma natural
3. Seja conciso (máximo 3 parágrafos por resposta)
4. Use emojis moderadamente para humanizar
5. Se não souber a resposta, seja honesto e ofereça transferir para atendimento humano
6. Identifique intenções: dúvidas, reclamações, elogios, solicitações
7. Mantenha contexto da conversa anterior
8. Priorize resolver o problema do cliente rapidamente

FORMATO DE RESPOSTA:
- Use quebras de linha para melhor leitura no WhatsApp
- Evite textos longos e densos
- Use listas quando apropriado
- Finalize sempre com uma pergunta ou call-to-action`;

function getModel() {
    return genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
        safetySettings,
        systemInstruction
    });
}

// Teste de API
async function testGeminiAPI() {
    try {
        logger.info('🔄 Testando conexão com Gemini...');
        logger.info(`📋 Modelo configurado: ${modelName}`);
        logger.info(`🔑 API Key presente: ${apiKey ? 'SIM' : 'NÃO'}`);
        
        const model = getModel();
        const result = await model.generateContent("Olá, teste de conexão");
        const response = result.response.text();
        
        logger.info('✅ API Gemini conectada e funcional');
        logger.info(`📝 Resposta de teste: ${response.substring(0, 50)}...`);
        return true;
    } catch (error) {
        logger.error('❌ Erro ao testar API Gemini:');
        logger.error(`   Mensagem: ${error.message}`);
        logger.error(`   Stack: ${error.stack}`);
        logger.error(`   Código: ${error.code || 'N/A'}`);
        logger.error(`   Status: ${error.status || 'N/A'}`);
        if (error.response) {
            logger.error(`   Response: ${JSON.stringify(error.response.data || error.response)}`);
        }
        return false;
    }
}

testGeminiAPI();

export { getModel, generationConfig, safetySettings };