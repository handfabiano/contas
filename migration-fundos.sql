-- ============================================
-- MIGRATION: Fundos (Entradas) + Prestação de Contas
-- ============================================
-- Aplica em bancos JÁ EXISTENTES sem apagar dados.
-- Cada registro de `fundos` é uma ENTRADA de dinheiro e, ao mesmo tempo,
-- uma prestação de contas própria. As SAÍDAS (contas_pagar) passam a ser
-- vinculadas a um fundo através da coluna `fundo_id`.
--
-- Uso:
--   mysql -u SEU_USUARIO -p NOME_DO_BANCO < migration-fundos.sql
-- ============================================

-- --------------------------------------------
-- TABELA: fundos (entradas / caixas)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS fundos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    fonte VARCHAR(255) NOT NULL,
    valor_entrada DECIMAL(10,2) NOT NULL,
    data_entrada DATE NOT NULL,
    categoria VARCHAR(50) NULL,
    observacoes TEXT NULL,
    status ENUM('aberto', 'encerrado') DEFAULT 'aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_fundos_data_entrada (data_entrada),
    INDEX idx_fundos_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Vincular SAÍDAS (contas_pagar) a um fundo
-- --------------------------------------------
-- `fundo_id` é NULL apenas para não quebrar linhas antigas.
-- Em novos lançamentos de saída o fundo é obrigatório (validado na API).
-- ON DELETE RESTRICT: não permite excluir um fundo que ainda tem saídas.
ALTER TABLE contas_pagar
    ADD COLUMN fundo_id INT NULL AFTER id,
    ADD INDEX idx_contas_fundo (fundo_id),
    ADD CONSTRAINT fk_contas_fundo
        FOREIGN KEY (fundo_id) REFERENCES fundos(id) ON DELETE RESTRICT;
