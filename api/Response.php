<?php
/**
 * Classe para padronizar respostas da API
 */

class Response {
    /**
     * Envia resposta de sucesso
     */
    public static function success($data = null, $message = 'Sucesso', $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Envia resposta de erro
     */
    public static function error($message = 'Erro', $statusCode = 400, $errors = null) {
        http_response_code($statusCode);
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Envia resposta não autorizada
     */
    public static function unauthorized($message = 'Não autorizado') {
        self::error($message, 401);
    }

    /**
     * Envia resposta não encontrado
     */
    public static function notFound($message = 'Recurso não encontrado') {
        self::error($message, 404);
    }

    /**
     * Envia resposta de validação
     */
    public static function validationError($errors, $message = 'Erro de validação') {
        self::error($message, 422, $errors);
    }

    /**
     * Envia resposta de erro interno
     */
    public static function internalError($message = 'Erro interno do servidor') {
        self::error($message, 500);
    }
}
