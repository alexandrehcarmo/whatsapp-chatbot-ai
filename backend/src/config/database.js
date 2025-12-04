import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    logger.error('❌ Credenciais do Supabase não configuradas');
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios');
}

// Cliente Supabase com configurações otimizadas
const supabase = createClient(supabaseUrl, supabaseKey, {
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

// Teste de Conexão
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('conversations')
            .select('count')
            .limit(1);
        
        if (error) throw error;
        
        logger.info('✅ Conexão com Supabase estabelecida');
        return true;
    } catch (error) {
        logger.error('❌ Erro ao conectar com Supabase:', error.message);
        return false;
    }
}

// Executar teste na inicialização
testConnection();

export default supabase;