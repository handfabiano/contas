<?php
/**
 * Teste direto da API contas.php
 * Acesse: http://seusite.com/teste-contas.php
 */

// Ativa exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 Teste da API contas.php</h1>";

// Simula requisição GET
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['limit'] = 1;

echo "<h2>Teste 1: Incluindo arquivos...</h2>";

try {
    echo "<p>Incluindo config.php...</p>";
    require_once __DIR__ . '/api/config.php';
    echo "<p>✅ config.php OK</p>";

    echo "<p>Incluindo Database.php...</p>";
    require_once __DIR__ . '/api/Database.php';
    echo "<p>✅ Database.php OK</p>";

    echo "<p>Incluindo Response.php...</p>";
    require_once __DIR__ . '/api/Response.php';
    echo "<p>✅ Response.php OK</p>";

    echo "<h2>Teste 2: Executando lógica da API...</h2>";

    // Simula o código de contas.php
    $db = Database::getInstance();
    echo "<p>✅ Database instanciado</p>";

    $filtros = [];
    $filtros['limit'] = 1;

    // IMPORTANTE: PDO MySQL não aceita ? para LIMIT/OFFSET
    $sql = "SELECT * FROM contas_pagar ORDER BY data_vencimento ASC LIMIT 1";
    $params = [];

    echo "<p>SQL: $sql</p>";
    echo "<p>Executando query...</p>";

    $contas = $db->query($sql, $params);
    echo "<p>✅ Query executada!</p>";
    echo "<p>Contas retornadas: " . count($contas) . "</p>";

    echo "<h2>Teste 3: Retorno da API (simulado)</h2>";
    $response = [
        'success' => true,
        'data' => [
            'contas' => $contas,
            'pagination' => [
                'page' => 1,
                'limit' => 1,
                'total' => count($contas),
                'pages' => 1
            ]
        ]
    ];

    echo "<pre>";
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    echo "</pre>";

    echo "<h2>✅ TUDO FUNCIONOU!</h2>";
    echo "<p>A API deveria funcionar. O problema pode estar nos headers.</p>";

} catch (Exception $e) {
    echo "<h2>❌ ERRO ENCONTRADO!</h2>";
    echo "<p style='color:red;'><strong>Erro:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>Arquivo:</strong> " . $e->getFile() . "</p>";
    echo "<p><strong>Linha:</strong> " . $e->getLine() . "</p>";
    echo "<h3>Stack Trace:</h3>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>
