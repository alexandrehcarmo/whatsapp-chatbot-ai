import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

let supabase = null;

export function initializeSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        logger.error('❌ Credenciais do Supabase não configuradas');
        logger.error('SUPABASE_URL:', supabaseUrl ? 'OK' : 'FALTANDO');
        logger.error('SUPABASE_SERVICE_KEY:', supabaseKey ? 'OK' : 'FALTANDO');
        throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios');
    }

    // Cliente Supabase com configurações otimizadas
    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: false
        },
        db: {
            schema: 'public'
        },
        global: {
            headers: {
                'x-application-name': 'whatsapp-chatbot'
            }
        }
    });

    logger.info('✅ Conexão com Supabase estabelecida');
    return supabase;
}

export function getSupabase() {
    if (!supabase) {
        throw new Error('Supabase não foi inicializado. Chame initializeSupabase() primeiro.');
    }
    return supabase;
}

// Teste de Conexão
async function testConnection() {
    try {
        const supabaseClient = getSupabase();
        const { data, error } = await supabaseClient
            .from('conversations')
            .select('count')
            .limit(1);
        
        if (error) throw error;
        
        logger.info('✅ Conexão com Supabase testada com sucesso');
        return true;
    } catch (error) {
        logger.error('❌ Erro ao conectar com Supabase:', error.message);
        return false;
    }
}

export { testConnection };
export default getSupabase;