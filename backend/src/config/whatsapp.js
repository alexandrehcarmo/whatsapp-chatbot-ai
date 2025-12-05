import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config({ path: '.env.production' });
dotenv.config();

let whatsappConfig = null;

export function initializeWhatsApp() {
    const TWILIO_ACCOUNT_SID = process.env.WHATSAPP_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.WHATSAPP_AUTH_TOKEN;
    const TWILIO_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        logger.error('❌ Credenciais do Twilio não configuradas');
        logger.info('💡 Configure WHATSAPP_ACCOUNT_SID e WHATSAPP_AUTH_TOKEN no arquivo .env');
        throw new Error('Credenciais do Twilio são obrigatórias');
    }

    // Validar formato do número
    if (TWILIO_PHONE_NUMBER && !TWILIO_PHONE_NUMBER.startsWith('whatsapp:+')) {
        logger.warn('⚠️ WHATSAPP_PHONE_NUMBER deve começar com "whatsapp:+" (ex: whatsapp:+14155238886)');
    }

    whatsappConfig = {
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN,
        TWILIO_PHONE_NUMBER
    };

    logger.info('✅ Configuração do Twilio carregada com sucesso');
    return whatsappConfig;
}

export function getWhatsAppConfig() {
    if (!whatsappConfig) {
        throw new Error('WhatsApp não foi inicializado. Chame initializeWhatsApp() primeiro.');
    }
    return whatsappConfig;
}

export function getTwilioCredentials() {
    const config = getWhatsAppConfig();
    return {
        TWILIO_ACCOUNT_SID: config.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: config.TWILIO_AUTH_TOKEN,
        TWILIO_PHONE_NUMBER: config.TWILIO_PHONE_NUMBER
    };
}

export default getWhatsAppConfig;