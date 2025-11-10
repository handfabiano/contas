# 💰 Sistema Financeiro - Contas a Pagar

Sistema PWA (Progressive Web App) para controle de contas a pagar, otimizado para mobile e desktop.

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3 (Mobile-First), JavaScript (ES6+)
- **Backend**: PHP 7.4+ com API REST
- **Banco de Dados**: MySQL 5.7+
- **PWA**: Service Worker para cache offline

## ✨ Características

### Mobile-First
- ✅ Bottom navigation para fácil acesso mobile
- ✅ Touch-friendly (áreas de toque mínimas de 44x44px)
- ✅ Inputs otimizados (sem zoom automático no iOS)
- ✅ Animações suaves e feedback visual
- ✅ Responsivo para tablets e desktops

### Funcionalidades
- 📝 Cadastro de contas individuais e recorrentes
- 📊 Relatórios e dashboard financeiro
- 🔍 Filtros por status, tipo e mês
- ✅ Marcar contas como pagas
- 🗑️ Excluir contas
- 💾 Cache offline (PWA)

## 📦 Instalação

### 1. Requisitos
- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Servidor web (Apache/Nginx)
- Extensões PHP: PDO, pdo_mysql

### 2. Configurar Banco de Dados

```bash
# Importar estrutura do banco
mysql -u root -p < setup-mysql.sql
```

### 3. Configurar Credenciais

Edite o arquivo `/api/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sistema_financeiro');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');
define('DB_PORT', '3306');
```

### 4. Permissões

```bash
chmod 755 api/
chmod 644 api/*.php
chmod 600 api/config.php  # Somente leitura
```

## 🔧 Uso

### Acessar o Sistema

```
http://localhost/contas/
```

### Instalar como PWA (Mobile)

1. Abra no navegador mobile
2. Toque em "Adicionar à tela inicial"
3. O app funcionará offline!

## 🔌 API REST

### Endpoints Disponíveis

#### Contas

```
GET    /api/contas.php              - Lista contas (com filtros)
GET    /api/contas.php?id=X         - Busca conta por ID
POST   /api/contas.php              - Cria nova conta
PUT    /api/contas.php?id=X         - Atualiza conta
DELETE /api/contas.php?id=X         - Exclui conta
PATCH  /api/contas.php?id=X&pagar=1 - Marca como pago
```

#### Relatórios

```
GET /api/relatorios.php?tipo=resumo       - Resumo geral
GET /api/relatorios.php?tipo=dashboard    - Dashboard
```

### Exemplos de Uso

**Criar Conta**

```javascript
fetch('/api/contas.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        descricao: 'Aluguel',
        valor: 1500.00,
        credor: 'Imobiliária XYZ',
        tipo_despesa: 'moradia',
        data_vencimento: '2025-11-05',
        status: 'pendente'
    })
});
```

## 🗂️ Estrutura de Pastas

```
contas/
├── api/                      # Backend PHP
│   ├── config.php            # Configuração
│   ├── Database.php          # Conexão
│   ├── Response.php          # Respostas
│   ├── contas.php            # CRUD
│   └── relatorios.php        # Relatórios
├── css/
│   └── styles.css            # CSS mobile-first
├── js/
│   ├── api-client.js         # Cliente da API
│   ├── app.js                # App principal
│   ├── contas.js             # Módulo contas
│   ├── lancamentos.js        # Módulo lançamentos
│   ├── relatorios-simple.js  # Módulo relatórios
│   └── utils.js              # Funções auxiliares
├── index.html
├── manifest.json
├── service-worker.js
├── setup-mysql.sql
└── README.md
```

## 🐛 Troubleshooting

### Erro: "Conexão recusada"

```bash
# Verifique se o MySQL está rodando
sudo systemctl status mysql

# Verifique as credenciais em api/config.php
```

### Erro 404 na API

```bash
# Apache: Habilite mod_rewrite
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Cache não funciona

```bash
# Limpe o cache do navegador
# Force refresh: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

## 🔒 Segurança

### Produção

1. **Desative DEBUG_MODE**
   ```php
   define('DEBUG_MODE', false);
   ```

2. **Use HTTPS**
   ```bash
   sudo certbot --apache
   ```

3. **Proteja config.php**
   ```bash
   chmod 600 api/config.php
   ```

4. **Configure CORS**
   ```php
   define('ALLOWED_ORIGINS', 'https://seudominio.com');
   ```

## 📈 Melhorias Futuras

- [ ] Autenticação de usuários (JWT)
- [ ] Multi-tenancy (múltiplos usuários)
- [ ] Exportação para PDF/Excel
- [ ] Gráficos interativos
- [ ] Notificações push
- [ ] Dark mode
- [ ] Backup automático

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o controle financeiro pessoal.

---

**Versão:** 2.0.0 (MySQL + Mobile-First)
**Última atualização:** Novembro 2025
