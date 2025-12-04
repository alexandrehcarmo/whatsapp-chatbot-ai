import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.WHATSAPP_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.WHATSAPP_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    logger.error('❌ Credenciais do Twilio não configuradas');
    logger.info('💡 Configure WHATSAPP_ACCOUNT_SID e WHATSAPP_AUTH_TOKEN no arquivo .env');
}

// Validar formato do número
if (TWILIO_PHONE_NUMBER && !TWILIO_PHONE_NUMBER.startsWith('whatsapp:+')) {
    logger.warn('⚠️ WHATSAPP_PHONE_NUMBER deve começar com "whatsapp:+" (ex: whatsapp:+14155238886)');
}

logger.info('✅ Configuração do Twilio carregada');

export {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER
};