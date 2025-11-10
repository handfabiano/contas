# 💰 Sistema Financeiro - Contas a Pagar

Sistema simples e completo para controle de contas a pagar, com suporte a lançamentos individuais e recorrentes, desenvolvido com HTML, CSS, JavaScript e Supabase.

## 🚀 Funcionalidades

- ✅ Lançamento individual de contas
- ✅ Lançamento recorrente (com número de parcelas ou indefinido)
- ✅ Controle de status (Pendente, Pago, Atrasado)
- ✅ Edição e exclusão de contas
- ✅ Filtros por status e tipo de despesa
- ✅ Relatórios financeiros detalhados
- ✅ Gráficos de despesas por tipo
- ✅ Ranking de maiores credores
- ✅ Interface responsiva e moderna

## 📋 Pré-requisitos

- Conta no Supabase (gratuita)
- Navegador web moderno

## 🔧 Configuração do Supabase

### 1. Criar conta no Supabase

Acesse [https://supabase.com](https://supabase.com) e crie uma conta gratuita.

### 2. Criar um novo projeto

1. Clique em "New Project"
2. Escolha um nome para o projeto
3. Defina uma senha para o banco de dados
4. Escolha a região mais próxima
5. Aguarde a criação do projeto (pode levar alguns minutos)

### 3. Criar a tabela no banco de dados

No painel do Supabase, vá em **SQL Editor** e execute o seguinte código:

```sql
-- Criar tabela de contas a pagar
CREATE TABLE contas_pagar (
    id BIGSERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    credor TEXT NOT NULL,
    tipo_despesa TEXT NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pendente',
    recorrente BOOLEAN DEFAULT FALSE,
    parcela_atual INTEGER,
    total_parcelas INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_contas_status ON contas_pagar(status);
CREATE INDEX idx_contas_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_tipo ON contas_pagar(tipo_despesa);

-- Habilitar RLS (Row Level Security) - Opcional
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (para testes)
-- Em produção, configure políticas mais restritivas
CREATE POLICY "Permitir tudo para todos" ON contas_pagar
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

### 4. Obter as credenciais

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie a **Project URL** (algo como: https://xxxxx.supabase.co)
3. Copie a **anon/public key** (uma chave longa)

### 5. Configurar o arquivo app.js

Abra o arquivo `app.js` e substitua as credenciais no início do arquivo:

```javascript
const SUPABASE_URL = 'SUA_URL_DO_SUPABASE'; // Cole aqui a Project URL
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA_DO_SUPABASE'; // Cole aqui a anon key
```

## 📂 Estrutura do Projeto

```
sistema-financeiro/
│
├── index.html          # Estrutura HTML do sistema
├── styles.css          # Estilos e design
├── app.js              # Lógica JavaScript e integração Supabase
└── README.md           # Este arquivo
```

## 🎯 Como Usar

### 1. Abrir o Sistema

Abra o arquivo `index.html` em seu navegador.

### 2. Novo Lançamento

**Lançamento Individual:**
1. Selecione "Individual" no tipo de lançamento
2. Preencha os campos: descrição, valor, credor, tipo de despesa e data de vencimento
3. Clique em "Salvar Lançamento"

**Lançamento Recorrente:**
1. Selecione "Recorrente" no tipo de lançamento
2. Escolha entre:
   - **Número de Parcelas**: Define quantas vezes a conta se repetirá
   - **Indefinido**: Cria lançamentos sem prazo determinado (até 120 meses)
3. Selecione a frequência (Mensal, Semanal, Quinzenal ou Anual)
4. Preencha os demais campos
5. Clique em "Salvar Lançamento"

### 3. Gerenciar Contas

Na aba "Contas a Pagar":
- Visualize todas as contas cadastradas
- Filtre por status (Pendente, Pago, Atrasado)
- Filtre por tipo de despesa
- Marque contas como pagas
- Edite informações das contas
- Exclua contas

### 4. Relatórios

Na aba "Relatórios":
- Defina o período desejado
- Clique em "Gerar Relatório"
- Visualize:
  - Total de despesas
  - Contas pagas
  - Contas pendentes
  - Contas atrasadas
  - Despesas por tipo (com percentuais)
  - Maiores credores

## 📊 Tipos de Despesa Disponíveis

- Alimentação
- Moradia
- Transporte
- Saúde
- Educação
- Lazer
- Vestuário
- Serviços
- Impostos
- Outros

## 🎨 Recursos de Design

- Interface moderna e limpa
- Cores suaves e agradáveis
- Responsivo para dispositivos móveis
- Animações e transições suaves
- Feedback visual para ações do usuário

## 🔒 Segurança

Para ambientes de produção, recomenda-se:
1. Configurar políticas RLS (Row Level Security) mais restritivas no Supabase
2. Implementar autenticação de usuários
3. Limitar permissões de acesso aos dados
4. Usar variáveis de ambiente para as credenciais

## 🐛 Solução de Problemas

**Erro ao carregar contas:**
- Verifique se as credenciais do Supabase estão corretas
- Confirme se a tabela foi criada corretamente
- Verifique o console do navegador para mais detalhes

**Lançamentos não aparecem:**
- Verifique se há conexão com a internet
- Confirme se as políticas RLS estão configuradas corretamente
- Tente recarregar a página

## 🚀 Melhorias Futuras

- [ ] Sistema de categorias personalizadas
- [ ] Gráficos interativos
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações de vencimento
- [ ] Dashboard com indicadores
- [ ] Integração com contas bancárias
- [ ] Autenticação de usuários
- [ ] Aplicativo mobile

## 📝 Licença

Este projeto é de código aberto e está disponível para uso pessoal e comercial.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para melhorar o código e adicionar novas funcionalidades.

## 📧 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório do projeto.

---

Desenvolvido com ❤️ para facilitar o controle financeiro
