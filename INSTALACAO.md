# 📦 INSTALAÇÃO - Sistema de Contas a Pagar

## 🚀 Instalação Rápida

### 1. Fazer Upload dos Arquivos

Faça upload dos seguintes arquivos para a **raiz do seu site**:

```
📁 Raiz (public_html ou htdocs)
├── app.html          ← Arquivo principal
├── app.css           ← Estilos
├── app.js            ← JavaScript
├── api.php           ← API REST
└── database.sql      ← Script do banco (usar no phpMyAdmin)
```

### 2. Criar Tabela no Banco de Dados

**Opção A - Pelo phpMyAdmin:**
1. Acesse o phpMyAdmin
2. Selecione o banco `u320952164_Conta`
3. Clique na aba **SQL**
4. Cole o conteúdo completo do arquivo `database.sql`
5. Clique em **Executar**

**Opção B - Se você tem acesso SSH:**
```bash
mysql -u u320952164_Conta -p u320952164_Conta < database.sql
```

### 3. Verificar Configuração

Abra no navegador:
```
https://seu-site.com/verificar-bd.php
```

Se aparecer ✅ em todos os testes, está funcionando!

### 4. Acessar o Sistema

Abra no navegador:
```
https://seu-site.com/app.html
```

---

## 🔧 Estrutura do Sistema

### Arquivos Principais

**app.html** - Interface do usuário
- Formulário para adicionar contas
- Dashboard com resumo mensal
- Lista de contas com filtros
- Botões para pagar/excluir

**api.php** - API REST
- GET: Listar contas, dashboard
- POST: Criar nova conta
- PUT: Atualizar conta
- DELETE: Excluir conta

**app.js** - Lógica JavaScript
- Comunicação com API
- Renderização dinâmica
- Filtros e navegação por mês

**app.css** - Estilos Mobile-First
- Responsivo (mobile, tablet, desktop)
- Design moderno e limpo
- Touch-friendly (botões 44x44px)

---

## 📊 Banco de Dados

### Tabela: `contas`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária (auto increment) |
| descricao | VARCHAR(255) | Nome da conta |
| valor | DECIMAL(10,2) | Valor em reais |
| data_vencimento | DATE | Data de vencimento |
| data_pagamento | DATE | Data do pagamento (null se pendente) |
| status | ENUM | pendente, pago, atrasado |
| categoria | VARCHAR(100) | Categoria (moradia, utilidades, etc) |
| observacoes | TEXT | Observações opcionais |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Data da última atualização |

---

## 🧪 Testar a API

### Listar todas as contas:
```
GET https://seu-site.com/api.php?acao=listar
```

### Dashboard do mês atual:
```
GET https://seu-site.com/api.php?acao=dashboard&mes=2025-12
```

### Criar nova conta:
```
POST https://seu-site.com/api.php
Content-Type: application/json

{
  "descricao": "Aluguel",
  "valor": 1500.00,
  "data_vencimento": "2025-12-05",
  "categoria": "moradia"
}
```

### Marcar como pago:
```
PUT https://seu-site.com/api.php?id=1
Content-Type: application/json

{
  "status": "pago",
  "data_pagamento": "2025-12-01"
}
```

### Excluir conta:
```
DELETE https://seu-site.com/api.php?id=1
```

---

## ✅ Checklist de Instalação

- [ ] Fazer upload de: app.html, app.css, app.js, api.php
- [ ] Executar database.sql no phpMyAdmin
- [ ] Acessar verificar-bd.php e confirmar que tudo está ✅
- [ ] Acessar app.html e testar:
  - [ ] Dashboard mostra valores corretos
  - [ ] Consegue criar nova conta
  - [ ] Consegue marcar como pago
  - [ ] Consegue excluir conta
  - [ ] Filtros funcionam (Todas, Pendentes, Pagas, Atrasadas)
  - [ ] Navegação por mês funciona (← →)

---

## 🐛 Solução de Problemas

### Erro: "Erro de conexão"
- Verifique as credenciais em `api.php` (linhas 17-20)
- Confirme que o banco existe no phpMyAdmin

### Erro: "Table 'contas' doesn't exist"
- Execute o arquivo `database.sql` no phpMyAdmin

### Erro: "Nenhuma conta encontrada"
- Normal se o banco está vazio
- Adicione uma conta pelo formulário

### Página em branco
- Verifique erros no Console do navegador (F12)
- Verifique se todos os arquivos foram enviados
- Verifique se os nomes estão corretos (minúsculas)

### Valores não aparecem formatados
- Limpe o cache do navegador (Ctrl+Shift+R)

---

## 📱 Funcionalidades

✅ Dashboard com resumo mensal
✅ Criar, editar e excluir contas
✅ Marcar contas como pagas
✅ Filtrar por status (pendente, pago, atrasado)
✅ Navegação por mês
✅ Categorização de despesas
✅ Design mobile-first responsivo
✅ API REST completa

---

## 🔐 Segurança

- ✅ PDO com prepared statements (protege contra SQL injection)
- ✅ Headers CORS configurados
- ✅ Validação de dados no backend
- ✅ Tratamento de erros

---

## 📞 Suporte

Se encontrar problemas:
1. Acesse `verificar-bd.php` e me envie o resultado
2. Abra o Console do navegador (F12) e me envie os erros
3. Verifique se todos os 4 arquivos principais foram enviados
