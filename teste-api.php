<?php
/**
 * Teste de Diagnóstico da API
 * Acesse: http://seusite.com/teste-api.php
 */

echo "<h1>🔍 Diagnóstico da API</h1>";

// Teste 1: PHP funcionando
echo "<h2>✅ Teste 1: PHP Funcionando</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Teste 2: Arquivo config.php existe
echo "<h2>Teste 2: Arquivo config.php</h2>";
if (file_exists(__DIR__ . '/api/config.php')) {
    echo "<p>✅ config.php encontrado</p>";

    // Teste 3: Carregar config.php
    echo "<h2>Teste 3: Carregando config.php</h2>";
    try {
        require_once __DIR__ . '/api/config.php';
        echo "<p>✅ config.php carregado com sucesso</p>";
        echo "<p>DB_HOST: " . DB_HOST . "</p>";
        echo "<p>DB_NAME: " . DB_NAME . "</p>";
        echo "<p>DB_USER: " . DB_USER . "</p>";
    } catch (Exception $e) {
        echo "<p>❌ Erro ao carregar config.php: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p>❌ config.php NÃO encontrado em: " . __DIR__ . '/api/config.php</p>';
}

// Teste 4: Database.php existe
echo "<h2>Teste 4: Arquivo Database.php</h2>";
if (file_exists(__DIR__ . '/api/Database.php')) {
    echo "<p>✅ Database.php encontrado</p>";

    // Teste 5: Conectar ao MySQL
    echo "<h2>Teste 5: Conexão MySQL</h2>";
    try {
        require_once __DIR__ . '/api/Database.php';
        $db = Database::getInstance();
        echo "<p>✅ Conexão MySQL estabelecida!</p>";

        // Teste 6: Testar query
        echo "<h2>Teste 6: Query no Banco</h2>";
        try {
            $result = $db->query("SELECT COUNT(*) as total FROM contas_pagar");
            echo "<p>✅ Query executada com sucesso!</p>";
            echo "<p>Total de contas no banco: " . $result[0]['total'] . "</p>";
        } catch (Exception $e) {
            echo "<p>❌ Erro ao executar query: " . $e->getMessage() . "</p>";
        }

    } catch (Exception $e) {
        echo "<p>❌ Erro de conexão MySQL: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p>❌ Database.php NÃO encontrado</p>";
}

// Teste 7: API contas.php existe
echo "<h2>Teste 7: Arquivo contas.php</h2>";
if (file_exists(__DIR__ . '/api/contas.php')) {
    echo "<p>✅ contas.php encontrado</p>";
} else {
    echo "<p>❌ contas.php NÃO encontrado</p>";
}

// Teste 8: Permissões
echo "<h2>Teste 8: Permissões dos Arquivos</h2>";
$files = [
    '/api/config.php',
    '/api/Database.php',
    '/api/Response.php',
    '/api/contas.php',
    '/api/relatorios.php'
];

foreach ($files as $file) {
    $fullPath = __DIR__ . $file;
    if (file_exists($fullPath)) {
        $perms = substr(sprintf('%o', fileperms($fullPath)), -4);
        echo "<p>$file: $perms " . (is_readable($fullPath) ? '✅ Legível' : '❌ Não legível') . "</p>";
    } else {
        echo "<p>$file: ❌ Não existe</p>";
    }
}

echo "<hr>";
echo "<h2>📋 Resumo</h2>";
echo "<p>Se todos os testes acima passaram (✅), a API deve funcionar!</p>";
echo "<p>Se algum teste falhou (❌), corrija o problema indicado.</p>";
?>
