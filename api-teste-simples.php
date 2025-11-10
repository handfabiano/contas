<?php
/**
 * Teste SIMPLIFICADO da API - SEM paginação
 * Acesse: http://seusite.com/api-teste-simples.php
 */

// Headers JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Ativa erros
error_reporting(E_ALL);
ini_set('display_errors', 0); // Não mostra HTML, só JSON

try {
    // Inclui arquivos
    require_once __DIR__ . '/api/config.php';
    require_once __DIR__ . '/api/Database.php';

    // Conecta
    $db = Database::getInstance();

    // Query SIMPLES sem LIMIT com placeholder
    $sql = "SELECT * FROM contas_pagar ORDER BY data_vencimento ASC LIMIT 2";
    $contas = $db->query($sql, []);

    // Retorna JSON
    echo json_encode([
        'success' => true,
        'message' => 'API funcionando!',
        'total' => count($contas),
        'contas' => $contas
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
}
