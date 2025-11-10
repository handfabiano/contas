<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verificar Estrutura do Banco</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        h2 { color: #0ff; }
        .success { color: #0f0; }
        .error { color: #f00; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; background: #2a2a2a; }
        th, td { border: 1px solid #0f0; padding: 8px; text-align: left; }
        th { background: #0a0a0a; color: #0ff; }
        pre { background: #2a2a2a; padding: 10px; border: 1px solid #0f0; overflow-x: auto; }
    </style>
</head>
<body>
<h1>🔍 Verificacao da Estrutura do Banco de Dados</h1>

<?php
// Credenciais
define('DB_HOST', 'localhost');
define('DB_NAME', 'u320952164_Conta');
define('DB_USER', 'u320952164_Conta');
define('DB_PASS', 'Vieira@2025');
define('DB_PORT', '3306');

try {
    // Conexão
    echo "<h2>1. Testando Conexao MySQL</h2>";
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "<p class='success'>✅ Conexao estabelecida com sucesso!</p>";

    // Listar tabelas
    echo "<h2>2. Tabelas no Banco de Dados</h2>";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($tables)) {
        echo "<p class='error'>❌ Nenhuma tabela encontrada no banco de dados!</p>";
    } else {
        echo "<p class='success'>✅ Encontradas " . count($tables) . " tabela(s):</p>";
        echo "<ul>";
        foreach ($tables as $table) {
            echo "<li>$table</li>";
        }
        echo "</ul>";

        // Para cada tabela, mostrar estrutura
        foreach ($tables as $table) {
            echo "<h2>3. Estrutura da Tabela: $table</h2>";

            // Colunas
            $stmt = $pdo->query("DESCRIBE `$table`");
            $columns = $stmt->fetchAll();

            echo "<h3>Colunas:</h3>";
            echo "<table>";
            echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Chave</th><th>Padrao</th><th>Extra</th></tr>";
            foreach ($columns as $col) {
                echo "<tr>";
                echo "<td>{$col['Field']}</td>";
                echo "<td>{$col['Type']}</td>";
                echo "<td>{$col['Null']}</td>";
                echo "<td>{$col['Key']}</td>";
                echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
                echo "<td>{$col['Extra']}</td>";
                echo "</tr>";
            }
            echo "</table>";

            // Contar registros
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM `$table`");
            $count = $stmt->fetch();
            echo "<p>Total de registros: <strong>{$count['total']}</strong></p>";

            // Mostrar 3 registros de exemplo
            if ($count['total'] > 0) {
                echo "<h3>Exemplo de Registros (3 primeiros):</h3>";
                $stmt = $pdo->query("SELECT * FROM `$table` LIMIT 3");
                $samples = $stmt->fetchAll();

                echo "<pre>";
                echo json_encode($samples, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                echo "</pre>";
            }
        }
    }

} catch (PDOException $e) {
    echo "<p class='error'>❌ Erro: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>

</body>
</html>
