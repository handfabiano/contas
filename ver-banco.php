<?php
header('Content-Type: application/json; charset=utf-8');

define('DB_HOST', 'localhost');
define('DB_NAME', 'u320952164_Conta');
define('DB_USER', 'u320952164_Conta');
define('DB_PASS', 'Vieira@2025');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Listar TODAS as tabelas
    $stmt = $pdo->query("SHOW TABLES");
    $tabelas = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $resultado = [
        'sucesso' => true,
        'total_tabelas' => count($tabelas),
        'tabelas' => []
    ];

    // Para cada tabela
    foreach ($tabelas as $tabela) {
        // Estrutura
        $stmt = $pdo->query("DESCRIBE `$tabela`");
        $colunas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Contar registros
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM `$tabela`");
        $total = $stmt->fetch()['total'];

        // Pegar 2 exemplos
        $exemplos = [];
        if ($total > 0) {
            $stmt = $pdo->query("SELECT * FROM `$tabela` LIMIT 2");
            $exemplos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $resultado['tabelas'][$tabela] = [
            'colunas' => $colunas,
            'total_registros' => $total,
            'exemplos' => $exemplos
        ];
    }

    echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
