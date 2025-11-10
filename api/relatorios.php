<?php
/**
 * API REST - Relatórios e Estatísticas
 *
 * Endpoints:
 * GET /api/relatorios.php?tipo=resumo        - Resumo geral
 * GET /api/relatorios.php?tipo=por_status    - Totais por status
 * GET /api/relatorios.php?tipo=por_tipo      - Totais por tipo de despesa
 * GET /api/relatorios.php?tipo=mensal        - Relatório mensal
 * GET /api/relatorios.php?tipo=vencimentos   - Próximos vencimentos
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGINS);
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Response.php';

try {
    $db = Database::getInstance();

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        Response::error('Método não permitido', 405);
    }

    $tipo = $_GET['tipo'] ?? 'resumo';

    // Filtros de data
    $dataInicio = $_GET['data_inicio'] ?? null;
    $dataFim = $_GET['data_fim'] ?? null;
    $mes = $_GET['mes'] ?? null;

    // RESUMO GERAL
    if ($tipo === 'resumo') {
        $where = "1=1";
        $params = [];

        if ($mes) {
            $where .= " AND DATE_FORMAT(data_vencimento, '%Y-%m') = ?";
            $params[] = $mes;
        } elseif ($dataInicio && $dataFim) {
            $where .= " AND data_vencimento BETWEEN ? AND ?";
            $params[] = $dataInicio;
            $params[] = $dataFim;
        }

        // Total geral
        $sql = "SELECT
                    COUNT(*) as total_contas,
                    COALESCE(SUM(valor), 0) as valor_total,
                    COALESCE(AVG(valor), 0) as valor_medio
                FROM contas_pagar
                WHERE $where";
        $resumo = $db->queryOne($sql, $params);

        // Por status
        $sql = "SELECT
                    status,
                    COUNT(*) as quantidade,
                    COALESCE(SUM(valor), 0) as total
                FROM contas_pagar
                WHERE $where
                GROUP BY status";
        $porStatus = $db->query($sql, $params);

        // Contas vencidas (atrasadas)
        $sql = "SELECT
                    COUNT(*) as quantidade,
                    COALESCE(SUM(valor), 0) as total
                FROM contas_pagar
                WHERE status = 'pendente'
                AND data_vencimento < CURDATE()
                AND $where";
        $atrasadas = $db->queryOne($sql, $params);

        // Próximos 7 dias
        $sql = "SELECT
                    COUNT(*) as quantidade,
                    COALESCE(SUM(valor), 0) as total
                FROM contas_pagar
                WHERE status = 'pendente'
                AND data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                AND $where";
        $proximos7Dias = $db->queryOne($sql, $params);

        Response::success([
            'resumo' => $resumo,
            'por_status' => $porStatus,
            'atrasadas' => $atrasadas,
            'proximos_7_dias' => $proximos7Dias
        ]);
    }

    // TOTAIS POR STATUS
    elseif ($tipo === 'por_status') {
        $where = "1=1";
        $params = [];

        if ($mes) {
            $where .= " AND DATE_FORMAT(data_vencimento, '%Y-%m') = ?";
            $params[] = $mes;
        }

        $sql = "SELECT
                    status,
                    COUNT(*) as quantidade,
                    COALESCE(SUM(valor), 0) as total,
                    COALESCE(AVG(valor), 0) as media
                FROM contas_pagar
                WHERE $where
                GROUP BY status
                ORDER BY total DESC";

        $dados = $db->query($sql, $params);
        Response::success($dados);
    }

    // TOTAIS POR TIPO DE DESPESA
    elseif ($tipo === 'por_tipo') {
        $where = "1=1";
        $params = [];

        if ($mes) {
            $where .= " AND DATE_FORMAT(data_vencimento, '%Y-%m') = ?";
            $params[] = $mes;
        }

        $sql = "SELECT
                    tipo_despesa,
                    COUNT(*) as quantidade,
                    COALESCE(SUM(valor), 0) as total,
                    COALESCE(AVG(valor), 0) as media,
                    ROUND(SUM(valor) * 100.0 / (SELECT SUM(valor) FROM contas_pagar WHERE $where), 2) as percentual
                FROM contas_pagar
                WHERE $where
                GROUP BY tipo_despesa
                ORDER BY total DESC";

        $dados = $db->query($sql, $params);
        Response::success($dados);
    }

    // RELATÓRIO MENSAL
    elseif ($tipo === 'mensal') {
        $meses = $_GET['meses'] ?? 6; // Últimos 6 meses por padrão
        $meses = min(24, max(1, intval($meses))); // Entre 1 e 24 meses

        $sql = "SELECT
                    DATE_FORMAT(data_vencimento, '%Y-%m') as mes,
                    DATE_FORMAT(data_vencimento, '%Y-%m-01') as data_mes,
                    COUNT(*) as quantidade,
                    COALESCE(SUM(valor), 0) as total,
                    COALESCE(SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END), 0) as total_pago,
                    COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END), 0) as total_pendente,
                    COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor ELSE 0 END), 0) as total_atrasado
                FROM contas_pagar
                WHERE data_vencimento >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
                GROUP BY DATE_FORMAT(data_vencimento, '%Y-%m')
                ORDER BY mes ASC";

        $dados = $db->query($sql, [$meses]);
        Response::success($dados);
    }

    // PRÓXIMOS VENCIMENTOS
    elseif ($tipo === 'vencimentos') {
        $dias = $_GET['dias'] ?? 30; // Próximos 30 dias por padrão
        $dias = min(90, max(1, intval($dias))); // Entre 1 e 90 dias

        $sql = "SELECT
                    *,
                    DATEDIFF(data_vencimento, CURDATE()) as dias_restantes
                FROM contas_pagar
                WHERE status = 'pendente'
                AND data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
                ORDER BY data_vencimento ASC
                LIMIT 50";

        $dados = $db->query($sql, [$dias]);
        Response::success($dados);
    }

    // DASHBOARD (dados consolidados)
    elseif ($tipo === 'dashboard') {
        $mes = $_GET['mes'] ?? date('Y-m');

        // Total a pagar no mês
        $sql = "SELECT COALESCE(SUM(valor), 0) as total
                FROM contas_pagar
                WHERE DATE_FORMAT(data_vencimento, '%Y-%m') = ?
                AND status = 'pendente'";
        $totalPendente = $db->queryOne($sql, [$mes]);

        // Total pago no mês
        $sql = "SELECT COALESCE(SUM(valor), 0) as total
                FROM contas_pagar
                WHERE DATE_FORMAT(data_vencimento, '%Y-%m') = ?
                AND status = 'pago'";
        $totalPago = $db->queryOne($sql, [$mes]);

        // Total atrasado
        $sql = "SELECT COALESCE(SUM(valor), 0) as total
                FROM contas_pagar
                WHERE status = 'pendente'
                AND data_vencimento < CURDATE()";
        $totalAtrasado = $db->queryOne($sql);

        // Conta por tipo
        $sql = "SELECT
                    tipo_despesa,
                    COALESCE(SUM(valor), 0) as total
                FROM contas_pagar
                WHERE DATE_FORMAT(data_vencimento, '%Y-%m') = ?
                GROUP BY tipo_despesa
                ORDER BY total DESC
                LIMIT 5";
        $porTipo = $db->query($sql, [$mes]);

        Response::success([
            'mes' => $mes,
            'total_pendente' => $totalPendente['total'],
            'total_pago' => $totalPago['total'],
            'total_atrasado' => $totalAtrasado['total'],
            'total_mes' => $totalPendente['total'] + $totalPago['total'],
            'por_tipo' => $porTipo
        ]);
    }

    else {
        Response::error('Tipo de relatório inválido');
    }

} catch (Exception $e) {
    Response::internalError(DEBUG_MODE ? $e->getMessage() : 'Erro no servidor');
}
