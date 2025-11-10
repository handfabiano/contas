<?php
/**
 * API REST - Gerenciamento de Contas a Pagar
 *
 * Endpoints:
 * GET    /api/contas.php              - Lista contas (com filtros)
 * GET    /api/contas.php?id=X         - Busca conta específica
 * POST   /api/contas.php              - Cria nova conta
 * PUT    /api/contas.php?id=X         - Atualiza conta
 * DELETE /api/contas.php?id=X         - Exclui conta
 * PATCH  /api/contas.php?id=X&pagar=1 - Marca como pago
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGINS);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
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

    // GET - Listar contas ou buscar por ID
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            // Buscar conta específica
            $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
            if (!$id) {
                Response::error('ID inválido');
            }

            $sql = "SELECT * FROM contas_pagar WHERE id = ?";
            $conta = $db->queryOne($sql, [$id]);

            if (!$conta) {
                Response::notFound('Conta não encontrada');
            }

            Response::success($conta);
        } else {
            // Listar contas com filtros
            $sql = "SELECT * FROM contas_pagar WHERE 1=1";
            $params = [];

            // Filtro por status
            if (!empty($_GET['status'])) {
                $sql .= " AND status = ?";
                $params[] = $_GET['status'];
            }

            // Filtro por tipo de despesa
            if (!empty($_GET['tipo_despesa'])) {
                $sql .= " AND tipo_despesa = ?";
                $params[] = $_GET['tipo_despesa'];
            }

            // Filtro por mês/ano
            if (!empty($_GET['mes'])) {
                $sql .= " AND DATE_FORMAT(data_vencimento, '%Y-%m') = ?";
                $params[] = $_GET['mes'];
            }

            // Filtro por data inicial
            if (!empty($_GET['data_inicio'])) {
                $sql .= " AND data_vencimento >= ?";
                $params[] = $_GET['data_inicio'];
            }

            // Filtro por data final
            if (!empty($_GET['data_fim'])) {
                $sql .= " AND data_vencimento <= ?";
                $params[] = $_GET['data_fim'];
            }

            // Ordenação
            $sql .= " ORDER BY data_vencimento ASC";

            // Paginação
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 50;
            $offset = ($page - 1) * $limit;

            // Conta total de registros
            $sqlCount = str_replace("SELECT *", "SELECT COUNT(*) as total", explode("ORDER BY", $sql)[0]);
            $totalResult = $db->queryOne($sqlCount, $params);
            $total = $totalResult['total'] ?? 0;

            // Adiciona limit e offset (IMPORTANTE: não usar ? para LIMIT/OFFSET no PDO MySQL)
            // Valores já foram validados como inteiros acima
            $sql .= " LIMIT " . intval($limit) . " OFFSET " . intval($offset);

            $contas = $db->query($sql, $params);

            Response::success([
                'contas' => $contas,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        }
    }

    // POST - Criar nova conta
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // Validação
        $required = ['descricao', 'valor', 'credor', 'tipo_despesa', 'data_vencimento'];
        $errors = [];

        foreach ($required as $field) {
            if (empty($input[$field])) {
                $errors[$field] = "Campo obrigatório";
            }
        }

        if (!empty($errors)) {
            Response::validationError($errors);
        }

        // Preparar dados
        $data = [
            'descricao' => trim($input['descricao']),
            'valor' => floatval($input['valor']),
            'credor' => trim($input['credor']),
            'tipo_despesa' => $input['tipo_despesa'],
            'data_vencimento' => $input['data_vencimento'],
            'observacoes' => $input['observacoes'] ?? null,
            'status' => $input['status'] ?? 'pendente',
            'tipo_lancamento' => $input['tipo_lancamento'] ?? 'individual',
            'recorrencia_id' => $input['recorrencia_id'] ?? null,
            'parcela_atual' => $input['parcela_atual'] ?? null,
            'total_parcelas' => $input['total_parcelas'] ?? null,
            'periodicidade' => $input['periodicidade'] ?? null
        ];

        $sql = "INSERT INTO contas_pagar (
            descricao, valor, credor, tipo_despesa, data_vencimento,
            observacoes, status, tipo_lancamento, recorrencia_id,
            parcela_atual, total_parcelas, periodicidade, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $params = [
            $data['descricao'],
            $data['valor'],
            $data['credor'],
            $data['tipo_despesa'],
            $data['data_vencimento'],
            $data['observacoes'],
            $data['status'],
            $data['tipo_lancamento'],
            $data['recorrencia_id'],
            $data['parcela_atual'],
            $data['total_parcelas'],
            $data['periodicidade']
        ];

        if ($db->execute($sql, $params)) {
            $id = $db->lastInsertId();
            $conta = $db->queryOne("SELECT * FROM contas_pagar WHERE id = ?", [$id]);
            Response::success($conta, 'Conta criada com sucesso', 201);
        } else {
            Response::error('Erro ao criar conta');
        }
    }

    // PUT - Atualizar conta
    elseif ($method === 'PUT') {
        if (!isset($_GET['id'])) {
            Response::error('ID não informado');
        }

        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if (!$id) {
            Response::error('ID inválido');
        }

        // Verifica se conta existe
        $contaExistente = $db->queryOne("SELECT id FROM contas_pagar WHERE id = ?", [$id]);
        if (!$contaExistente) {
            Response::notFound('Conta não encontrada');
        }

        $input = json_decode(file_get_contents('php://input'), true);

        // Campos permitidos para atualização
        $allowed = [
            'descricao', 'valor', 'credor', 'tipo_despesa', 'data_vencimento',
            'observacoes', 'status', 'parcela_atual', 'total_parcelas'
        ];

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

        $params[] = $id; // ID para WHERE

        $sql = "UPDATE contas_pagar SET " . implode(', ', $updates) . " WHERE id = ?";

        if ($db->execute($sql, $params)) {
            $conta = $db->queryOne("SELECT * FROM contas_pagar WHERE id = ?", [$id]);
            Response::success($conta, 'Conta atualizada com sucesso');
        } else {
            Response::error('Erro ao atualizar conta');
        }
    }

    // PATCH - Ações específicas (ex: marcar como pago)
    elseif ($method === 'PATCH') {
        if (!isset($_GET['id'])) {
            Response::error('ID não informado');
        }

        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if (!$id) {
            Response::error('ID inválido');
        }

        // Marcar como pago
        if (isset($_GET['pagar'])) {
            $sql = "UPDATE contas_pagar SET status = 'pago' WHERE id = ?";
            if ($db->execute($sql, [$id])) {
                $conta = $db->queryOne("SELECT * FROM contas_pagar WHERE id = ?", [$id]);
                Response::success($conta, 'Conta marcada como paga');
            } else {
                Response::error('Erro ao atualizar status');
            }
        }

        Response::error('Ação não especificada');
    }

    // DELETE - Excluir conta
    elseif ($method === 'DELETE') {
        if (!isset($_GET['id'])) {
            Response::error('ID não informado');
        }

        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if (!$id) {
            Response::error('ID inválido');
        }

        $sql = "DELETE FROM contas_pagar WHERE id = ?";

        if ($db->execute($sql, [$id])) {
            Response::success(null, 'Conta excluída com sucesso');
        } else {
            Response::error('Erro ao excluir conta');
        }
    }

    else {
        Response::error('Método não permitido', 405);
    }

} catch (Exception $e) {
    Response::internalError(DEBUG_MODE ? $e->getMessage() : 'Erro no servidor');
}
