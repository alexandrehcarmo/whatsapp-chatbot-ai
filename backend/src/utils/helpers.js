import crypto from 'crypto';

/**
 * Gera token aleatório seguro
 */
export function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Formata número de telefone para padrão brasileiro
 */
export function formatPhoneNumberBR(phoneNumber) {
    // Remove caracteres não numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Formato: +55 (11) 91234-5678
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
        return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    
    // Formato: (11) 91234-5678
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    
    return phoneNumber; // Retornar original se não conseguir formatar
}

/**
 * Sanitiza texto para evitar XSS
 */
export function sanitizeText(text) {
    if (typeof text !== 'string') return text;
    
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Trunca texto com reticências
 */
export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Calcula tempo decorrido em formato legível
 */
export function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        ano: 31536000,
        mês: 2592000,
        semana: 604800,
        dia: 86400,
        hora: 3600,
        minuto: 60,
        segundo: 1
    };
    
    for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        
        if (interval >= 1) {
            return interval === 1 
                ? `há 1 ${name}` 
                : `há ${interval} ${name}${name === 'mês' ? 'es' : 's'}`;
        }
    }
    
    return 'agora mesmo';
}

/**
 * Valida UUID
 */
export function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Gera hash SHA256
 */
export function generateHash(data) {
    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
}

/**
 * Sleep/delay assíncrono
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry com backoff exponencial
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            
            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
}

/**
 * Agrupa array por propriedade
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

/**
 * Remove duplicatas de array
 */
export function uniqueArray(array) {
    return [...new Set(array)];
}

/**
 * Converte objeto para query string
 */
export function objectToQueryString(obj) {
    return Object.keys(obj)
        .filter(key => obj[key] !== undefined && obj[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
        .join('&');
}