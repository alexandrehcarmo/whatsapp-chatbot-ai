-- ============================================
-- FAQs PADRÃO PARA INICIALIZAÇÃO
-- ============================================

INSERT INTO faqs (question, answer, keywords, category, priority) VALUES
(
    'Qual o horário de atendimento?',
    'Nosso atendimento funciona de segunda a sexta, das 8h às 18h. Fora desse horário, você pode deixar sua mensagem que retornaremos assim que possível! 😊',
    ARRAY['horário', 'atendimento', 'funciona', 'horario', 'hora'],
    'atendimento',
    10
),
(
    'Como faço para falar com um atendente?',
    'Claro! Vou transferir você para um de nossos atendentes agora mesmo. Aguarde um momento, por favor! 🙋‍♂️',
    ARRAY['atendente', 'humano', 'pessoa', 'falar', 'transferir'],
    'atendimento',
    100
),
(
    'Quais formas de pagamento vocês aceitam?',
    'Aceitamos as seguintes formas de pagamento:\n\n💳 Cartão de crédito (todas as bandeiras)\n💰 PIX\n🏦 Boleto bancário\n💵 Transferência bancária\n\nQual você prefere?',
    ARRAY['pagamento', 'pagar', 'forma', 'cartão', 'pix', 'boleto'],
    'pagamento',
    8
),
(
    'Como acompanho meu pedido?',
    'Para acompanhar seu pedido, você precisa do número do pedido. Com ele em mãos:\n\n1️⃣ Acesse nosso site\n2️⃣ Vá em "Meus Pedidos"\n3️⃣ Digite o número do pedido\n\nOu me envie o número aqui que eu consulto para você! 📦',
    ARRAY['pedido', 'acompanhar', 'rastrear', 'entrega', 'status'],
    'pedidos',
    9
),
(
    'Vocês fazem entrega?',
    'Sim! Fazemos entregas para todo o Brasil! 🚚\n\nO prazo varia conforme sua região:\n• Sul/Sudeste: 3-5 dias úteis\n• Demais regiões: 7-10 dias úteis\n\nO frete é calculado automaticamente no checkout.',
    ARRAY['entrega', 'entregar', 'frete', 'envio', 'prazo'],
    'entrega',
    7
),
(
    'Qual o prazo de garantia?',
    'Todos os nossos produtos têm garantia de 90 dias contra defeitos de fabricação, conforme o Código de Defesa do Consumidor.\n\nAlguns produtos específicos podem ter garantia estendida. Qual produto você gostaria de saber? 🛡️',
    ARRAY['garantia', 'defeito', 'troca', 'devolução', 'prazo'],
    'produtos',
    6
);

-- Verificar inserção
SELECT COUNT(*) as total_faqs FROM faqs;