<?php
/**
 * API REST - Sistema de Contas a Pagar
 * Metodos: GET, POST, PUT, DELETE
 */

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuracao do banco
define('DB_HOST', 'localhost');
define('DB_NAME', 'u320952164_Conta');
define('DB_USER', 'u320952164_Conta');
define('DB_PASS', 'Vieira@2025');

// Conexao
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro de conexao: ' . $e->getMessage()]);
    exit();
}

// Pegar metodo e acao
$method = $_SERVER['REQUEST_METHOD'];
$acao = $_GET['acao'] ?? 'listar';
$id = $_GET['id'] ?? null;

// Funcao auxiliar para retornar JSON
function resposta($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// ========== ROTAS ==========

try {
    switch ($method) {

        // GET - Listar ou buscar
        case 'GET':
            if ($acao === 'listar') {
                // Filtros
                $where = [];
                $params = [];

                if (isset($_GET['status'])) {
                    $where[] = "status = ?";
                    $params[] = $_GET['status'];
                }

                if (isset($_GET['categoria'])) {
                    $where[] = "categoria = ?";
                    $params[] = $_GET['categoria'];
                }

                if (isset($_GET['mes'])) {
                    $where[] = "DATE_FORMAT(data_vencimento, '%Y-%m') = ?";
                    $params[] = $_GET['mes'];
                }

                $sql = "SELECT * FROM contas";
                if (!empty($where)) {
                    $sql .= " WHERE " . implode(" AND ", $where);
                }
                $sql .= " ORDER BY data_vencimento ASC";

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $contas = $stmt->fetchAll();

                resposta(['sucesso' => true, 'contas' => $contas]);
            }

            elseif ($acao === 'dashboard') {
                // Mes atual
                $mes = $_GET['mes'] ?? date('Y-m');

                // Totais
                $stmt = $pdo->prepare("
                    SELECT
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as pendente,
                        SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as pago,
                        SUM(CASE WHEN status = 'atrasado' THEN valor ELSE 0 END) as atrasado
                    FROM contas
                    WHERE DATE_FORMAT(data_vencimento, '%Y-%m') = ?
                ");
                $stmt->execute([$mes]);
                $dashboard = $stmt->fetch();

                // Por categoria
                $stmt = $pdo->prepare("
                    SELECT categoria, SUM(valor) as total
                    FROM contas
                    WHERE DATE_FORMAT(data_vencimento, '%Y-%m') = ?
                    GROUP BY categoria
                    ORDER BY total DESC
                ");
                $stmt->execute([$mes]);
                $porCategoria = $stmt->fetchAll();

                resposta([
                    'sucesso' => true,
                    'mes' => $mes,
                    'totais' => $dashboard,
                    'porCategoria' => $porCategoria
                ]);
            }

            elseif ($id) {
                // Buscar por ID
                $stmt = $pdo->prepare("SELECT * FROM contas WHERE id = ?");
                $stmt->execute([$id]);
                $conta = $stmt->fetch();

                if ($conta) {
                    resposta(['sucesso' => true, 'conta' => $conta]);
                } else {
                    resposta(['erro' => 'Conta nao encontrada'], 404);
                }
            }
            break;

        // POST - Criar
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                resposta(['erro' => 'Dados invalidos'], 400);
            }

            $descricao = $data['descricao'] ?? null;
            $valor = $data['valor'] ?? null;
            $data_vencimento = $data['data_vencimento'] ?? null;
            $categoria = $data['categoria'] ?? null;
            $observacoes = $data['observacoes'] ?? null;

            if (!$descricao || !$valor || !$data_vencimento) {
                resposta(['erro' => 'Campos obrigatorios: descricao, valor, data_vencimento'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO contas (descricao, valor, data_vencimento, categoria, observacoes, status)
                VALUES (?, ?, ?, ?, ?, 'pendente')
            ");

            $stmt->execute([$descricao, $valor, $data_vencimento, $categoria, $observacoes]);

            resposta([
                'sucesso' => true,
                'mensagem' => 'Conta criada com sucesso',
                'id' => $pdo->lastInsertId()
            ], 201);
            break;

        // PUT - Atualizar
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$id) {
                resposta(['erro' => 'ID nao fornecido'], 400);
            }

            // Verificar se existe
            $stmt = $pdo->prepare("SELECT id FROM contas WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                resposta(['erro' => 'Conta nao encontrada'], 404);
            }

            $campos = [];
            $params = [];

            if (isset($data['descricao'])) {
                $campos[] = "descricao = ?";
                $params[] = $data['descricao'];
            }

            if (isset($data['valor'])) {
                $campos[] = "valor = ?";
                $params[] = $data['valor'];
            }

            if (isset($data['data_vencimento'])) {
                $campos[] = "data_vencimento = ?";
                $params[] = $data['data_vencimento'];
            }

            if (isset($data['data_pagamento'])) {
                $campos[] = "data_pagamento = ?";
                $params[] = $data['data_pagamento'];
            }

            if (isset($data['status'])) {
                $campos[] = "status = ?";
                $params[] = $data['status'];
            }

            if (isset($data['categoria'])) {
                $campos[] = "categoria = ?";
                $params[] = $data['categoria'];
            }

            if (isset($data['observacoes'])) {
                $campos[] = "observacoes = ?";
                $params[] = $data['observacoes'];
            }

            if (empty($campos)) {
                resposta(['erro' => 'Nenhum campo para atualizar'], 400);
            }

            $params[] = $id;
            $sql = "UPDATE contas SET " . implode(", ", $campos) . " WHERE id = ?";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            resposta(['sucesso' => true, 'mensagem' => 'Conta atualizada com sucesso']);
            break;

        // DELETE - Excluir
        case 'DELETE':
            if (!$id) {
                resposta(['erro' => 'ID nao fornecido'], 400);
            }

            $stmt = $pdo->prepare("DELETE FROM contas WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                resposta(['sucesso' => true, 'mensagem' => 'Conta excluida com sucesso']);
            } else {
                resposta(['erro' => 'Conta nao encontrada'], 404);
            }
            break;

        default:
            resposta(['erro' => 'Metodo nao permitido'], 405);
    }

} catch (PDOException $e) {
    resposta(['erro' => 'Erro no banco de dados: ' . $e->getMessage()], 500);
} catch (Exception $e) {
    resposta(['erro' => 'Erro: ' . $e->getMessage()], 500);
}
