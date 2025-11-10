-- ============================================
-- SISTEMA FINANCEIRO - CONTAS A PAGAR
-- Script de Criação do Banco de Dados MySQL
-- ============================================

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS sistema_financeiro
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sistema_financeiro;

-- ============================================
-- TABELA: contas_pagar
-- ============================================

DROP TABLE IF EXISTS contas_pagar;

CREATE TABLE contas_pagar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    credor VARCHAR(255) NOT NULL,
    tipo_despesa ENUM(
        'moradia',
        'alimentacao',
        'transporte',
        'saude',
        'educacao',
        'lazer',
        'contas',
        'outros'
    ) NOT NULL,
    data_vencimento DATE NOT NULL,
    observacoes TEXT NULL,
    status ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
    tipo_lancamento ENUM('individual', 'recorrente') DEFAULT 'individual',
    recorrencia_id VARCHAR(36) NULL,
    parcela_atual INT NULL,
    total_parcelas INT NULL,
    periodicidade ENUM('semanal', 'quinzenal', 'mensal', 'anual') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_data_vencimento (data_vencimento),
    INDEX idx_tipo_despesa (tipo_despesa),
    INDEX idx_recorrencia (recorrencia_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS DE TESTE (OPCIONAL)
-- ============================================

-- Contas de Moradia
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Aluguel - Novembro 2025', 1500.00, 'Imobiliária São Paulo', 'moradia', '2025-11-05', 'pendente'),
('Condomínio - Novembro 2025', 350.00, 'Condomínio Residencial', 'moradia', '2025-11-10', 'pendente'),
('Conta de Luz - Outubro 2025', 180.50, 'CPFL Energia', 'contas', '2025-10-15', 'pago'),
('Conta de Água - Outubro 2025', 85.30, 'SABESP', 'contas', '2025-10-12', 'pago'),
('Internet - Novembro 2025', 99.90, 'Vivo Fibra', 'contas', '2025-11-08', 'pendente');

-- Contas de Transporte
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Seguro do Carro - Parcela', 450.00, 'Porto Seguro', 'transporte', '2025-11-15', 'pendente'),
('IPVA 2025 - Parcela 3/3', 380.00, 'Detran SP', 'transporte', '2025-10-25', 'atrasado'),
('Manutenção Veículo', 650.00, 'Auto Center Silva', 'transporte', '2025-10-20', 'pago');

-- Contas de Saúde
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Plano de Saúde - Novembro', 520.00, 'Unimed', 'saude', '2025-11-01', 'pendente'),
('Dentista - Tratamento Canal', 800.00, 'Clínica Odontológica', 'saude', '2025-10-28', 'atrasado'),
('Farmácia - Medicamentos', 150.00, 'Drogaria São Paulo', 'saude', '2025-10-18', 'pago');

-- Contas de Alimentação
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Supermercado - Compra Mensal', 650.00, 'Carrefour', 'alimentacao', '2025-10-22', 'pago'),
('Feira Semanal', 120.00, 'Mercado Municipal', 'alimentacao', '2025-10-19', 'pago'),
('Cartão Refeição', 400.00, 'Alelo', 'alimentacao', '2025-11-05', 'pendente');

-- Contas de Educação
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Mensalidade Faculdade', 850.00, 'Universidade XYZ', 'educacao', '2025-11-07', 'pendente'),
('Curso de Inglês', 320.00, 'Wizard', 'educacao', '2025-11-12', 'pendente'),
('Material Escolar', 180.00, 'Livraria Cultura', 'educacao', '2025-10-16', 'pago');

-- Contas de Lazer
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Academia - Mensalidade', 89.90, 'Smart Fit', 'lazer', '2025-11-03', 'pendente'),
('Netflix', 55.90, 'Netflix Brasil', 'lazer', '2025-11-01', 'pendente'),
('Spotify Premium', 21.90, 'Spotify', 'lazer', '2025-11-01', 'pendente'),
('Cinema - Ingressos', 80.00, 'Cinemark', 'lazer', '2025-10-21', 'pago');

-- Outras Despesas
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Celular - Conta', 79.90, 'Claro', 'contas', '2025-11-05', 'pendente'),
('Seguro Residencial', 45.00, 'Porto Seguro Residencial', 'contas', '2025-11-10', 'pendente'),
('Cartão de Crédito', 1250.00, 'Banco Itaú', 'outros', '2025-11-20', 'pendente');

-- ============================================
-- EXEMPLO: Contas Recorrentes (6 meses)
-- ============================================

-- Gerar ID de recorrência
SET @recorrencia_aluguel = UUID();

INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status, tipo_lancamento, recorrencia_id, parcela_atual, total_parcelas, periodicidade) VALUES
('Aluguel - Dezembro 2025 (1/6)', 1500.00, 'Imobiliária São Paulo', 'moradia', '2025-12-05', 'pendente', 'recorrente', @recorrencia_aluguel, 1, 6, 'mensal'),
('Aluguel - Janeiro 2026 (2/6)', 1500.00, 'Imobiliária São Paulo', 'moradia', '2026-01-05', 'pendente', 'recorrente', @recorrencia_aluguel, 2, 6, 'mensal'),
('Aluguel - Fevereiro 2026 (3/6)', 1500.00, 'Imobiliária São Paulo', 'moradia', '2026-02-05', 'pendente', 'recorrente', @recorrencia_aluguel, 3, 6, 'mensal'),
('Aluguel - Março 2026 (4/6)', 1500.00, 'Imobiliária São Paulo', 'moradia', '2026-03-05', 'pendente', 'recorrente', @recorrencia_aluguel, 4, 6, 'mensal'),
('Aluguel - Abril 2026 (5/6)', 1500.00, 'Imobiliária São Paulo', 'moradia', '2026-04-05', 'pendente', 'recorrente', @recorrencia_aluguel, 5, 6, 'mensal'),
('Aluguel - Maio 2026 (6/6)', 1500.00, 'Imobiliária São Paulo', 'moradia', '2026-05-05', 'pendente', 'recorrente', @recorrencia_aluguel, 6, 6, 'mensal');

-- ============================================
-- VIEWS E CONSULTAS ÚTEIS
-- ============================================

-- View: Contas com status calculado (atrasadas)
CREATE OR REPLACE VIEW vw_contas_com_status AS
SELECT
    *,
    CASE
        WHEN status = 'pago' THEN 'pago'
        WHEN status = 'pendente' AND data_vencimento < CURDATE() THEN 'atrasado'
        ELSE status
    END AS status_calculado
FROM contas_pagar;

-- ============================================
-- PROCEDURES ÚTEIS
-- ============================================

-- Procedure: Marcar contas vencidas como atrasadas (executar diariamente)
DELIMITER $$
CREATE PROCEDURE sp_atualizar_status_atrasado()
BEGIN
    UPDATE contas_pagar
    SET status = 'atrasado'
    WHERE status = 'pendente'
    AND data_vencimento < CURDATE();
END$$
DELIMITER ;

-- ============================================
-- ESTATÍSTICAS E QUERIES ÚTEIS
-- ============================================

-- Total por status
SELECT status, COUNT(*) as quantidade, SUM(valor) as total
FROM contas_pagar
GROUP BY status;

-- Total por tipo de despesa
SELECT tipo_despesa, COUNT(*) as quantidade, SUM(valor) as total
FROM contas_pagar
GROUP BY tipo_despesa
ORDER BY total DESC;

-- Contas do mês atual
SELECT * FROM contas_pagar
WHERE DATE_FORMAT(data_vencimento, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
ORDER BY data_vencimento;

-- Próximos vencimentos (7 dias)
SELECT * FROM contas_pagar
WHERE status = 'pendente'
AND data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY data_vencimento;

-- Total geral
SELECT
    COUNT(*) as total_contas,
    SUM(valor) as valor_total,
    AVG(valor) as valor_medio,
    MIN(valor) as menor_valor,
    MAX(valor) as maior_valor
FROM contas_pagar;

-- ============================================
-- LIMPEZA (USAR COM CUIDADO!)
-- ============================================

-- Apagar todos os dados de teste
-- DELETE FROM contas_pagar;

-- Resetar AUTO_INCREMENT
-- ALTER TABLE contas_pagar AUTO_INCREMENT = 1;

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================

/*
1. Execute este script no seu MySQL:
   mysql -u root -p < setup-mysql.sql

2. Configure as credenciais em /api/config.php

3. Teste a conexão:
   php -r "require 'api/Database.php'; Database::getInstance();"

4. Acesse a API:
   - GET  http://localhost/api/contas.php
   - POST http://localhost/api/contas.php
   - GET  http://localhost/api/relatorios.php?tipo=resumo

5. Para executar a procedure de atualização diária:
   CALL sp_atualizar_status_atrasado();
*/
