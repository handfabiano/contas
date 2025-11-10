<?php
/**
 * Configuração do Banco de Dados - EXEMPLO
 *
 * INSTRUÇÕES:
 * 1. Copie este arquivo para "config.php"
 * 2. Preencha com suas credenciais do MySQL
 * 3. NUNCA commit o arquivo config.php no Git (está no .gitignore)
 */

// Configurações do Banco de Dados MySQL
define('DB_HOST', 'localhost');        // Host do banco (geralmente localhost)
define('DB_NAME', 'sistema_financeiro'); // Nome do banco de dados
define('DB_USER', 'seu_usuario');      // Usuário do banco
define('DB_PASS', 'sua_senha');        // Senha do banco
define('DB_PORT', '3306');             // Porta (padrão: 3306)
define('DB_CHARSET', 'utf8mb4');       // Charset

// Configurações da Aplicação
define('API_SECRET_KEY', 'MUDE_ESTA_CHAVE_SECRETA_AQUI_' . bin2hex(random_bytes(32)));
define('TIMEZONE', 'America/Sao_Paulo');

// Configurações de CORS (ajuste conforme necessário)
define('ALLOWED_ORIGINS', '*'); // Em produção, defina o domínio específico

// Modo Debug (desative em produção)
define('DEBUG_MODE', true);

// Configurações de Sessão
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Lax');

date_default_timezone_set(TIMEZONE);
