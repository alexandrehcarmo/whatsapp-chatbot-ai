-- ============================================
-- SCHEMA INICIAL - WHATSAPP CHATBOT AI
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: conversations
-- Armazena conversas com clientes
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'closed')),
    assigned_to VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    transferred_at TIMESTAMP,
    closed_at TIMESTAMP,
    close_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_conversations_phone ON conversations(phone_number);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- ============================================
-- TABELA: messages
-- Armazena todas as mensagens trocadas
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot', 'agent')),
    text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document')),
    intent VARCHAR(50),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender);
CREATE INDEX idx_messages_intent ON messages(intent);

-- ============================================
-- TABELA: faqs
-- Perguntas frequentes para respostas rápidas
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    category VARCHAR(50) DEFAULT 'general',
    priority INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_is_active ON faqs(is_active);
CREATE INDEX idx_faqs_priority ON faqs(priority DESC);
CREATE INDEX idx_faqs_keywords ON faqs USING GIN(keywords);

-- ============================================
-- FUNÇÃO: Incrementar contador de uso da FAQ
-- ============================================
CREATE OR REPLACE FUNCTION increment_faq_usage(faq_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE faqs 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = faq_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS NAS TABELAS (Documentação)
-- ============================================
COMMENT ON TABLE conversations IS 'Conversas com clientes via WhatsApp';
COMMENT ON TABLE messages IS 'Mensagens trocadas nas conversas';
COMMENT ON TABLE faqs IS 'Perguntas frequentes para respostas automáticas';

COMMENT ON COLUMN conversations.status IS 'Status: active (bot), transferred (humano), closed (encerrada)';
COMMENT ON COLUMN messages.sender IS 'Remetente: user (cliente), bot (IA), agent (humano)';
COMMENT ON COLUMN messages.intent IS 'Intenção identificada: greeting, question, complaint, etc';