-- Sistema de Contas a Pagar
-- Banco: u320952164_Conta

-- Tabela principal
CREATE TABLE IF NOT EXISTS contas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE DEFAULT NULL,
    status ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
    categoria VARCHAR(100) DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_vencimento (data_vencimento),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados de exemplo
INSERT INTO contas (descricao, valor, data_vencimento, status, categoria) VALUES
('Aluguel', 1500.00, '2025-12-05', 'pendente', 'moradia'),
('Energia', 180.50, '2025-12-10', 'pendente', 'utilidades'),
('Internet', 99.90, '2025-12-15', 'pago', 'utilidades'),
('Agua', 85.00, '2025-11-25', 'atrasado', 'utilidades');
