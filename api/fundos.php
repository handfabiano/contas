<?php
/**
 * API REST - Fundos (Entradas) e Prestação de Contas
 *
 * Cada fundo é uma ENTRADA de dinheiro e, ao mesmo tempo, uma prestação
 * de contas própria. As saídas (contas_pagar) são vinculadas via fundo_id.
 *
 * Endpoints:
 * GET    /api/fundos.php              - Lista fundos (com total gasto e saldo)
 * GET    /api/fundos.php?id=X         - Prestação de contas do fundo (agregados + saídas)
 * POST   /api/fundos.php              - Cria novo fundo (entrada)
 * PUT    /api/fundos.php?id=X         - Atualiza fundo
 * DELETE /api/fundos.php?id=X         - Exclui fundo (bloqueado se houver saídas)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responde OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Response.php';

try {
    $db = Database::getInstance();
    $method = $_SERVER['REQUEST_METHOD'];

    // GET - Listar fundos ou prestação de contas de um fundo
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            // Prestação de contas de um fundo específico
            $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
            if (!$id) {
                Response::error('ID inválido');
            }

            $sql = "SELECT
                        f.*,
                        COALESCE(SUM(c.valor), 0) AS total_saidas,
                        COALESCE(SUM(CASE WHEN c.status = 'pago' THEN c.valor ELSE 0 END), 0) AS total_pago,
                        f.valor_entrada - COALESCE(SUM(c.valor), 0) AS saldo,
                        COUNT(c.id) AS qtd_saidas
                    FROM fundos f
                    LEFT JOIN contas_pagar c ON c.fundo_id = f.id
                    WHERE f.id = ?
                    GROUP BY f.id";
            $fundo = $db->queryOne($sql, [$id]);

            if (!$fundo) {
                Response::notFound('Fundo não encontrado');
            }

            // Lista de saídas (as despesas prestadas) deste fundo
            $saidas = $db->query(
                "SELECT * FROM contas_pagar WHERE fundo_id = ? ORDER BY data_vencimento ASC",
                [$id]
            );

            $fundo['saidas'] = $saidas;
            Response::success($fundo);
        } else {
            // Lista todos os fundos com agregados
            $where = "1=1";
            $params = [];

            if (!empty($_GET['status'])) {
                $where .= " AND f.status = ?";
                $params[] = $_GET['status'];
            }

            if (!empty($_GET['mes'])) {
                $where .= " AND DATE_FORMAT(f.data_entrada, '%Y-%m') = ?";
                $params[] = $_GET['mes'];
            }

            $sql = "SELECT
                        f.*,
                        COALESCE(SUM(c.valor), 0) AS total_saidas,
                        COALESCE(SUM(CASE WHEN c.status = 'pago' THEN c.valor ELSE 0 END), 0) AS total_pago,
                        f.valor_entrada - COALESCE(SUM(c.valor), 0) AS saldo,
                        COUNT(c.id) AS qtd_saidas
                    FROM fundos f
                    LEFT JOIN contas_pagar c ON c.fundo_id = f.id
                    WHERE $where
                    GROUP BY f.id
                    ORDER BY f.data_entrada DESC";

            $fundos = $db->query($sql, $params);
            Response::success(['fundos' => $fundos]);
        }
    }

    // POST - Criar novo fundo (entrada)
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // Validação
        $required = ['descricao', 'fonte', 'valor_entrada', 'data_entrada'];
        $errors = [];

        foreach ($required as $field) {
            if (!isset($input[$field]) || $input[$field] === '' || $input[$field] === null) {
                $errors[$field] = "Campo obrigatório";
            }
        }

        if (isset($input['valor_entrada']) && floatval($input['valor_entrada']) <= 0) {
            $errors['valor_entrada'] = "Valor deve ser maior que zero";
        }

        if (!empty($errors)) {
            Response::validationError($errors);
        }

        $sql = "INSERT INTO fundos (
            descricao, fonte, valor_entrada, data_entrada,
            categoria, observacoes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

        $params = [
            trim($input['descricao']),
            trim($input['fonte']),
            floatval($input['valor_entrada']),
            $input['data_entrada'],
            $input['categoria'] ?? null,
            $input['observacoes'] ?? null,
            $input['status'] ?? 'aberto'
        ];

        if ($db->execute($sql, $params)) {
            $id = $db->lastInsertId();
            $fundo = $db->queryOne("SELECT * FROM fundos WHERE id = ?", [$id]);
            Response::success($fundo, 'Entrada registrada com sucesso', 201);
        } else {
            Response::error('Erro ao registrar entrada');
        }
    }

    // PUT - Atualizar fundo
    elseif ($method === 'PUT') {
        if (!isset($_GET['id'])) {
            Response::error('ID não informado');
        }

        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if (!$id) {
            Response::error('ID inválido');
        }

        $fundoExistente = $db->queryOne("SELECT id FROM fundos WHERE id = ?", [$id]);
        if (!$fundoExistente) {
            Response::notFound('Fundo não encontrado');
        }

        $input = json_decode(file_get_contents('php://input'), true);

        $allowed = ['descricao', 'fonte', 'valor_entrada', 'data_entrada', 'categoria', 'observacoes', 'status'];

        $updates = [];
        $params = [];

        foreach ($allowed as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $input[$field];
            }
        }

        if (empty($updates)) {
            Response::error('Nenhum campo para atualizar');
        }

        $params[] = $id;
        $sql = "UPDATE fundos SET " . implode(', ', $updates) . " WHERE id = ?";

        if ($db->execute($sql, $params)) {
            $fundo = $db->queryOne("SELECT * FROM fundos WHERE id = ?", [$id]);
            Response::success($fundo, 'Fundo atualizado com sucesso');
        } else {
            Response::error('Erro ao atualizar fundo');
        }
    }

    // DELETE - Excluir fundo (somente se não houver saídas vinculadas)
    elseif ($method === 'DELETE') {
        if (!isset($_GET['id'])) {
            Response::error('ID não informado');
        }

        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if (!$id) {
            Response::error('ID inválido');
        }

        // Verifica se há saídas vinculadas
        $vinculadas = $db->queryOne(
            "SELECT COUNT(*) as total FROM contas_pagar WHERE fundo_id = ?",
            [$id]
        );

        if (($vinculadas['total'] ?? 0) > 0) {
            Response::error(
                'Não é possível excluir: este fundo possui ' . $vinculadas['total'] . ' saída(s) vinculada(s). Exclua as saídas primeiro.',
                409
            );
        }

        if ($db->execute("DELETE FROM fundos WHERE id = ?", [$id])) {
            Response::success(null, 'Fundo excluído com sucesso');
        } else {
            Response::error('Erro ao excluir fundo');
        }
    }

    else {
        Response::error('Método não permitido', 405);
    }

} catch (Exception $e) {
    Response::internalError(DEBUG_MODE ? $e->getMessage() : 'Erro no servidor');
}
