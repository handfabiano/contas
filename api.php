<?php
/**
 * API REST - Sistema de Contas a Pagar
 * Tabela: contas_pagar (com parcelas e recorrência)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuração
define('DB_HOST', 'localhost');
define('DB_NAME', 'u320952164_Conta');
define('DB_USER', 'u320952164_Conta');
define('DB_PASS', 'Vieira@2025');

// Conexão
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

$method = $_SERVER['REQUEST_METHOD'];
$acao = $_GET['acao'] ?? 'listar';
$id = $_GET['id'] ?? null;

function resposta($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function gerarUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

try {
    switch ($method) {

        case 'GET':
            if ($acao === 'listar') {
                $where = [];
                $params = [];

                if (isset($_GET['status'])) {
                    $where[] = "status = ?";
                    $params[] = $_GET['status'];
                }

                if (isset($_GET['tipo_despesa'])) {
                    $where[] = "tipo_despesa = ?";
                    $params[] = $_GET['tipo_despesa'];
                }

                if (isset($_GET['mes'])) {
                    $where[] = "DATE_FORMAT(data_vencimento, '%Y-%m') = ?";
                    $params[] = $_GET['mes'];
                }

                $sql = "SELECT * FROM contas_pagar";
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
                $mes = $_GET['mes'] ?? date('Y-m');

                // Totais por status
                $stmt = $pdo->prepare("
                    SELECT
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as pendente,
                        SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as pago,
                        SUM(CASE WHEN status = 'atrasado' THEN valor ELSE 0 END) as atrasado
                    FROM contas_pagar
                    WHERE DATE_FORMAT(data_vencimento, '%Y-%m') = ?
                ");
                $stmt->execute([$mes]);
                $dashboard = $stmt->fetch();

                // Por tipo de despesa
                $stmt = $pdo->prepare("
                    SELECT tipo_despesa, SUM(valor) as total, COUNT(*) as quantidade
                    FROM contas_pagar
                    WHERE DATE_FORMAT(data_vencimento, '%Y-%m') = ?
                    GROUP BY tipo_despesa
                    ORDER BY total DESC
                ");
                $stmt->execute([$mes]);
                $porTipo = $stmt->fetchAll();

                resposta([
                    'sucesso' => true,
                    'mes' => $mes,
                    'totais' => $dashboard,
                    'porTipo' => $porTipo
                ]);
            }

            elseif ($id) {
                $stmt = $pdo->prepare("SELECT * FROM contas_pagar WHERE id = ?");
                $stmt->execute([$id]);
                $conta = $stmt->fetch();

                if ($conta) {
                    resposta(['sucesso' => true, 'conta' => $conta]);
                } else {
                    resposta(['erro' => 'Conta nao encontrada'], 404);
                }
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                resposta(['erro' => 'Dados invalidos'], 400);
            }

            $descricao = $data['descricao'] ?? null;
            $valor = $data['valor'] ?? null;
            $credor = $data['credor'] ?? null;
            $tipo_despesa = $data['tipo_despesa'] ?? 'outros';
            $data_vencimento = $data['data_vencimento'] ?? null;
            $observacoes = $data['observacoes'] ?? null;
            $tipo_lancamento = $data['tipo_lancamento'] ?? 'individual';

            // Validar campos obrigatórios
            if (!$descricao || !$valor || !$credor || !$data_vencimento) {
                resposta(['erro' => 'Campos obrigatorios: descricao, valor, credor, data_vencimento'], 400);
            }

            // PARCELAMENTO
            if ($tipo_lancamento === 'parcelado') {
                $total_parcelas = $data['total_parcelas'] ?? 1;
                $valor_parcela = $valor / $total_parcelas;
                $recorrencia_id = gerarUUID();

                $pdo->beginTransaction();

                try {
                    for ($i = 1; $i <= $total_parcelas; $i++) {
                        $vencimento_parcela = date('Y-m-d', strtotime($data_vencimento . " +" . ($i - 1) . " months"));
                        $desc_parcela = $descricao . " - Parcela $i/$total_parcelas";

                        $stmt = $pdo->prepare("
                            INSERT INTO contas_pagar
                            (descricao, valor, credor, tipo_despesa, data_vencimento, observacoes, status,
                             tipo_lancamento, recorrencia_id, parcela_atual, total_parcelas)
                            VALUES (?, ?, ?, ?, ?, ?, 'pendente', 'recorrente', ?, ?, ?)
                        ");

                        $stmt->execute([
                            $desc_parcela, $valor_parcela, $credor, $tipo_despesa,
                            $vencimento_parcela, $observacoes, $recorrencia_id, $i, $total_parcelas
                        ]);
                    }

                    $pdo->commit();
                    resposta([
                        'sucesso' => true,
                        'mensagem' => "$total_parcelas parcelas criadas com sucesso",
                        'recorrencia_id' => $recorrencia_id
                    ], 201);

                } catch (Exception $e) {
                    $pdo->rollBack();
                    throw $e;
                }
            }

            // RECORRÊNCIA
            elseif ($tipo_lancamento === 'recorrente') {
                $periodicidade = $data['periodicidade'] ?? 'mensal';
                $quantidade = $data['quantidade'] ?? 12;
                $recorrencia_id = gerarUUID();

                $pdo->beginTransaction();

                try {
                    for ($i = 0; $i < $quantidade; $i++) {
                        switch ($periodicidade) {
                            case 'semanal':
                                $vencimento = date('Y-m-d', strtotime($data_vencimento . " +$i weeks"));
                                break;
                            case 'quinzenal':
                                $dias = $i * 15;
                                $vencimento = date('Y-m-d', strtotime($data_vencimento . " +$dias days"));
                                break;
                            case 'anual':
                                $vencimento = date('Y-m-d', strtotime($data_vencimento . " +$i years"));
                                break;
                            default: // mensal
                                $vencimento = date('Y-m-d', strtotime($data_vencimento . " +$i months"));
                        }

                        $stmt = $pdo->prepare("
                            INSERT INTO contas_pagar
                            (descricao, valor, credor, tipo_despesa, data_vencimento, observacoes, status,
                             tipo_lancamento, recorrencia_id, periodicidade)
                            VALUES (?, ?, ?, ?, ?, ?, 'pendente', 'recorrente', ?, ?)
                        ");

                        $stmt->execute([
                            $descricao, $valor, $credor, $tipo_despesa,
                            $vencimento, $observacoes, $recorrencia_id, $periodicidade
                        ]);
                    }

                    $pdo->commit();
                    resposta([
                        'sucesso' => true,
                        'mensagem' => "$quantidade contas recorrentes criadas com sucesso",
                        'recorrencia_id' => $recorrencia_id
                    ], 201);

                } catch (Exception $e) {
                    $pdo->rollBack();
                    throw $e;
                }
            }

            // INDIVIDUAL
            else {
                $stmt = $pdo->prepare("
                    INSERT INTO contas_pagar
                    (descricao, valor, credor, tipo_despesa, data_vencimento, observacoes, status, tipo_lancamento)
                    VALUES (?, ?, ?, ?, ?, ?, 'pendente', 'individual')
                ");

                $stmt->execute([
                    $descricao, $valor, $credor, $tipo_despesa,
                    $data_vencimento, $observacoes
                ]);

                resposta([
                    'sucesso' => true,
                    'mensagem' => 'Conta criada com sucesso',
                    'id' => $pdo->lastInsertId()
                ], 201);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$id) {
                resposta(['erro' => 'ID nao fornecido'], 400);
            }

            // Verificar se existe
            $stmt = $pdo->prepare("SELECT id FROM contas_pagar WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                resposta(['erro' => 'Conta nao encontrada'], 404);
            }

            $campos = [];
            $params = [];

            $permitidos = ['descricao', 'valor', 'credor', 'tipo_despesa', 'data_vencimento', 'observacoes', 'status'];

            foreach ($permitidos as $campo) {
                if (isset($data[$campo])) {
                    $campos[] = "$campo = ?";
                    $params[] = $data[$campo];
                }
            }

            if (empty($campos)) {
                resposta(['erro' => 'Nenhum campo para atualizar'], 400);
            }

            $params[] = $id;
            $sql = "UPDATE contas_pagar SET " . implode(", ", $campos) . " WHERE id = ?";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            resposta(['sucesso' => true, 'mensagem' => 'Conta atualizada com sucesso']);
            break;

        case 'DELETE':
            if (!$id) {
                resposta(['erro' => 'ID nao fornecido'], 400);
            }

            $stmt = $pdo->prepare("DELETE FROM contas_pagar WHERE id = ?");
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
