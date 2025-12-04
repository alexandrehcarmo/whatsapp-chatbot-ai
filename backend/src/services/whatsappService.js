import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.WHATSAPP_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.WHATSAPP_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    logger.error('❌ Credenciais do Twilio não configuradas');
}

// Cliente HTTP configurado para Twilio
const twilioClient = axios.create({
    baseURL: `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`,
    auth: {
        username: TWILIO_ACCOUNT_SID,
        password: TWILIO_AUTH_TOKEN
    },
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 10000
});

// Interceptor para logging
twilioClient.interceptors.request.use(
    (config) => {
        logger.debug(`📤 Twilio API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        logger.error('❌ Erro na requisição Twilio:', error.message);
        return Promise.reject(error);
    }
);

twilioClient.interceptors.response.use(
    (response) => {
        logger.debug(`📥 Twilio API Response: ${response.status}`);
        return response;
    },
    (error) => {
        logger.error('❌ Erro na resposta Twilio:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

class WhatsAppService {
    /**
     * Envia mensagem de texto para o WhatsApp via Twilio
     */
    async sendTextMessage(toPhoneNumber, messageText) {
        try {
            // Formatar número para padrão Twilio
            const formattedTo = toPhoneNumber.startsWith('whatsapp:') 
                ? toPhoneNumber 
                : `whatsapp:${toPhoneNumber}`;

            const payload = new URLSearchParams({
                From: TWILIO_PHONE_NUMBER,
                To: formattedTo,
                Body: messageText
            });

            const response = await twilioClient.post('/Messages.json', payload);

            logger.info(`📤 Mensagem enviada para ${toPhoneNumber}`);
            
            return {
                success: true,
                messageId: response.data.sid,
                data: response.data
            };

        } catch (error) {
            logger.error('❌ Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
            
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Formata número de telefone para padrão Twilio WhatsApp
     */
    formatPhoneNumber(phoneNumber) {
        // Remove caracteres não numéricos
        let cleaned = phoneNumber.replace(/\D/g, '');

        // Remove 'whatsapp:' se existir
        cleaned = cleaned.replace('whatsapp:', '');

        // Adiciona código do país se não tiver (assume Brasil)
        if (!cleaned.startsWith('55') && cleaned.length === 11) {
            cleaned = '55' + cleaned;
        }

        // Adiciona prefixo whatsapp:+
        return `whatsapp:+${cleaned}`;
    }

    /**
     * Valida formato de número de telefone
     */
    isValidPhoneNumber(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    }
}

export default new WhatsAppService();
export { TWILIO_PHONE_NUMBER };